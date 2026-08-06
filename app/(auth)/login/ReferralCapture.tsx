"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export const REFERRAL_STORAGE_KEY = "sehat90_ref_code";

/**
 * A patient lands here from a doctor's shared WhatsApp link
 * (/login?ref=CODE), not yet signed in. The code has nowhere to live
 * through the OTP round-trip except localStorage — /onboard reads it back
 * once the account exists.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) localStorage.setItem(REFERRAL_STORAGE_KEY, ref.trim().toUpperCase());
  }, [searchParams]);

  return null;
}
