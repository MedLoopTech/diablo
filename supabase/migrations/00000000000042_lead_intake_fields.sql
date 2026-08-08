-- Restores intake fields that the original marketing modals collected
-- (products/Content Resources/*.html) but the rebuilt forms dropped:
--
--   city           — pods and cohorts are organised by city (Karachi,
--                    Lahore, Islamabad), so this is routing data, not a
--                    nice-to-have.
--   license_number — PMDC / RD registration. Without it every clinician
--                    application needs a follow-up message just to ask,
--                    which is the slowest possible step in credentialing.

alter table public.leads add column if not exists city           text;
alter table public.leads add column if not exists license_number text;

-- Public contact number for the "message us directly" fallback shown after a
-- form submits. Hardcoding it in the page meant it couldn't be changed
-- without a redeploy — and it's the only working contact path whenever the
-- WhatsApp/Telegram notification credentials aren't configured.
insert into public.automation_config (key, label, description, group_name, sort_order, value)
values (
  'contact_whatsapp',
  'Public WhatsApp number',
  'Number shown to visitors as the direct-contact fallback after submitting a marketing form. International format, no plus sign (e.g. 923001234567).',
  'general',
  2,
  '923396335667'
)
on conflict (key) do nothing;

-- lib/automation.ts's loadConfig() reads this table with the service-role
-- client (no session, so RLS's is_admin() policies don't apply — table-level
-- grants are what's actually checked). Hosted projects get this grant by
-- default at project creation; the local CLI-managed stack doesn't, so
-- reads here silently returned nothing locally — e.g. the professionals
-- page's referral payout rendered "PKR 0" instead of erroring loudly. Made
-- explicit so both environments behave the same way.
grant select on public.automation_config to service_role;
