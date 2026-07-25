-- Phase 3: let care relationships read each other's profile (names).
-- Phase 0 only allowed "read own", which blanks pod-staff names for patients
-- and patient names for staff, and 404s the doctor's patient-detail page.
-- SECURITY DEFINER helper avoids RLS recursion across cohort_members/care_pods.

create or replace function public.can_view_profile(target uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select
    auth.uid() = target
    or public.is_admin()
    or public.staff_sees_patient(target)   -- staff -> their pod patient
    or public.shares_cohort(target)         -- patient -> cohort-mate
    or exists (                             -- patient -> their pod staff
      select 1
      from public.cohort_members cm
      join public.care_pods cp on cp.cohort_id = cm.cohort_id
      where cm.patient_id = auth.uid()
        and target in (cp.doctor_id, cp.nutritionist_id, cp.coach_id)
    );
$$;

drop policy if exists "profiles: read visible" on public.profiles;
create policy "profiles: read visible"
  on public.profiles for select
  using (public.can_view_profile(id));
