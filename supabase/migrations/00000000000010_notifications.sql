-- Phase 5: in-app notifications (SPEC §5, v1 in-app layer).
-- A row per notification for a user; triggers create them for the key events.
-- Web push (v1 also) layers on top later using the same rows.

create type public.notification_kind as enum (
  'glucose_urgent', 'ai_routed', 'care_reply', 'consult_booked', 'system'
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       public.notification_kind not null,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Users only ever see and update their own notifications.
create policy notifications_own_read on public.notifications
  for select using (user_id = auth.uid());
create policy notifications_own_update on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Escalation -> notify the assigned staff member (urgent/ai-routed).
create or replace function public.notify_on_escalation()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_urgent boolean := NEW.kind in ('glucose_urgent', 'patient_flagged');
begin
  if NEW.assigned_to is null then return NEW; end if;
  -- Routine glucose flags go in the 8am digest (SPEC §5), not immediate alerts.
  if NEW.kind = 'glucose_routine' then return NEW; end if;

  select full_name into v_name from public.profiles where id = NEW.patient_id;
  insert into public.notifications (user_id, kind, title, body, link)
  values (
    NEW.assigned_to,
    case when v_urgent then 'glucose_urgent'::public.notification_kind
         else 'ai_routed'::public.notification_kind end,
    case when v_urgent then 'Urgent: ' || coalesce(v_name, 'a patient')
         else 'New question from ' || coalesce(v_name, 'a patient') end,
    case when NEW.payload ? 'value_mgdl'
         then 'Glucose ' || (NEW.payload ->> 'value_mgdl') || ' mg/dL'
         else NEW.payload ->> 'message' end,
    '/staff/patients/' || NEW.patient_id
  );
  return NEW;
end;
$$;

create trigger trg_notify_on_escalation
  after insert on public.escalations
  for each row execute function public.notify_on_escalation();

-- Care-team chat message -> notify the patient ("your doctor replied").
create or replace function public.notify_on_care_reply()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if NEW.sender in ('doctor', 'nutritionist', 'coach') then
    insert into public.notifications (user_id, kind, title, body, link)
    values (NEW.patient_id, 'care_reply', 'Your care team replied',
            left(NEW.body, 120), '/care');
  end if;
  return NEW;
end;
$$;

create trigger trg_notify_on_care_reply
  after insert on public.chat_messages
  for each row execute function public.notify_on_care_reply();

-- Consult booking -> notify the window's staff member.
create or replace function public.notify_on_booking()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_staff uuid; v_name text;
begin
  select staff_id into v_staff from public.consult_windows where id = NEW.window_id;
  if v_staff is null then return NEW; end if;
  select full_name into v_name from public.profiles where id = NEW.patient_id;
  insert into public.notifications (user_id, kind, title, body, link)
  values (v_staff, 'consult_booked', 'New consult booked',
          coalesce(v_name, 'A patient') || ' booked ' || NEW.slot_time,
          '/staff/patients/' || NEW.patient_id);
  return NEW;
end;
$$;

create trigger trg_notify_on_booking
  after insert on public.consult_bookings
  for each row execute function public.notify_on_booking();
