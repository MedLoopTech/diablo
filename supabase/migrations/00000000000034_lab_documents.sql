-- Lab results (structured values) and documents (uploaded files) — the actual
-- outcome evidence for a 90-day remission program. Either the patient or a
-- pod staff member can upload a report; only the pod doctor (or admin) can
-- enter/edit the structured values, mirroring medication_plans' doctor-only
-- write model. Ported from DocPortal's clinic-scoped equivalent, rescoped to
-- Sehat/90's cohort/pod model via the existing staff_sees_patient() helper.

create type public.document_kind as enum (
  'lab_report', 'prescription', 'imaging', 'discharge_summary', 'referral', 'other'
);

create table public.documents (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  kind       public.document_kind not null default 'other',
  title      text not null,
  storage_path text not null,   -- object key in the 'clinical-records' storage bucket
  mime_type  text,
  size_bytes int,
  taken_on   date,
  -- True immediately for both patient- and staff-initiated uploads (a patient
  -- always sees their own upload; staff can still unshare afterwards if a
  -- report shouldn't be shown yet).
  shared_with_patient boolean not null default true,
  uploaded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
create index on public.documents (patient_id, created_at desc);

-- Structured values, whether typed in by the doctor or extracted from a report.
create table public.lab_results (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.profiles (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  analyte     text not null,           -- 'hba1c', 'ldl', 'creatinine', 'egfr', 'tsh', ...
  label       text not null,
  value       numeric(10, 3) not null,
  unit        text not null,
  ref_low     numeric(10, 3),
  ref_high    numeric(10, 3),
  flag        text not null default 'normal' check (flag in ('low', 'normal', 'high')),
  taken_on    date not null default current_date,
  entered_by  uuid not null references public.profiles (id),
  created_at  timestamptz not null default now()
);
create index on public.lab_results (patient_id, taken_on desc);

-- Flag is derived, never client-settable — computed from the reference range
-- supplied alongside the value.
create or replace function public.set_lab_flag()
returns trigger language plpgsql as $$
begin
  new.flag := case
    when new.ref_low  is not null and new.value < new.ref_low  then 'low'
    when new.ref_high is not null and new.value > new.ref_high then 'high'
    else 'normal'
  end;
  return new;
end;
$$;

create trigger lab_flag_trigger
  before insert or update on public.lab_results
  for each row execute function public.set_lab_flag();

alter table public.documents   enable row level security;
alter table public.lab_results enable row level security;

-- ————————————————————————————————— documents —————————————————————————————————
-- A patient always sees their own uploads; staff uploads only once shared.
create policy documents_patient_read on public.documents
  for select using (
    patient_id = auth.uid() and (shared_with_patient or uploaded_by = auth.uid())
  );
create policy documents_patient_insert on public.documents
  for insert with check (patient_id = auth.uid() and uploaded_by = auth.uid());
-- A patient can remove a report they added themselves, not one staff shared.
create policy documents_patient_delete on public.documents
  for delete using (patient_id = auth.uid() and uploaded_by = auth.uid());

-- Pod staff have full access (upload on a patient's behalf, toggle sharing,
-- delete) — same reach as staff_sees_patient grants everywhere else.
create policy documents_staff_rw on public.documents
  for all using (public.staff_sees_patient(patient_id))
  with check (public.staff_sees_patient(patient_id));

-- ————————————————————————————————— lab results —————————————————————————————————
create policy labs_patient_read on public.lab_results
  for select using (patient_id = auth.uid());

-- Nutritionist/coach can see labs (staff_sees_patient) but only the pod
-- doctor or admin can write values — same boundary as medication_plans.
create policy labs_staff_read on public.lab_results
  for select using (public.staff_sees_patient(patient_id));
create policy labs_doctor_insert on public.lab_results
  for insert with check (public.is_pod_doctor(patient_id) and entered_by = auth.uid());
create policy labs_doctor_update on public.lab_results
  for update using (public.is_pod_doctor(patient_id)) with check (public.is_pod_doctor(patient_id));
create policy labs_doctor_delete on public.lab_results
  for delete using (public.is_pod_doctor(patient_id));

-- ————————————————————————————————— storage —————————————————————————————————
-- Private bucket. All access goes through server-side routes using the
-- service-role client (same convention as PHOTO_BUCKET) — authorization is
-- enforced in application code before touching storage, and no client ever
-- talks to storage.objects directly, so no storage.objects RLS is needed.
insert into storage.buckets (id, name, public)
values ('clinical-records', 'clinical-records', false)
on conflict (id) do nothing;
