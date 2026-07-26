-- Migration 16: configurable plan tier system

-- Plan assignment on patient profiles
alter table public.profiles
  add column if not exists plan text not null default 'basic'
    check (plan in ('basic', 'plus', 'premium'));

-- Configurable feature flags per plan (admin-editable)
create table if not exists public.plan_feature_flags (
  id          uuid primary key default gen_random_uuid(),
  plan        text not null check (plan in ('basic', 'plus', 'premium')),
  feature_key text not null,
  label       text not null,
  enabled     boolean not null default false,
  sort_order  int not null default 0,
  unique (plan, feature_key)
);

insert into public.plan_feature_flags (plan, feature_key, label, enabled, sort_order) values
  ('basic',   'ai_coach',                  'AI coach chat',             true,  1),
  ('basic',   'ai_meal_analysis',          'AI meal photo analysis',    true,  2),
  ('basic',   'resource_library',          'Resource library access',   true,  3),
  ('basic',   'consult_booking',           'Consult slot booking',      true,  4),
  ('basic',   'glucometer_photo_required', 'Glucometer photo required', false, 5),
  ('plus',    'ai_coach',                  'AI coach chat',             true,  1),
  ('plus',    'ai_meal_analysis',          'AI meal photo analysis',    true,  2),
  ('plus',    'resource_library',          'Resource library access',   true,  3),
  ('plus',    'consult_booking',           'Consult slot booking',      true,  4),
  ('plus',    'glucometer_photo_required', 'Glucometer photo required', false, 5),
  ('premium', 'ai_coach',                  'AI coach chat',             true,  1),
  ('premium', 'ai_meal_analysis',          'AI meal photo analysis',    true,  2),
  ('premium', 'resource_library',          'Resource library access',   true,  3),
  ('premium', 'consult_booking',           'Consult slot booking',      true,  4),
  ('premium', 'glucometer_photo_required', 'Glucometer photo required', false, 5)
on conflict (plan, feature_key) do nothing;

alter table public.plan_feature_flags enable row level security;

-- Any authenticated user can read (patients can see what their plan includes)
create policy "pff_read"
  on public.plan_feature_flags for select
  to authenticated using (true);

-- Only admins write
create policy "pff_admin_write"
  on public.plan_feature_flags for all
  to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
