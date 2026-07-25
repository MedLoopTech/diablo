-- Phase 4: live cohort feed + leaderboard.

-- Enable Realtime on the feed tables (they are not in the publication by default).
-- Wrapped so re-running is safe even if a table is already a member.
do $$
begin
  begin
    alter publication supabase_realtime add table public.posts;
  exception when duplicate_object then null; end;
  begin
    alter publication supabase_realtime add table public.post_reactions;
  exception when duplicate_object then null; end;
  begin
    alter publication supabase_realtime add table public.post_replies;
  exception when duplicate_object then null; end;
end $$;

-- Cohort leaderboard: each member with total points and current streak, ranked.
-- SECURITY DEFINER to aggregate across members; the in_cohort guard means only
-- a member of the cohort gets rows back.
create or replace function public.cohort_leaderboard(c uuid)
returns table (patient_id uuid, full_name text, points int, streak int)
language sql stable security definer set search_path = public as $$
  select cm.patient_id, p.full_name,
         public.patient_points(cm.patient_id),
         public.patient_streak(cm.patient_id)
  from public.cohort_members cm
  join public.profiles p on p.id = cm.patient_id
  where cm.cohort_id = c
    and public.in_cohort(c)
  order by public.patient_points(cm.patient_id) desc,
           public.patient_streak(cm.patient_id) desc;
$$;

-- The current patient's cohort id (first membership), or null. Convenience for
-- the app so it does not need to re-derive it everywhere.
create or replace function public.my_cohort()
returns uuid
language sql stable security definer set search_path = public as $$
  select cohort_id from public.cohort_members
  where patient_id = auth.uid()
  order by joined_at
  limit 1;
$$;
