-- Phase 6: admin write access to the configurable tables. Enrollment and
-- program setup are admin operations; RLS previously exposed these tables
-- read-only. is_admin() is the SECURITY DEFINER role check from migration 3.

create policy cohorts_admin_write on public.cohorts
  for all using (public.is_admin()) with check (public.is_admin());

create policy care_pods_admin_write on public.care_pods
  for all using (public.is_admin()) with check (public.is_admin());

create policy cohort_members_admin_write on public.cohort_members
  for all using (public.is_admin()) with check (public.is_admin());

create policy task_templates_admin_write on public.task_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- Admin may also set a profile's role (e.g. promote a signup to staff) and read
-- all profiles for assignment pickers (can_view_profile already grants read).
create policy profiles_admin_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
