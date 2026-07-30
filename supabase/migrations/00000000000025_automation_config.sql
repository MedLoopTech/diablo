-- Automation configuration table.
-- Stores WhatsApp/Telegram message templates and operational settings
-- that admins can edit through the staff portal without a code deploy.
-- Cron jobs and API routes read this table at runtime.

create table public.automation_config (
  key          text primary key,
  value        text not null default '',
  label        text not null,
  description  text,
  group_name   text not null default 'general',
  sort_order   int  not null default 0,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id)
);

alter table public.automation_config enable row level security;

-- Everyone can read (cron jobs and server actions use service role which bypasses RLS).
create policy automation_config_select on public.automation_config
  for select using (true);

-- Only admins can edit.
create policy automation_config_update on public.automation_config
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-stamp updated_at + updated_by on every save.
create or replace function public.automation_config_stamp()
returns trigger language plpgsql set search_path = public as $$
begin
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  return NEW;
end;
$$;

create trigger automation_config_stamp_trg
  before update on public.automation_config
  for each row execute procedure public.automation_config_stamp();

-- Default values. Multi-line strings use E'...\n...' escape syntax.
-- Variables in templates are wrapped in {braces} and substituted at runtime.
insert into public.automation_config (key, label, description, group_name, sort_order, value) values

  -- ── Message templates ───────────────────────────────────────────────────────
  ('msg_lead_welcome_wa',
   'Lead Welcome (WhatsApp)',
   'Sent to new website leads within seconds of form submission. Variables: {name}, {guide_url}',
   'messages', 10,
   E'Assalam o Alaikum {name}!\n\nShukria for your interest in *Loop/90* — Pakistan’s 90-day diabetes remission program.\n\nOur team will reach you within 24 hours to explain how the program works.\n\nIn the meantime, grab our free Desi Diabetes Plate Guide — practical tips for Pakistani households:\n{guide_url}\n\n_Loop/90 Care Team_'),

  ('msg_patient_onboard_wa',
   'Patient Welcome (WhatsApp)',
   'Sent when a new patient is enrolled. Variables: {name}, {start_date}, {app_url}',
   'messages', 20,
   E'Assalam o Alaikum {name}!\n\nBahut khushi hui ke aap *Loop/90* program mein shamil ho gaye hain!\n\nYour 90-day journey starts on *{start_date}*.\n\n*Your first 3 steps today:*\n1. Open the app: {app_url}\n2. Log your morning fasting glucose\n3. Take a photo of your first meal\n\nYour Care Pod — doctor, nutritionist, and coach — will be in touch shortly.\n\nHum sath hain, har qadam par!\n\n_Loop/90 Care Team_'),

  ('msg_session_24h_wa',
   'Session Reminder — 24 hours (WhatsApp)',
   'Sent 24 hours before a consultation. Variables: {name}, {session_type}, {session_time}',
   'messages', 30,
   E'Reminder: {name}, you have a *Loop/90 consultation* scheduled tomorrow!\n\n📅 {session_time}\n🩺 Type: {session_type}\n\nPlease log your latest glucose reading and a meal before the session — it gives your doctor full context.\n\n_Loop/90 Care Team_'),

  ('msg_session_1h_wa',
   'Session Reminder — 1 hour (WhatsApp)',
   'Sent 1 hour before a consultation. Variables: {name}, {session_type}, {session_time}, {app_url}',
   'messages', 40,
   E'*Starting in 1 hour!*\n\n{name}, your Loop/90 consultation begins soon.\n\n📅 {session_time}\n🩺 {session_type}\n\nOpen the app to join:\n{app_url}\n\n_Loop/90 Care Team_'),

  ('msg_weekly_digest_wa',
   'Weekly Progress Digest (WhatsApp)',
   'Sent every Sunday to all active patients. Variables: {name}, {points}, {streak}, {cohort_day}, {cohort_week}',
   'messages', 50,
   E'*Your Loop/90 Week {cohort_week} Update*\n\n{name}, great work this week!\n\nYour stats:\n🏆 Points: {points}\n🔥 Streak: {streak} days\n📅 Program day: {cohort_day}/90\n\nKeep logging daily — consistency is what drives remission.\n\nSee your full progress in the app.\n\n_Loop/90 Care Team_'),

  -- ── Notification destinations ────────────────────────────────────────────────
  ('notify_ops_telegram_chat_id',
   'Ops Team Telegram Chat ID',
   'Telegram chat/group that receives lead alerts and daily ops reports. Use @userinfobot in Telegram to find the ID (negative number for groups).',
   'destinations', 10, ''),

  ('notify_pod_telegram_chat_id',
   'Care Pod Telegram Chat ID',
   'Telegram chat/group that receives new patient onboarding alerts. Can be the same as the ops chat.',
   'destinations', 20, ''),

  -- ── Thresholds ───────────────────────────────────────────────────────────────
  ('threshold_inactivity_days',
   'Inactivity Alert Threshold (days)',
   'Patients who have not logged anything for this many days appear in the daily ops report.',
   'thresholds', 10, '3'),

  -- ── General ─────────────────────────────────────────────────────────────────
  ('app_url',
   'App URL',
   'The public URL patients use to access the app. Appears in WhatsApp messages.',
   'general', 10, 'https://sehat90.com/app'),

  ('guide_url',
   'Diabetes Guide URL',
   'URL for the Desi Diabetes Plate Guide. Used in lead welcome messages.',
   'general', 20, 'https://sehat90.com/guide');
