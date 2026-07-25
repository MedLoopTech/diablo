-- Phase 2: attach an optional glucometer photo to a glucose reading.
-- The photo is stored in the private "patient-photos" Storage bucket; this
-- column holds its object path. Optional by default (see lib/plan.ts).
alter table public.glucose_readings
  add column if not exists photo_url text;
