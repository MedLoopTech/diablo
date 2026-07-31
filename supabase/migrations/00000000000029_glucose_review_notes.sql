-- Migration 29: let doctors annotate / mark flagged glucose readings as reviewed

ALTER TABLE public.glucose_readings
  ADD COLUMN IF NOT EXISTS doctor_note   text,
  ADD COLUMN IF NOT EXISTS reviewed_at   timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Doctors (and admin) can update readings for patients in their pods
CREATE POLICY "pod_staff_can_review_glucose"
  ON public.glucose_readings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.cohort_members cm
      JOIN public.care_pods pod ON pod.cohort_id = cm.cohort_id
      WHERE cm.patient_id = glucose_readings.patient_id
        AND (
          pod.doctor_id        = auth.uid()
          OR pod.nutritionist_id = auth.uid()
          OR pod.coach_id        = auth.uid()
        )
    )
    OR public.is_admin()
  )
  WITH CHECK (true);
