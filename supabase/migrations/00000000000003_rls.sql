-- Phase 1: Row Level Security for every §1 table.
-- Model: patients see their own data + what their cohort shares (feed, leaderboard);
-- pod staff see patients in cohorts they are assigned to; admin sees everything.
--
-- Helpers are SECURITY DEFINER so that a policy on table A can consult membership
-- in table B without tripping A's/B's own RLS (which would recurse or deny).

-- ————————————————————————————————— helpers —————————————————————————————————
-- Named sehat_role (not current_role) — current_role is a reserved SQL keyword.
create or replace function public.sehat_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.sehat_role() = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    public.sehat_role() in ('doctor', 'nutritionist', 'coach', 'admin'),
    false
  );
$$;

-- Is the current user a doctor (pod doctor or admin) able to write meds for p?
create or replace function public.is_pod_doctor(p uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1
    from public.cohort_members cm
    join public.care_pods cp on cp.cohort_id = cm.cohort_id
    where cm.patient_id = p
      and cp.doctor_id = auth.uid()
      and public.sehat_role() = 'doctor'
  );
$$;

-- Can the current staff member see this patient (assigned to their pod)?
create or replace function public.staff_sees_patient(p uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1
    from public.cohort_members cm
    join public.care_pods cp on cp.cohort_id = cm.cohort_id
    where cm.patient_id = p
      and auth.uid() in (cp.doctor_id, cp.nutritionist_id, cp.coach_id)
  );
$$;

-- Does the current user share a cohort with patient p (both patients)?
create or replace function public.shares_cohort(p uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.cohort_members a
    join public.cohort_members b on a.cohort_id = b.cohort_id
    where a.patient_id = auth.uid() and b.patient_id = p
  );
$$;

-- Is the current user a member of this cohort (patient or pod staff)?
create or replace function public.in_cohort(c uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
    or exists (select 1 from public.cohort_members where cohort_id = c and patient_id = auth.uid())
    or exists (select 1 from public.care_pods where cohort_id = c
                 and auth.uid() in (doctor_id, nutritionist_id, coach_id));
$$;

-- ————————————————————————————————— enable RLS —————————————————————————————————
alter table public.cohorts             enable row level security;
alter table public.cohort_members      enable row level security;
alter table public.care_pods           enable row level security;
alter table public.glucose_readings    enable row level security;
alter table public.meals               enable row level security;
alter table public.tasks               enable row level security;
alter table public.task_templates      enable row level security;
alter table public.consult_windows     enable row level security;
alter table public.consult_bookings    enable row level security;
alter table public.medication_plans    enable row level security;
alter table public.medication_plan_audit enable row level security;
alter table public.escalations         enable row level security;
alter table public.chat_messages       enable row level security;
alter table public.posts               enable row level security;
alter table public.post_reactions      enable row level security;
alter table public.post_replies        enable row level security;
alter table public.points_ledger       enable row level security;
alter table public.progress_snapshots  enable row level security;

-- ————————————————————————————————— cohorts / membership —————————————————————————————————
create policy cohorts_member_read on public.cohorts
  for select using (public.in_cohort(id));

create policy cohort_members_read on public.cohort_members
  for select using (
    patient_id = auth.uid() or public.shares_cohort(patient_id) or public.staff_sees_patient(patient_id)
  );

create policy care_pods_read on public.care_pods
  for select using (public.in_cohort(cohort_id));

-- ————————————————————————————————— glucose —————————————————————————————————
create policy glucose_patient_rw on public.glucose_readings
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy glucose_staff_read on public.glucose_readings
  for select using (public.staff_sees_patient(patient_id));

-- ————————————————————————————————— meals —————————————————————————————————
create policy meals_patient_rw on public.meals
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy meals_staff_read on public.meals
  for select using (public.staff_sees_patient(patient_id));

-- ————————————————————————————————— tasks —————————————————————————————————
-- Rows are generated by a SECURITY DEFINER function; patients read + complete their own.
create policy tasks_patient_rw on public.tasks
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy tasks_staff_read on public.tasks
  for select using (public.staff_sees_patient(patient_id));

-- Task templates are non-sensitive program content; any authenticated user may read.
create policy task_templates_read on public.task_templates
  for select using (auth.role() = 'authenticated');

-- ————————————————————————————————— consults —————————————————————————————————
-- Staff manage their own windows; any cohort patient can see windows to book.
create policy consult_windows_staff_rw on public.consult_windows
  for all using (staff_id = auth.uid()) with check (staff_id = auth.uid());
create policy consult_windows_patient_read on public.consult_windows
  for select using (public.is_staff() = false and auth.role() = 'authenticated');

create policy consult_bookings_patient_rw on public.consult_bookings
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy consult_bookings_staff_read on public.consult_bookings
  for select using (
    public.staff_sees_patient(patient_id)
    or exists (select 1 from public.consult_windows w where w.id = window_id and w.staff_id = auth.uid())
  );

-- ————————————————————————————————— medication (doctor-only writes) —————————————————————————————————
create policy med_plans_patient_read on public.medication_plans
  for select using (patient_id = auth.uid() or public.staff_sees_patient(patient_id));
create policy med_plans_doctor_insert on public.medication_plans
  for insert with check (public.is_pod_doctor(patient_id) and created_by = auth.uid());
create policy med_plans_doctor_update on public.medication_plans
  for update using (public.is_pod_doctor(patient_id)) with check (public.is_pod_doctor(patient_id));

create policy med_audit_read on public.medication_plan_audit
  for select using (
    exists (select 1 from public.medication_plans mp where mp.id = plan_id
              and (mp.patient_id = auth.uid() or public.staff_sees_patient(mp.patient_id)))
  );
create policy med_audit_doctor_insert on public.medication_plan_audit
  for insert with check (changed_by = auth.uid() and public.is_staff());

-- ————————————————————————————————— escalations —————————————————————————————————
-- Created by SECURITY DEFINER triggers/functions; patients read own, staff read/act on assigned.
create policy escalations_patient_read on public.escalations
  for select using (patient_id = auth.uid());
create policy escalations_patient_insert on public.escalations
  for insert with check (patient_id = auth.uid());  -- patient_flagged
create policy escalations_staff_read on public.escalations
  for select using (assigned_to = auth.uid() or public.staff_sees_patient(patient_id));
create policy escalations_staff_update on public.escalations
  for update using (assigned_to = auth.uid() or public.staff_sees_patient(patient_id))
  with check (assigned_to = auth.uid() or public.staff_sees_patient(patient_id));

-- ————————————————————————————————— chat —————————————————————————————————
create policy chat_patient_rw on public.chat_messages
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy chat_staff_read on public.chat_messages
  for select using (public.staff_sees_patient(patient_id));

-- ————————————————————————————————— cohort feed —————————————————————————————————
create policy posts_cohort_read on public.posts
  for select using (public.in_cohort(cohort_id));
create policy posts_author_write on public.posts
  for insert with check (author_id = auth.uid() and public.in_cohort(cohort_id));
create policy posts_author_modify on public.posts
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy posts_author_delete on public.posts
  for delete using (author_id = auth.uid());

create policy reactions_cohort_read on public.post_reactions
  for select using (exists (select 1 from public.posts p where p.id = post_id and public.in_cohort(p.cohort_id)));
create policy reactions_own_write on public.post_reactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy replies_cohort_read on public.post_replies
  for select using (exists (select 1 from public.posts p where p.id = post_id and public.in_cohort(p.cohort_id)));
create policy replies_author_write on public.post_replies
  for insert with check (author_id = auth.uid()
    and exists (select 1 from public.posts p where p.id = post_id and public.in_cohort(p.cohort_id)));

-- ————————————————————————————————— points & progress —————————————————————————————————
-- Written by SECURITY DEFINER functions; patients read own, cohort-mates read for leaderboard.
create policy points_patient_read on public.points_ledger
  for select using (patient_id = auth.uid() or public.shares_cohort(patient_id) or public.staff_sees_patient(patient_id));

create policy progress_read on public.progress_snapshots
  for select using (patient_id = auth.uid() or public.staff_sees_patient(patient_id));
