-- Phase 1: daily task generation from templates.
-- SPEC §2 program phases: 1 (day 1–14) baseline, 2 (day 15–60) intervention,
-- 3 (day 61–90) stabilization.

-- ————————————————————————————————— template seed —————————————————————————————————
insert into public.task_templates (phase, kind, title, subtitle, time_of_day, sort_order) values
  -- Phase 1 — Baseline: log everything, no diet overhaul yet.
  (1, 'glucose', 'Log fasting glucose',        'First thing, before eating',              '07:00', 10),
  (1, 'meal',    'Photo your lunch',            'We''ll learn your usual plate',            '13:00', 20),
  (1, 'walk',    '15-min post-lunch walk',      'Blunts the afternoon rise',                '15:00', 30),
  (1, 'glucose', 'Evening glucose reading',     'Two hours after dinner',                   '21:00', 40),
  -- Phase 2 — Intervention: personalized plan, daily movement targets.
  (2, 'glucose', 'Log fasting glucose',        'Track the morning trend',                  '07:00', 10),
  (2, 'meal',    'Photo lunch + dinner',        'Stick to this week''s meal plan',          '13:00', 20),
  (2, 'walk',    '30-min movement target',      'Any brisk activity counts',                '17:00', 30),
  (2, 'yoga_live','Live yoga with your coach',  'Gentle flow for insulin sensitivity',      '18:00', 40),
  (2, 'glucose', 'Evening glucose reading',     'Two hours after dinner',                   '21:00', 50),
  -- Phase 3 — Stabilization: taper intensity, hold the habit.
  (3, 'glucose', 'Log fasting glucose',        'Keep the streak going',                    '07:00', 10),
  (3, 'walk',    '30-min movement target',      'Lock in the habit',                        '17:00', 20),
  (3, 'glucose', 'Evening glucose reading',     'Two hours after dinner',                   '21:00', 30);

-- Cohort day for a patient: (today − cohort.start_date) + 1, capped 1..90.
-- Falls back to days since signup when the patient is not yet in a cohort, so
-- the daily loop works before enrollment (cohorts land in Phase 4/5).
create or replace function public.sehat_cohort_day(p uuid)
returns int
language sql stable security definer set search_path = public as $$
  select greatest(1, least(90, coalesce(
    (select ((now() at time zone 'Asia/Karachi')::date - c.start_date) + 1
       from public.cohort_members cm
       join public.cohorts c on c.id = cm.cohort_id
      where cm.patient_id = p
      order by cm.joined_at
      limit 1),
    (select ((now() at time zone 'Asia/Karachi')::date
             - (pr.created_at at time zone 'Asia/Karachi')::date) + 1
       from public.profiles pr where pr.id = p),
    1
  )));
$$;

create or replace function public.program_phase(cohort_day int)
returns int
language sql immutable as $$
  select case when cohort_day <= 14 then 1 when cohort_day <= 60 then 2 else 3 end;
$$;

-- Ensure today's (Asia/Karachi) task rows exist for a patient. Idempotent: the
-- unique(patient_id, for_date, kind, title) constraint makes re-runs no-ops.
create or replace function public.ensure_daily_tasks(p uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  d     date := (now() at time zone 'Asia/Karachi')::date;
  c_day int  := public.sehat_cohort_day(p);
  ph    int  := public.program_phase(c_day);
begin
  insert into public.tasks (patient_id, for_date, cohort_day, title, subtitle, kind)
  select p, d, c_day, t.title, t.subtitle, t.kind
  from public.task_templates t
  where t.phase = ph
  on conflict (patient_id, for_date, kind, title) do nothing;
end;
$$;

-- Complete (or re-open) a task the caller owns, awarding points once.
create or replace function public.complete_task(task_id uuid, done boolean)
returns public.tasks
language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
begin
  select * into t from public.tasks where id = task_id;
  if not found then raise exception 'task not found'; end if;
  if t.patient_id <> auth.uid() then raise exception 'not your task'; end if;

  if done and t.done_at is null then
    update public.tasks set done_at = now() where id = task_id returning * into t;
    perform public.award_points(t.patient_id, 15, 'task_done');
  elsif not done and t.done_at is not null then
    update public.tasks set done_at = null where id = task_id returning * into t;
    -- Reverse the award so toggling can't farm points.
    insert into public.points_ledger (patient_id, points, reason)
    values (t.patient_id, -15, 'task_done');
  end if;
  return t;
end;
$$;

-- Optional: schedule generation for all patients at 00:05 Asia/Karachi (18:05 UTC)
-- once pg_cron is enabled. The app also generates lazily on Today load, so this
-- is a convenience, not a dependency.
--
--   select cron.schedule('sehat-daily-tasks', '5 18 * * *', $cron$
--     select public.ensure_daily_tasks(id) from public.profiles where role = 'patient';
--   $cron$);
