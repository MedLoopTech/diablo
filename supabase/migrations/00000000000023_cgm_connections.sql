-- CGM connections: stores LibreView auth tokens (encrypted) for background sync.
-- Token encryption happens in the application layer (AES-256-GCM, CGM_ENCRYPTION_KEY).

create table public.cgm_connections (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references auth.users(id) on delete cascade,
  provider        text not null default 'libre',
  provider_user_id text,                         -- LibreView userId, discovered on first sync
  auth_token_enc  text not null,                 -- AES-256-GCM encrypted token
  token_expires_at timestamptz,
  last_synced_at  timestamptz,
  readings_synced int  not null default 0,
  error_message   text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (patient_id, provider)
);

alter table public.cgm_connections enable row level security;

create policy "cgm_own_all" on public.cgm_connections
  for all using (patient_id = auth.uid());

-- Staff (via service role) need to read connections for the cron sync.
-- The cron runs under the service role key so RLS is bypassed — no extra policy needed.
