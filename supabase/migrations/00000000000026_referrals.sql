-- Migration 26: Referral codes + referrals tracking
-- Professionals (or external partners) get a code; PKR 2,000 per enrolled patient.

CREATE TABLE public.referral_codes (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text    UNIQUE NOT NULL,
  -- referrer_id: null for external partners who don't have a profile yet
  referrer_id     uuid    REFERENCES public.profiles(id),
  partner_name    text,   -- display name (required when referrer_id is null)
  partner_contact text,   -- phone/WhatsApp for external partners
  is_active       boolean DEFAULT true,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Staff/partners see their own code; admin sees all
CREATE POLICY "referral_codes_select" ON public.referral_codes
  FOR SELECT USING (referrer_id = auth.uid() OR public.is_admin());

-- Only admin can create / update codes
CREATE POLICY "referral_codes_insert" ON public.referral_codes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "referral_codes_update" ON public.referral_codes
  FOR UPDATE USING (public.is_admin());

-- Also let anyone validate a code (needed for the onboarding form check)
CREATE POLICY "referral_codes_public_read_active" ON public.referral_codes
  FOR SELECT USING (is_active = true);


CREATE TABLE public.referrals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text NOT NULL REFERENCES public.referral_codes(code),
  referrer_id    uuid REFERENCES public.profiles(id),
  patient_id     uuid REFERENCES public.profiles(id),
  enrolled_at    timestamptz,
  payout_pkr     int  DEFAULT 2000,
  payout_status  text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  paid_at        timestamptz,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Referrer sees their own rows; admin sees all
CREATE POLICY "referrals_select" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR patient_id = auth.uid() OR public.is_admin());

-- Authenticated patient inserts their own referral with a valid active code
CREATE POLICY "referrals_patient_insert" ON public.referrals
  FOR INSERT WITH CHECK (
    patient_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.referral_codes rc
      WHERE rc.code = referrals.code AND rc.is_active = true
    )
  );

-- Admin can update (mark paid, correct referrer_id, etc.)
CREATE POLICY "referrals_admin_update" ON public.referrals
  FOR UPDATE USING (public.is_admin());
