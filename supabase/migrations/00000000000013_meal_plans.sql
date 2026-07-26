-- Phase 6: nutritionist meal plans (mirror of doctor medication plans).
-- SPEC §4: the nutritionist has a "meal plan editor". Structured per-meal items
-- + guidance, authored by the pod nutritionist, visible to the patient + care
-- team, with an audit trail for the clinical record.

-- Is the current user the pod nutritionist for patient p (or admin)?
create or replace function public.is_pod_nutritionist(p uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1
    from public.cohort_members cm
    join public.care_pods cp on cp.cohort_id = cm.cohort_id
    where cm.patient_id = p
      and cp.nutritionist_id = auth.uid()
      and public.sehat_role() = 'nutritionist'
  );
$$;

create table public.meal_plans (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid not null references public.profiles (id) on delete cascade,
  created_by     uuid not null references public.profiles (id),
  -- [{ meal: breakfast|lunch|dinner|snack, description, carb_target_g }]
  meals          jsonb not null default '[]'::jsonb,
  notes          text,
  effective_from date not null default (now() at time zone 'Asia/Karachi')::date,
  created_at     timestamptz not null default now()
);
create index on public.meal_plans (patient_id, effective_from desc);

create table public.meal_plan_audit (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.meal_plans (id) on delete cascade,
  changed_by uuid not null references public.profiles (id),
  changed_at timestamptz not null default now(),
  before     jsonb,
  after      jsonb
);

alter table public.meal_plans enable row level security;
alter table public.meal_plan_audit enable row level security;

-- Patient + care team read; only the pod nutritionist (or admin) writes.
create policy meal_plans_read on public.meal_plans
  for select using (patient_id = auth.uid() or public.staff_sees_patient(patient_id));
create policy meal_plans_nutritionist_insert on public.meal_plans
  for insert with check (public.is_pod_nutritionist(patient_id) and created_by = auth.uid());
create policy meal_plans_nutritionist_update on public.meal_plans
  for update using (public.is_pod_nutritionist(patient_id)) with check (public.is_pod_nutritionist(patient_id));

create policy meal_audit_read on public.meal_plan_audit
  for select using (
    exists (select 1 from public.meal_plans mp where mp.id = plan_id
              and (mp.patient_id = auth.uid() or public.staff_sees_patient(mp.patient_id)))
  );

-- Guaranteed audit on every change (mirror of medication_plan_audit).
create or replace function public.meal_plan_audit_fn()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.meal_plan_audit (plan_id, changed_by, before, after)
  values (
    NEW.id,
    coalesce(auth.uid(), NEW.created_by),
    case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end,
    to_jsonb(NEW)
  );
  return NEW;
end;
$$;

create trigger trg_meal_plan_audit
  after insert or update on public.meal_plans
  for each row execute function public.meal_plan_audit_fn();
