-- Migration 27: add referral_payout_pkr to automation_config so admin can change it
insert into public.automation_config (key, label, description, group_name, sort_order, value)
values (
  'referral_payout_pkr',
  'Referral payout per patient (PKR)',
  'Amount transferred to a referring partner each time one of their referred patients enrolls.',
  'general',
  5,
  '2000'
)
on conflict (key) do nothing;
