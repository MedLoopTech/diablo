"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/roles";

/** Step 1: save name/phone/referral only. Does NOT complete onboarding yet. */
export async function saveProfile(
  name: string,
  phone?: string,
  referralCode?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!name.trim()) return { ok: false, error: "Your name is required." };

  if (referralCode) {
    const { data: rc } = await supabase
      .from("referral_codes")
      .select("code, referrer_id")
      .eq("code", referralCode)
      .eq("is_active", true)
      .maybeSingle();

    if (!rc) return { ok: false, error: `Referral code "${referralCode}" not found or inactive.` };

    const { data: cfg } = await supabase
      .from("automation_config")
      .select("value")
      .eq("key", "referral_payout_pkr")
      .maybeSingle();
    const payoutPkr = cfg ? parseInt(cfg.value as string, 10) || 2000 : 2000;

    await supabase.from("referrals").insert({
      code: rc.code,
      referrer_id: rc.referrer_id,
      patient_id: user.id,
      enrolled_at: new Date().toISOString(),
      payout_pkr: payoutPkr,
    });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name.trim(), phone: phone?.trim() || null })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type PreExistingMed = { name: string; dose?: string; frequency?: string };

/** Step 2: save medical history and mark onboarding complete. */
export async function saveMedicalHistory(data: {
  diabetesType?: string;
  diagnosisYear?: number;
  allergies: string[];
  comorbidities: string[];
  preExistingMeds: PreExistingMed[];
  familyHistory?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: mhErr } = await supabase.from("medical_history").upsert(
    {
      patient_id: user.id,
      diabetes_type: data.diabetesType || null,
      diagnosis_year: data.diagnosisYear || null,
      allergies: data.allergies,
      comorbidities: data.comorbidities,
      pre_existing_meds: data.preExistingMeds,
      family_history: data.familyHistory?.trim() || null,
      updated_by: user.id,
    },
    { onConflict: "patient_id" }
  );
  if (mhErr) return { ok: false, error: mhErr.message };

  await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(homePathForRole(profile?.role ?? "patient"));
}

/** Skip medical history step — marks onboarding complete without intake data. */
export async function skipMedicalHistory(): Promise<void> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(homePathForRole(profile?.role ?? "patient"));
}

/** Legacy alias — kept so any existing calls still compile. Calls saveProfile + skipMedicalHistory flow. */
export async function completeOnboarding(
  name: string,
  phone?: string,
  referralCode?: string
): Promise<{ ok: boolean; error?: string }> {
  const r = await saveProfile(name, phone, referralCode);
  if (!r.ok) return r;

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", user.id);
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  redirect(homePathForRole(profile?.role ?? "patient"));
}
