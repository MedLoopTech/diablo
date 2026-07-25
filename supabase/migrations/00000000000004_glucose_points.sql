-- Phase 1: glucose flagging + escalation + points/streak.
-- Encodes CLAUDE.md safety rule 2 in database logic, not just UI copy:
--   value >= 250 or <= 70  -> URGENT escalation to the pod doctor
--   value >= 180           -> routine flag for daily doctor review

-- Points awarded per event. Kept as a function so values live in one place.
create or replace function public.award_points(p uuid, pts int, why public.points_reason)
returns void
language sql security definer set search_path = public as $$
  insert into public.points_ledger (patient_id, points, reason) values (p, pts, why);
$$;

-- BEFORE INSERT: classify the reading and stamp its flag.
create or replace function public.glucose_set_flag()
returns trigger
language plpgsql set search_path = public as $$
begin
  if NEW.value_mgdl >= 250 or NEW.value_mgdl <= 70 then
    NEW.flag := 'urgent';
  elsif NEW.value_mgdl >= 180 then
    NEW.flag := 'routine';
  else
    NEW.flag := 'none';
  end if;
  return NEW;
end;
$$;

create trigger trg_glucose_set_flag
  before insert on public.glucose_readings
  for each row execute function public.glucose_set_flag();

-- AFTER INSERT: create an escalation for flagged readings (assigned to the pod
-- doctor when one exists) and award points for logging. SECURITY DEFINER so the
-- escalation insert is not blocked by the patient's own RLS.
create or replace function public.glucose_after_insert()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_doctor uuid;
begin
  if NEW.flag in ('urgent', 'routine') then
    select cp.doctor_id into v_doctor
    from public.cohort_members cm
    join public.care_pods cp on cp.cohort_id = cm.cohort_id
    where cm.patient_id = NEW.patient_id
    limit 1;

    insert into public.escalations (patient_id, kind, payload, assigned_to, status)
    values (
      NEW.patient_id,
      case when NEW.flag = 'urgent'
           then 'glucose_urgent'::public.escalation_kind
           else 'glucose_routine'::public.escalation_kind end,
      jsonb_build_object(
        'reading_id', NEW.id,
        'value_mgdl', NEW.value_mgdl,
        'context', NEW.context,
        'taken_at', NEW.taken_at,
        'flag', NEW.flag
      ),
      v_doctor,
      'open'
    );
  end if;

  perform public.award_points(NEW.patient_id, 10, 'reading_logged');
  return NEW;
end;
$$;

create trigger trg_glucose_after_insert
  after insert on public.glucose_readings
  for each row execute function public.glucose_after_insert();

-- ————————————————————————————————— points & streak reads —————————————————————————————————

-- Total points for a patient (leaderboard sum).
create or replace function public.patient_points(p uuid)
returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(points), 0)::int from public.points_ledger where patient_id = p;
$$;

-- Streak = consecutive days (ending today, Asia/Karachi) each having >=1 glucose
-- reading AND >=2 tasks completed. Returns 0 if today does not qualify.
create or replace function public.patient_streak(p uuid)
returns int
language plpgsql stable security definer set search_path = public as $$
declare
  d    date := (now() at time zone 'Asia/Karachi')::date;
  n    int  := 0;
  has_reading boolean;
  tasks_done  int;
begin
  loop
    select exists (
      select 1 from public.glucose_readings g
      where g.patient_id = p
        and (g.taken_at at time zone 'Asia/Karachi')::date = d
    ) into has_reading;

    select count(*) into tasks_done
    from public.tasks t
    where t.patient_id = p
      and t.for_date = d
      and t.done_at is not null;

    if has_reading and tasks_done >= 2 then
      n := n + 1;
      d := d - 1;
    else
      exit;
    end if;
  end loop;
  return n;
end;
$$;
