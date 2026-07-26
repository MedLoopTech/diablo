-- Migration 18: web push subscriptions + consult meet URLs + enrollment fields

-- Push subscriptions (one per patient device).
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth_key   text not null,
  created_at timestamptz not null default now()
);
create index on public.push_subscriptions (patient_id);

alter table public.push_subscriptions enable row level security;

-- Only the owning patient can manage their own subscriptions.
create policy push_sub_own on public.push_subscriptions
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- Staff can read (needed to send pushes server-side via service role).
-- Actual send happens server-side with service role, so no RLS needed for that path.

-- Google Meet (or any video URL) on consult windows.
alter table public.consult_windows
  add column if not exists meet_url text;

-- Extra enrollment baseline fields from SPEC §1.
alter table public.cohort_members
  add column if not exists baseline_fasting_glucose int,
  add column if not exists target_notes text;
