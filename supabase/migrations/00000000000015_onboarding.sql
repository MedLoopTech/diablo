-- Migration 15: profile onboarding gate + baseline fields

alter table public.profiles
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists baseline_hba1c      decimal(4,1),
  add column if not exists baseline_weight_kg  decimal(5,1);

-- Existing profiles with a name are already "onboarded" — skip the gate for them.
update public.profiles
  set onboarding_complete = true
  where full_name is not null and full_name <> '';
