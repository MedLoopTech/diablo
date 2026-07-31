-- Migration 31: episode-based escalation cooldowns
--
-- Problem: the original trigger fired one escalation per flagged reading,
-- flooding the doctor queue (80+ items for 6 patients over 5 weeks).
--
-- Clinical approach:
--   URGENT (≥250 or ≤70): one escalation per patient per 4-hour window.
--     A single hyperglycaemic or hypoglycaemic episode may produce several
--     readings; the doctor needs one alert, not one per reading.
--   ROUTINE (≥180–249): one escalation per patient per 24-hour window.
--     The "Flagged readings by patient" dashboard panel already surfaces
--     every individual reading for daily review — an additional per-reading
--     escalation is alert fatigue, not clinical signal.
--
-- Existing open escalations are resolved en-masse so the queue starts clean.

-- 1. Resolve all pre-existing glucose escalations (stale per-reading noise).
UPDATE public.escalations
SET status      = 'resolved',
    resolved_at = now()
WHERE kind IN ('glucose_urgent', 'glucose_routine')
  AND status != 'resolved';

-- 2. Replace the after-insert trigger function with cooldown logic.
CREATE OR REPLACE FUNCTION public.glucose_after_insert()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_doctor       uuid;
  v_cooldown     interval;
  v_kind         public.escalation_kind;
  v_already_open boolean;
BEGIN
  -- Award points for every reading regardless of flag.
  PERFORM public.award_points(NEW.patient_id, 10, 'reading_logged');

  -- Only escalate flagged readings.
  IF NEW.flag NOT IN ('urgent', 'routine') THEN
    RETURN NEW;
  END IF;

  -- Episode cooldown windows.
  IF NEW.flag = 'urgent' THEN
    v_kind     := 'glucose_urgent';
    v_cooldown := INTERVAL '4 hours';
  ELSE
    v_kind     := 'glucose_routine';
    v_cooldown := INTERVAL '24 hours';
  END IF;

  -- Suppress if an open escalation of the same severity already exists
  -- for this patient within the cooldown window.
  SELECT EXISTS (
    SELECT 1
    FROM public.escalations e
    WHERE e.patient_id = NEW.patient_id
      AND e.kind       = v_kind
      AND e.status    != 'resolved'
      AND e.created_at > NOW() - v_cooldown
  ) INTO v_already_open;

  IF v_already_open THEN
    RETURN NEW;          -- suppress duplicate within episode window
  END IF;

  -- For urgent readings, also suppress routine if one is open (urgent > routine).
  IF NEW.flag = 'urgent' THEN
    UPDATE public.escalations
    SET status      = 'resolved',
        resolved_at = NOW()
    WHERE patient_id = NEW.patient_id
      AND kind       = 'glucose_routine'
      AND status    != 'resolved'
      AND created_at > NOW() - INTERVAL '24 hours';
  END IF;

  -- Look up the pod doctor.
  SELECT cp.doctor_id INTO v_doctor
  FROM public.cohort_members cm
  JOIN public.care_pods cp ON cp.cohort_id = cm.cohort_id
  WHERE cm.patient_id = NEW.patient_id
  LIMIT 1;

  INSERT INTO public.escalations (patient_id, kind, payload, assigned_to, status)
  VALUES (
    NEW.patient_id,
    v_kind,
    jsonb_build_object(
      'reading_id', NEW.id,
      'value_mgdl', NEW.value_mgdl,
      'context',    NEW.context,
      'taken_at',   NEW.taken_at,
      'flag',       NEW.flag
    ),
    v_doctor,
    'open'
  );

  RETURN NEW;
END;
$$;
