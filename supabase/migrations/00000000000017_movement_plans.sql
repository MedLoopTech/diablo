-- Phase 8: coach movement plans (mirror of nutritionist meal plans).
-- The fitness/movement coach assigns structured exercise plans to patients,
-- visible to the patient and full care team, with a full audit trail.

-- Is the current user the pod coach for patient p (or admin)?
create or replace function public.is_pod_coach(p uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1
    from public.cohort_members cm
    join public.care_pods cp on cp.cohort_id = cm.cohort_id
    where cm.patient_id = p
      and cp.coach_id = auth.uid()
      and public.sehat_role() = 'coach'
  );
$$;

-- Each row is one exercise: name, duration (cardio) or sets/reps (strength), notes.
create table public.movement_plans (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid not null references public.profiles (id) on delete cascade,
  created_by     uuid not null references public.profiles (id),
  -- [{ name, category, duration_min, sets, reps, notes }]
  exercises      jsonb not null default '[]'::jsonb,
  notes          text,
  effective_from date not null default (now() at time zone 'Asia/Karachi')::date,
  created_at     timestamptz not null default now()
);
create index on public.movement_plans (patient_id, effective_from desc);

create table public.movement_plan_audit (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.movement_plans (id) on delete cascade,
  changed_by uuid not null references public.profiles (id),
  changed_at timestamptz not null default now(),
  before     jsonb,
  after      jsonb
);

alter table public.movement_plans enable row level security;
alter table public.movement_plan_audit enable row level security;

-- Patient + care team read; only the pod coach (or admin) writes.
create policy movement_plans_read on public.movement_plans
  for select using (patient_id = auth.uid() or public.staff_sees_patient(patient_id));
create policy movement_plans_coach_insert on public.movement_plans
  for insert with check (public.is_pod_coach(patient_id) and created_by = auth.uid());
create policy movement_plans_coach_update on public.movement_plans
  for update using (public.is_pod_coach(patient_id)) with check (public.is_pod_coach(patient_id));

create policy movement_audit_read on public.movement_plan_audit
  for select using (
    exists (select 1 from public.movement_plans mp where mp.id = plan_id
              and (mp.patient_id = auth.uid() or public.staff_sees_patient(mp.patient_id)))
  );

-- Audit trigger on every change.
create or replace function public.movement_plan_audit_fn()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.movement_plan_audit (plan_id, changed_by, before, after)
  values (
    NEW.id,
    coalesce(auth.uid(), NEW.created_by),
    case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end,
    to_jsonb(NEW)
  );
  return NEW;
end;
$$;

create trigger trg_movement_plan_audit
  after insert or update on public.movement_plans
  for each row execute function public.movement_plan_audit_fn();
