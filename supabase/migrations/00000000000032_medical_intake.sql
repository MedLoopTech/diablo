-- Medical history: one row per patient (upsertable), editable by patient during
-- onboarding and by their pod doctor afterwards. Pod staff get read access.

create table public.medical_history (
  id                uuid        primary key default gen_random_uuid(),
  patient_id        uuid        not null references public.profiles(id) on delete cascade,
  diabetes_type     text        check (diabetes_type in ('type2','type1','prediabetes','gestational','other')),
  diagnosis_year    int         check (diagnosis_year >= 1900 and diagnosis_year <= 2100),
  allergies         text[]      not null default '{}',
  comorbidities     text[]      not null default '{}',
  pre_existing_meds jsonb       not null default '[]',   -- [{name,dose,frequency}]
  family_history    text,
  notes             text,
  updated_by        uuid        references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint medical_history_patient_unique unique (patient_id)
);

alter table public.medical_history enable row level security;

-- Patient reads/writes their own row
create policy "mh_patient_rw" on public.medical_history
  for all
  using  (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- All pod staff (doctor, nutritionist, coach) can read
create policy "mh_staff_read" on public.medical_history
  for select
  using (public.staff_sees_patient(patient_id));

-- Pod doctor can also write/update (in addition to patient)
create policy "mh_doctor_write" on public.medical_history
  for all
  using  (public.is_pod_doctor(patient_id))
  with check (public.is_pod_doctor(patient_id));

-- Reusable updated_at stamper (created once, idempotent)
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger mh_updated_at
  before update on public.medical_history
  for each row execute function public.handle_updated_at();
