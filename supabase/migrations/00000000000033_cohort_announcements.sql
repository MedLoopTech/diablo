-- Cohort announcements: pod staff broadcast a workshop, challenge kickoff, or
-- schedule change to their whole cohort. Distinct from `posts` (patient/staff
-- chatter in the feed) — this is structured, dated, and publish-gated, closer
-- to the resource library than to a feed post.

create table public.cohort_announcements (
  id         uuid primary key default gen_random_uuid(),
  cohort_id  uuid not null references public.cohorts (id) on delete cascade,
  title      text not null,
  body       text,
  cta_label  text,
  cta_url    text,
  starts_on  date,
  ends_on    date,
  published  boolean not null default false,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
create index on public.cohort_announcements (cohort_id, created_at desc);

alter table public.cohort_announcements enable row level security;

-- Cohort members (patients and pod staff) read published, in-window rows.
-- Mirrors public.in_cohort() but also allows an author (pod staff) to see
-- their own hidden/scheduled drafts on the management screen.
create policy announcements_cohort_read on public.cohort_announcements
  for select using (
    public.in_cohort(cohort_id)
    and (published or created_by = auth.uid() or public.is_admin())
  );

create policy announcements_staff_insert on public.cohort_announcements
  for insert with check (
    created_by = auth.uid()
    and (
      public.is_admin()
      or exists (
        select 1 from public.care_pods cp
        where cp.cohort_id = cohort_announcements.cohort_id
          and auth.uid() in (cp.doctor_id, cp.nutritionist_id, cp.coach_id)
      )
    )
  );

create policy announcements_staff_update on public.cohort_announcements
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.care_pods cp
      where cp.cohort_id = cohort_announcements.cohort_id
        and auth.uid() in (cp.doctor_id, cp.nutritionist_id, cp.coach_id)
    )
  );

create policy announcements_staff_delete on public.cohort_announcements
  for delete using (
    public.is_admin()
    or exists (
      select 1 from public.care_pods cp
      where cp.cohort_id = cohort_announcements.cohort_id
        and auth.uid() in (cp.doctor_id, cp.nutritionist_id, cp.coach_id)
    )
  );
