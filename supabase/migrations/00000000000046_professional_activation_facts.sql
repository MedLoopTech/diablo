-- Migration 46: minimal Care Pod professional activation facts
--
-- Reuses public.profiles instead of introducing a separate professional,
-- credentialing, onboarding, or agreement subsystem.
--
-- These facts answer only whether an existing doctor/nutritionist/coach profile
-- has completed the three activation gates required before Care Pod assignment:
--   1) credentials verified
--   2) Care Pod orientation completed
--   3) current agreement/protocol accepted
--
-- Null means the gate has not yet been completed. Timestamps provide the audit
-- fact without duplicating boolean flags.

alter table public.profiles
  add column if not exists credentials_verified_at timestamptz,
  add column if not exists credentials_verified_by uuid references public.profiles(id) on delete set null,
  add column if not exists care_pod_orientation_completed_at timestamptz,
  add column if not exists care_pod_agreement_version text,
  add column if not exists care_pod_agreement_accepted_at timestamptz;

comment on column public.profiles.credentials_verified_at is
  'When an admin verified the professional credentials for Care Pod participation.';
comment on column public.profiles.credentials_verified_by is
  'Admin profile that verified the professional credentials.';
comment on column public.profiles.care_pod_orientation_completed_at is
  'When the professional completed the required Loop/90 Care Pod orientation.';
comment on column public.profiles.care_pod_agreement_version is
  'Version/reference of the Care Pod agreement or protocol accepted by the professional.';
comment on column public.profiles.care_pod_agreement_accepted_at is
  'When the professional accepted the referenced Care Pod agreement/protocol version.';
