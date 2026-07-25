-- Phase 1: full SPEC §1 data model (everything except profiles, which is Phase 0).
-- Later phases add triggers, RLS, and seed data in their own migrations.
-- Depends on Phase 0 migration 00000000000001_profiles.sql having run first.

-- gen_random_uuid() is in core on Postgres 13+, but enable pgcrypto defensively.
create extension if not exists pgcrypto;

-- ————————————————————————————————— enums —————————————————————————————————
create type public.cohort_status    as enum ('enrolling', 'active', 'completed');
create type public.glucose_context  as enum ('fasting', 'pre_meal', 'post_meal', 'bedtime', 'random');
create type public.glucose_source   as enum ('manual', 'cgm');
create type public.glucose_flag     as enum ('none', 'routine', 'urgent');
create type public.meal_type        as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type public.task_kind        as enum ('glucose', 'meal', 'walk', 'yoga_live', 'custom');
create type public.booking_status   as enum ('booked', 'completed', 'no_show', 'cancelled');
create type public.escalation_kind  as enum ('glucose_urgent', 'glucose_routine', 'ai_routed', 'patient_flagged');
create type public.escalation_status as enum ('open', 'acknowledged', 'resolved');
create type public.chat_sender      as enum ('patient', 'ai', 'doctor', 'nutritionist', 'coach');
create type public.points_reason    as enum ('task_done', 'streak', 'reading_logged', 'challenge');

-- ————————————————————————————————— cohorts —————————————————————————————————
create table public.cohorts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  start_date date not null,
  capacity   int not null default 45,
  status     public.cohort_status not null default 'enrolling',
  created_at timestamptz not null default now()
);

create table public.cohort_members (
  id                      uuid primary key default gen_random_uuid(),
  cohort_id               uuid not null references public.cohorts (id) on delete cascade,
  patient_id              uuid not null references public.profiles (id) on delete cascade,
  joined_at               timestamptz not null default now(),
  baseline_hba1c          numeric(4, 1),
  baseline_weight_kg      numeric(5, 1),
  baseline_fasting_glucose int,
  target_notes            text,
  unique (cohort_id, patient_id)
);
create index on public.cohort_members (patient_id);

create table public.care_pods (
  id             uuid primary key default gen_random_uuid(),
  cohort_id      uuid not null unique references public.cohorts (id) on delete cascade,
  doctor_id      uuid references public.profiles (id),
  nutritionist_id uuid references public.profiles (id),
  coach_id       uuid references public.profiles (id)
);

-- ———————————————————————————————— glucose ————————————————————————————————
create table public.glucose_readings (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  value_mgdl int not null check (value_mgdl > 0 and value_mgdl < 1000),
  context    public.glucose_context not null default 'random',
  source     public.glucose_source not null default 'manual',
  taken_at   timestamptz not null default now(),
  created_at timestamptz not null default now(),
  flag       public.glucose_flag not null default 'none'
);
create index on public.glucose_readings (patient_id, taken_at desc);

-- ————————————————————————————————— meals —————————————————————————————————
create table public.meals (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.profiles (id) on delete cascade,
  photo_url   text,
  meal_type   public.meal_type not null,
  eaten_at    timestamptz not null default now(),
  ai_analysis jsonb,
  created_at  timestamptz not null default now()
);
create index on public.meals (patient_id, eaten_at desc);

-- ————————————————————————————————— tasks —————————————————————————————————
create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  for_date   date not null,
  cohort_day int not null,
  title      text not null,
  subtitle   text,
  kind       public.task_kind not null default 'custom',
  done_at    timestamptz,
  created_at timestamptz not null default now(),
  -- one instance of a given template per patient per day
  unique (patient_id, for_date, kind, title)
);
create index on public.tasks (patient_id, for_date);

create table public.task_templates (
  id           uuid primary key default gen_random_uuid(),
  phase        int not null check (phase in (1, 2, 3)),
  kind         public.task_kind not null,
  title        text not null,
  subtitle     text,
  time_of_day  time,   -- SPEC calls this default_time; renamed to avoid the reserved-ish "default" prefix
  sort_order   int not null default 0
);

-- ———————————————————————————————— consults ————————————————————————————————
create table public.consult_windows (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid not null references public.profiles (id) on delete cascade,
  date         date not null,
  start_time   time not null,
  end_time     time not null,
  slot_minutes int not null default 10
);
create index on public.consult_windows (staff_id, date);

create table public.consult_bookings (
  id               uuid primary key default gen_random_uuid(),
  window_id        uuid not null references public.consult_windows (id) on delete cascade,
  slot_time        time not null,
  patient_id       uuid not null references public.profiles (id) on delete cascade,
  reason           text,
  status           public.booking_status not null default 'booked',
  context_snapshot jsonb,
  created_at       timestamptz not null default now(),
  unique (window_id, slot_time)
);
create index on public.consult_bookings (patient_id);

-- ———————————————————————————————— medication ————————————————————————————————
create table public.medication_plans (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid not null references public.profiles (id) on delete cascade,
  created_by     uuid not null references public.profiles (id),
  medications    jsonb not null default '[]'::jsonb,
  effective_from date not null default (now() at time zone 'Asia/Karachi')::date,
  notes          text,
  created_at     timestamptz not null default now()
);
create index on public.medication_plans (patient_id, effective_from desc);

create table public.medication_plan_audit (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.medication_plans (id) on delete cascade,
  changed_by uuid not null references public.profiles (id),
  changed_at timestamptz not null default now(),
  before     jsonb,
  after      jsonb
);

-- ———————————————————————————————— escalations ————————————————————————————————
create table public.escalations (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.profiles (id) on delete cascade,
  kind        public.escalation_kind not null,
  payload     jsonb,
  assigned_to uuid references public.profiles (id),
  status      public.escalation_status not null default 'open',
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
create index on public.escalations (assigned_to, status, created_at desc);
create index on public.escalations (patient_id, created_at desc);

-- ———————————————————————————————— chat ————————————————————————————————
create table public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  sender     public.chat_sender not null,
  body       text not null,
  triage     jsonb,
  created_at timestamptz not null default now()
);
create index on public.chat_messages (patient_id, created_at);

-- ———————————————————————————————— cohort feed ————————————————————————————————
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  cohort_id  uuid not null references public.cohorts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index on public.posts (cohort_id, created_at desc);

create table public.post_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  emoji      text not null default '❤️',
  created_at timestamptz not null default now(),
  unique (post_id, user_id, emoji)
);

create table public.post_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index on public.post_replies (post_id, created_at);

-- ———————————————————————————————— points & progress ————————————————————————————————
create table public.points_ledger (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  points     int not null,
  reason     public.points_reason not null,
  created_at timestamptz not null default now()
);
create index on public.points_ledger (patient_id, created_at desc);

create table public.progress_snapshots (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references public.profiles (id) on delete cascade,
  week              int not null,
  est_hba1c         numeric(4, 1),
  weight_kg         numeric(5, 1),
  avg_fasting_7d    numeric(6, 1),
  time_in_range_pct numeric(5, 1),
  created_at        timestamptz not null default now(),
  unique (patient_id, week)
);
