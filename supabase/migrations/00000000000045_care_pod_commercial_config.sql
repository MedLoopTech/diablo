-- Migration 45: Loop/90 Care Pod founding-cohort commercial defaults
--
-- Reuses the existing automation_config + Admin -> Settings mechanism.
-- No new settings service or compensation subsystem is introduced here.
-- These are mutable DEFAULTS for planning/new assignments only; when historical
-- payout audit is implemented, agreed cohort/professional amounts must be
-- snapshotted so later config edits cannot rewrite prior obligations.

insert into public.automation_config (key, label, description, group_name, sort_order, value)
values
  (
    'loop90_program_list_price',
    'Loop/90 program list price',
    'Program/list-value anchor used for commercial planning. Recognize actual collected revenue separately.',
    'general',
    20,
    '25000'
  ),
  (
    'loop90_founding_price',
    'Loop/90 founding-cohort price',
    'Base-case realized price per paid founding-cohort participant.',
    'general',
    21,
    '20000'
  ),
  (
    'care_pod_doctor_base_payout',
    'Care Pod doctor base payout',
    'Default 90-day cohort base allocation for the assigned doctor. Default only; historical agreed amounts must eventually be snapshotted.',
    'general',
    30,
    '52500'
  ),
  (
    'care_pod_nutritionist_base_payout',
    'Care Pod nutritionist base payout',
    'Default 90-day cohort base allocation for the assigned nutritionist. Default only; historical agreed amounts must eventually be snapshotted.',
    'general',
    31,
    '42500'
  ),
  (
    'care_pod_coach_base_payout',
    'Care Pod movement coach base payout',
    'Default 90-day cohort base allocation for the assigned movement coach. Default only; historical agreed amounts must eventually be snapshotted.',
    'general',
    32,
    '32500'
  ),
  (
    'care_pod_activity_budget_cap',
    'Care Pod additional activity budget cap',
    'Cohort #1 planning cap for approved additional Care Pod activity compensation before separately funded 1:1 appointments.',
    'general',
    33,
    '30000'
  ),
  (
    'care_pod_additional_appointment_price',
    'Additional 1:1 appointment price',
    'Pilot default price for a separately billed additional 1:1 appointment. Clinical safety escalation must never depend on purchasing an appointment.',
    'general',
    40,
    '2000'
  ),
  (
    'care_pod_appointment_professional_share_pct',
    'Appointment professional share %',
    'Pilot default percentage of separately billed additional appointment revenue allocated to the professional.',
    'general',
    41,
    '70'
  )
on conflict (key) do nothing;
