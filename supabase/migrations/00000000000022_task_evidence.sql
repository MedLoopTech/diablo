-- Migration 22: configurable photo evidence on daily tasks
-- Adds photo_mode (off|optional|required), a patient-facing prompt, bonus
-- points for optional photos, and evidence storage on the tasks table.
-- Admins edit per-template settings; ensure_daily_tasks propagates them.

-- ── task_templates: per-kind photo configuration ─────────────────────────
alter table public.task_templates
  add column if not exists photo_mode         text not null default 'off'
    check (photo_mode in ('off', 'optional', 'required')),
  add column if not exists photo_prompt       text,
  add column if not exists photo_points_bonus int  not null default 0;

-- ── tasks: per-task evidence storage ─────────────────────────────────────
alter table public.tasks
  add column if not exists photo_mode         text not null default 'off',
  add column if not exists photo_prompt       text,
  add column if not exists photo_points_bonus int  not null default 0,
  add column if not exists evidence_url       text,
  add column if not exists evidence_at        timestamptz;

-- ── Default photo config on existing templates ────────────────────────────
-- meal tasks were always about the plate photo — make it required.
update public.task_templates set
  photo_mode           = 'required',
  photo_prompt         = 'Show your plate — food should fill most of the frame',
  photo_points_bonus   = 0
where kind = 'meal';

-- walk tasks: optional proof photo earns bonus points.
update public.task_templates set
  photo_mode           = 'optional',
  photo_prompt         = 'Take a photo at the end of your walk — anywhere you finished',
  photo_points_bonus   = 10
where kind = 'walk';

-- live yoga: optional session selfie/screenshot.
update public.task_templates set
  photo_mode           = 'optional',
  photo_prompt         = 'Selfie or screenshot from the live session',
  photo_points_bonus   = 5
where kind = 'yoga_live';

-- ── Rebuild ensure_daily_tasks to propagate photo config ─────────────────
create or replace function public.ensure_daily_tasks(p uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  d     date := (now() at time zone 'Asia/Karachi')::date;
  c_day int  := public.sehat_cohort_day(p);
  ph    int  := public.program_phase(c_day);
begin
  insert into public.tasks
    (patient_id, for_date, cohort_day, title, subtitle, kind,
     photo_mode, photo_prompt, photo_points_bonus)
  select
    p, d, c_day, t.title, t.subtitle, t.kind,
    t.photo_mode, t.photo_prompt, t.photo_points_bonus
  from public.task_templates t
  where t.phase = ph
  on conflict (patient_id, for_date, kind, title) do nothing;
end;
$$;

-- ── set_task_evidence: record photo upload, complete task, award bonus ────
-- Called by /api/tasks/[id]/evidence after the file is stored.
create or replace function public.set_task_evidence(
  task_id uuid,
  url     text
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
begin
  select * into t from public.tasks where id = task_id;
  if not found       then raise exception 'task not found'; end if;
  if t.patient_id <> auth.uid() then raise exception 'not your task'; end if;
  if t.evidence_url is not null then return; end if; -- idempotent

  -- Record the evidence.
  update public.tasks
    set evidence_url = url, evidence_at = now()
  where id = task_id;

  -- Complete the task if it wasn't already.
  if t.done_at is null then
    update public.tasks set done_at = now() where id = task_id;
    perform public.award_points(t.patient_id, 15, 'task_done');
  end if;

  -- Bonus points for optional photo evidence.
  if t.photo_points_bonus > 0 then
    perform public.award_points(t.patient_id, t.photo_points_bonus, 'photo_evidence');
  end if;
end;
$$;

-- ── Staff/admin can read task evidence for their patients ─────────────────
-- tasks table already has patient-owns policy; add staff read via cohort.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tasks' and policyname = 'tasks_staff_read'
  ) then
    create policy tasks_staff_read on public.tasks
      for select
      using (
        exists (
          select 1 from public.cohort_members cm
          join public.care_pods cp on cp.cohort_id = cm.cohort_id
          where cm.patient_id = tasks.patient_id
            and (cp.doctor_id = auth.uid() or cp.nutritionist_id = auth.uid() or cp.coach_id = auth.uid())
        )
        or (select role from public.profiles where id = auth.uid()) = 'admin'
      );
  end if;
end $$;
