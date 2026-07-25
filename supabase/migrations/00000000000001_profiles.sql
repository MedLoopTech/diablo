-- Phase 0: profiles + role enum + signup trigger.
-- Later phases add the remaining SPEC §1 tables in their own migrations.

create type public.user_role as enum ('patient', 'doctor', 'nutritionist', 'coach', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'patient',
  full_name text,
  phone text,
  avatar_url text,
  timezone text not null default 'Asia/Karachi',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone authenticated can read their own profile.
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users may update their own profile but NOT their role
-- (role changes are an admin/service-key operation).
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- Staff will need to read patient profiles in later phases; those policies
-- arrive with cohort/care_pod tables so they can be scoped to assigned cohorts.

-- Create a profile row automatically on signup, defaulting to patient.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, phone, full_name)
  values (
    new.id,
    'patient',
    new.phone,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
