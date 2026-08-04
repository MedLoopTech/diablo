-- Voice notes on the patient chat. No transcription: the deterministic +
-- LLM triage rules in lib/ai/triage.ts run on text only, so a voice message
-- has no reliable way to be auto-classified. Every voice note therefore
-- routes straight to the pod doctor — never AI-answered — the same "when in
-- doubt, route to a human" default CLAUDE.md's safety rule 3 already
-- requires for text.

alter table public.chat_messages
  add column if not exists audio_path text;

-- A message is either a body written by someone, or a voice note attached by
-- the patient — never neither. chat_messages.body is already `not null`, so
-- a voice note's body is stored as '' rather than null.
alter table public.chat_messages
  drop constraint if exists chat_messages_body_or_audio;
alter table public.chat_messages
  add constraint chat_messages_body_or_audio
  check (length(trim(body)) > 0 or audio_path is not null);

-- Enforced in the DB, not just in the /api/voice-note route — a valid
-- session could otherwise call PostgREST directly and bypass an
-- application-level cap entirely. Each voice note lands in the doctor's
-- queue as an interruption that has to be opened and listened to, so this
-- caps how many one patient can create per day regardless of code path.
create or replace function public.enforce_voice_note_rate_limit()
returns trigger language plpgsql security definer as $$
declare
  v_count int;
begin
  if new.audio_path is null then
    return new;
  end if;

  select count(*) into v_count
  from public.chat_messages
  where patient_id = new.patient_id
    and sender = 'patient'
    and audio_path is not null
    and created_at >= now() - interval '24 hours';

  if v_count >= 8 then
    raise exception 'rate_limited: at most 8 voice notes per 24 hours'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists voice_note_rate_limit on public.chat_messages;
create trigger voice_note_rate_limit
  before insert on public.chat_messages
  for each row execute function public.enforce_voice_note_rate_limit();

-- Private bucket. All access goes through server-side routes using the
-- service-role client (same convention as PHOTO_BUCKET/clinical-records) —
-- no client ever talks to storage.objects directly, so no storage.objects
-- RLS is needed.
insert into storage.buckets (id, name, public)
values ('voice-notes', 'voice-notes', false)
on conflict (id) do nothing;
