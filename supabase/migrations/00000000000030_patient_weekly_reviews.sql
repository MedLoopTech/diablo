-- Migration 30: weekly doctor sign-off on each patient

CREATE TABLE IF NOT EXISTS public.patient_reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_by  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start   date NOT NULL,          -- Monday of the review week
  note         text,
  status       text NOT NULL DEFAULT 'reviewed'
                   CHECK (status IN ('reviewed', 'needs_followup', 'escalated')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, reviewed_by, week_start)
);

ALTER TABLE public.patient_reviews ENABLE ROW LEVEL SECURITY;

-- Pod staff can insert and read reviews for their patients
CREATE POLICY "pod_staff_can_review_patients"
  ON public.patient_reviews
  FOR ALL
  USING (
    reviewed_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.cohort_members cm
      JOIN public.care_pods pod ON pod.cohort_id = cm.cohort_id
      WHERE cm.patient_id = patient_reviews.patient_id
        AND (
          pod.doctor_id        = auth.uid()
          OR pod.nutritionist_id = auth.uid()
          OR pod.coach_id        = auth.uid()
        )
    )
    OR public.is_admin()
  )
  WITH CHECK (
    reviewed_by = auth.uid() OR public.is_admin()
  );
