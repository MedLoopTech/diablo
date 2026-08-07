-- Marketing leads: submissions from the public landing page's lead-capture
-- form. Previously the /api/lead route only fired WhatsApp/Telegram
-- notifications and persisted nothing — if either send failed, or ops just
-- missed the message, the lead was gone with no record. This table is the
-- durable copy; notifications remain a best-effort convenience on top of it.
--
-- Fields mirror the segmentation the content-ops system actually plans
-- against (loop90-content-ops/): five personas, ten channels, and seasonal
-- campaigns. Without persona and channel attribution, none of that strategy
-- is measurable — you can't tell a doctor lead from a patient lead, or know
-- which piece of content produced either.

create table public.leads (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  phone              text not null,
  email              text,

  -- Which audience this lead belongs to. Drives who follows up and how:
  -- a doctor or pharma lead goes to B2B, not the patient enrollment flow.
  -- Mirrors loop90-content-ops/domains/diabetes-remission/personas/.
  persona            text not null default 'patient'
                       check (persona in ('patient', 'prediabetic_family', 'doctor', 'nutritionist_coach', 'pharma_corporate')),

  -- What they asked for — distinguishes a top-of-funnel guide download
  -- from someone trying to reserve a cohort spot.
  interest           text not null default 'general'
                       check (interest in ('general', 'guide', 'enrollment', 'partnership', 'clinic')),

  -- Channel attribution. `source` stays free-text for backward compatibility
  -- and human-entered origins; the utm_* columns carry real campaign data.
  source             text not null default 'website',
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  referrer           text,
  landing_path       text,
  -- The specific asset that produced the lead (e.g. 'desi-plate-guide'),
  -- so content-ops can attribute leads to individual pieces, not just channels.
  content_asset      text,

  preferred_language text not null default 'en' check (preferred_language in ('en', 'ur')),

  -- Pakistan's PDPB treats health-adjacent personal data as sensitive.
  -- Record that consent was given and when, not just that a form was posted.
  consent_marketing  boolean not null default false,
  consent_at         timestamptz,

  status             text not null default 'new' check (status in ('new', 'contacted', 'converted', 'archived')),
  notified_whatsapp  boolean not null default false,
  notified_telegram  boolean not null default false,
  created_at         timestamptz not null default now()
);
create index on public.leads (created_at desc);
create index on public.leads (status);
create index on public.leads (persona);
create index on public.leads (utm_campaign);

alter table public.leads enable row level security;

-- RLS policies alone don't grant table-level access — Postgres checks
-- ordinary GRANTs first. service_role writes via the API route (bypasses
-- RLS); authenticated reads/updates go through the super_admin policies below.
grant select, insert, update on public.leads to service_role;
grant select, update on public.leads to authenticated;

-- Inserted only via the service-role client from app/api/lead/route.ts
-- (public, unauthenticated endpoint) — no insert policy needed for anon.

-- Marketing/business data — same visibility tier as Referrals and Settings.
create policy leads_super_admin_read on public.leads
  for select using (public.is_super_admin());

create policy leads_super_admin_update on public.leads
  for update using (public.is_super_admin()) with check (public.is_super_admin());
