-- Migration 40: super_admin scope.
--
-- super_admin is a strict superset of admin — is_admin() now covers both,
-- so every existing admin-gated policy (cohorts, staff invites, patients,
-- resources) keeps working unchanged for both roles. A new is_super_admin()
-- gates the platform-configuration tables specifically: task_templates,
-- plan_feature_flags, automation_config (writes), referral_codes (writes),
-- referrals (payout status), and reward_fulfillments — these back the
-- Settings / Referrals / Automation / Plans / Templates screens, which are
-- now super_admin-only in the app.

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.sehat_role() = 'super_admin', false);
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.sehat_role() in ('admin', 'super_admin'), false);
$$;

-- task_templates (Templates tab)
drop policy if exists task_templates_admin_write on public.task_templates;
create policy task_templates_super_admin_write on public.task_templates
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- plan_feature_flags (Plans tab)
drop policy if exists pff_admin_write on public.plan_feature_flags;
create policy pff_super_admin_write on public.plan_feature_flags
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- automation_config (Automation + Settings tabs; reads stay public)
drop policy if exists automation_config_update on public.automation_config;
create policy automation_config_super_admin_update on public.automation_config
  for update using (public.is_super_admin()) with check (public.is_super_admin());

-- referral_codes (Referrals tab — creating/editing codes; reads stay admin-wide)
drop policy if exists referral_codes_insert on public.referral_codes;
create policy referral_codes_super_admin_insert on public.referral_codes
  for insert with check (public.is_super_admin());

drop policy if exists referral_codes_update on public.referral_codes;
create policy referral_codes_super_admin_update on public.referral_codes
  for update using (public.is_super_admin());

-- referrals (Referrals/Payouts — marking paid; reads stay as-is)
drop policy if exists referrals_admin_update on public.referrals;
create policy referrals_super_admin_update on public.referrals
  for update using (public.is_super_admin());

-- reward_fulfillments (audit trail written only by markReferralsPaid)
drop policy if exists reward_fulfillments_admin_all on public.reward_fulfillments;
create policy reward_fulfillments_super_admin_all on public.reward_fulfillments
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Promote the platform owner and the seeded demo admin account (so the
-- /demo tour still shows the full admin experience) to super_admin. Matched
-- by email rather than a fixed id — scripts/seed.mjs creates demo.admin@
-- via auth.admin.createUser() with no explicit id, so its uuid is random
-- and different on every `supabase db reset`.
update public.profiles p
set role = 'super_admin'
from auth.users u
where p.id = u.id
  and u.email in ('smaz84ster@gmail.com', 'demo.admin@sehat90.app');
