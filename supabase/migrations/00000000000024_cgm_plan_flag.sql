-- Add cgm_sync as a plan-gated feature: off for basic/plus, on for premium by default.
insert into public.plan_feature_flags (plan, feature_key, label, enabled, sort_order) values
  ('basic',   'cgm_sync', 'CGM auto-sync (Freestyle Libre)', false, 6),
  ('plus',    'cgm_sync', 'CGM auto-sync (Freestyle Libre)', false, 6),
  ('premium', 'cgm_sync', 'CGM auto-sync (Freestyle Libre)', true,  6)
on conflict (plan, feature_key) do nothing;
