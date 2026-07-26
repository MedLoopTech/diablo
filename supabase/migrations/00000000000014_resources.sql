create type public.resource_type as enum ('book', 'research', 'video', 'exercise_plan', 'article', 'recipe');

create table public.resources (
  id          uuid         primary key default gen_random_uuid(),
  title       text         not null,
  type        public.resource_type not null default 'article',
  description text,
  url         text,
  tags        text[]       not null default '{}',
  cohort_id   uuid         references public.cohorts(id) on delete cascade,
  created_by  uuid         references auth.users(id) on delete set null,
  is_active   boolean      not null default true,
  created_at  timestamptz  not null default now()
);

alter table public.resources enable row level security;

-- Any authenticated user reads active resources (global + their cohort's).
create policy "read active resources" on public.resources
  for select using (
    is_active = true
    and (
      cohort_id is null
      or exists (
        select 1 from public.cohort_members cm
        where cm.patient_id = auth.uid()
          and cm.cohort_id = resources.cohort_id
      )
      or public.sehat_role() in ('doctor', 'nutritionist', 'coach', 'admin')
    )
  );

-- Only staff/admin can insert/update.
create policy "staff insert resources" on public.resources
  for insert with check (public.sehat_role() in ('doctor', 'nutritionist', 'coach', 'admin'));

create policy "staff update resources" on public.resources
  for update using (public.sehat_role() in ('doctor', 'nutritionist', 'coach', 'admin'));
