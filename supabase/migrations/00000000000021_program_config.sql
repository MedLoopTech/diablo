-- Program configuration table.
-- Makes primary-metric thresholds data-driven instead of hardcoded in PL/pgSQL.
-- v1 ships the diabetes program only; adding a second program (e.g. hypertension)
-- requires inserting a new row and wiring it to a cohort — no code changes.

create table public.program_config (
  program        text primary key,
  metric_label   text not null default 'Glucose',
  unit           text not null default 'mg/dL',
  urgent_low     int  not null,   -- ≤ this → urgent flag
  urgent_high    int  not null,   -- ≥ this → urgent flag
  routine_high   int  not null,   -- ≥ this → routine flag
  target_low     int  not null,   -- ideal range lower bound (dial zone)
  target_high    int  not null    -- ideal range upper bound
);

-- Diabetes program defaults (SPEC §2 thresholds).
insert into public.program_config
  (program, metric_label, unit, urgent_low, urgent_high, routine_high, target_low, target_high)
values
  ('diabetes', 'Glucose', 'mg/dL', 70, 250, 180, 70, 130);

-- Everyone can read program config (patients may query it in future UI).
-- Writes are intentionally policy-less — only service role / migrations can insert.
alter table public.program_config enable row level security;
create policy program_config_read on public.program_config
  for select using (true);

-- Re-implement the flag-setter to read from program_config.
-- `create or replace` is safe here — the trigger referencing this function is unchanged.
create or replace function public.glucose_set_flag()
returns trigger
language plpgsql set search_path = public as $$
declare
  v_urgent_low   int;
  v_urgent_high  int;
  v_routine_high int;
begin
  select urgent_low, urgent_high, routine_high
  into   v_urgent_low, v_urgent_high, v_routine_high
  from   public.program_config
  where  program = 'diabetes'
  limit  1;

  -- Fallback to hardcoded spec values if the config row is absent.
  v_urgent_low   := coalesce(v_urgent_low, 70);
  v_urgent_high  := coalesce(v_urgent_high, 250);
  v_routine_high := coalesce(v_routine_high, 180);

  if NEW.value_mgdl >= v_urgent_high or NEW.value_mgdl <= v_urgent_low then
    NEW.flag := 'urgent';
  elsif NEW.value_mgdl >= v_routine_high then
    NEW.flag := 'routine';
  else
    NEW.flag := 'none';
  end if;
  return NEW;
end;
$$;
