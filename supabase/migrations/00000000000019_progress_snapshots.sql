-- Extend existing progress_snapshots with date-based key and additional metrics.
-- The table was created in migration 2 with a week-integer key; we add columns
-- needed by the weekly cron writer without breaking existing data.

alter table public.progress_snapshots
  add column if not exists snapshot_date  date,
  add column if not exists avg_fasting_glucose int,
  add column if not exists task_completion_pct int;

-- Unique index on date (separate from the existing unique(patient_id, week)).
create unique index if not exists progress_snapshots_patient_date_idx
  on public.progress_snapshots (patient_id, snapshot_date)
  where snapshot_date is not null;

-- Policies may already exist from migration 3; only add the staff-read one if missing.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'progress_snapshots'
      and policyname = 'snap_staff'
  ) then
    execute $p$
      create policy snap_staff on public.progress_snapshots
        for select using (public.staff_sees_patient(patient_id));
    $p$;
  end if;
end $$;
