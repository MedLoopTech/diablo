-- Phase 6: real weight data collection.
-- Progress previously showed a weight delta with no way for a patient to record
-- weight. A weigh-in is a first-class logged event (like a glucose reading);
-- progress_snapshots remains the derived weekly rollup.

create table public.weigh_ins (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  weight_kg  numeric(5, 1) not null check (weight_kg > 20 and weight_kg < 400),
  source     text not null default 'manual',   -- manual | scale (future: smart-scale sync)
  taken_at   timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on public.weigh_ins (patient_id, taken_at desc);

alter table public.weigh_ins enable row level security;

create policy weigh_ins_patient_rw on public.weigh_ins
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy weigh_ins_staff_read on public.weigh_ins
  for select using (public.staff_sees_patient(patient_id));

-- Award points for logging a weigh-in, consistent with reading_logged.
create or replace function public.weigh_in_after_insert()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.award_points(NEW.patient_id, 10, 'reading_logged');
  return NEW;
end;
$$;

create trigger trg_weigh_in_points
  after insert on public.weigh_ins
  for each row execute function public.weigh_in_after_insert();
