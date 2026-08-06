-- Migration 38: platform-wide currency setting
-- Every payout/plan/voucher amount was hardcoded to "PKR" in the UI and in
-- reward_value field names (amount_pkr). Admins expanding beyond Pakistan
-- need to change this in one place rather than in every component.

insert into public.automation_config (key, label, description, group_name, sort_order, value)
values (
  'platform_currency',
  'Platform currency',
  'ISO currency code used for all payout, plan, and voucher amounts across the app (e.g. PKR, USD, AED).',
  'general',
  1,
  'PKR'
)
on conflict (key) do nothing;
