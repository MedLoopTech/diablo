"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

async function requireAdmin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, ok: data?.role === "admin" };
}

export async function createCohort(name: string, startDate: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  if (!name.trim() || !startDate) return { ok: false, error: "Name and start date required." };
  const { error } = await supabase.from("cohorts").insert({ name: name.trim(), start_date: startDate, status: "enrolling" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function assignPod(
  cohortId: string,
  doctorId: string | null,
  nutritionistId: string | null,
  coachId: string | null
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };

  const { data: existing } = await supabase.from("care_pods").select("id").eq("cohort_id", cohortId).maybeSingle();
  const fields = { doctor_id: doctorId || null, nutritionist_id: nutritionistId || null, coach_id: coachId || null };
  const { error } = existing
    ? await supabase.from("care_pods").update(fields).eq("id", existing.id)
    : await supabase.from("care_pods").insert({ cohort_id: cohortId, ...fields });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function enrollPatient(
  cohortId: string,
  patientId: string,
  baselineHba1c?: number | null,
  baselineWeightKg?: number | null,
  baselineFastingGlucose?: number | null,
  targetNotes?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  const { error } = await supabase.from("cohort_members").insert({
    cohort_id: cohortId,
    patient_id: patientId,
    ...(baselineFastingGlucose ? { baseline_fasting_glucose: baselineFastingGlucose } : {}),
    ...(targetNotes ? { target_notes: targetNotes.trim() } : {}),
  });
  if (error) return { ok: false, error: error.message.includes("duplicate") ? "Already enrolled." : error.message };
  // Persist baseline metrics on the profile when provided.
  if (baselineHba1c || baselineWeightKg) {
    await supabase.from("profiles").update({
      ...(baselineHba1c ? { baseline_hba1c: baselineHba1c } : {}),
      ...(baselineWeightKg ? { baseline_weight_kg: baselineWeightKg } : {}),
    }).eq("id", patientId);
  }
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function setCohortStatus(cohortId: string, status: "enrolling" | "active" | "completed"): Promise<{ ok: boolean }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false };
  await supabase.from("cohorts").update({ status }).eq("id", cohortId);
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function createResource(form: {
  title: string;
  type: string;
  description: string;
  url: string;
  tags: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  if (!form.title.trim()) return { ok: false, error: "Title required." };
  const tags = form.tags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const { error } = await supabase.from("resources").insert({
    title: form.title.trim(),
    type: form.type,
    description: form.description.trim() || null,
    url: form.url.trim() || null,
    tags,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  revalidatePath("/resources");
  return { ok: true };
}

export async function toggleResource(id: string, isActive: boolean): Promise<{ ok: boolean }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false };
  await supabase.from("resources").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/staff/admin");
  revalidatePath("/resources");
  return { ok: true };
}

export async function setPatientPlan(patientId: string, plan: "basic" | "plus" | "premium"): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  const { error } = await supabase.from("profiles").update({ plan }).eq("id", patientId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function togglePlanFeature(plan: string, featureKey: string, enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  const { error } = await supabase
    .from("plan_feature_flags")
    .update({ enabled })
    .eq("plan", plan)
    .eq("feature_key", featureKey);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function setTemplatePhotoMode(
  templateId: string,
  photoMode: "off" | "optional" | "required",
  photoPtsBonus: number
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  const { error } = await supabase
    .from("task_templates")
    .update({ photo_mode: photoMode, photo_points_bonus: photoPtsBonus })
    .eq("id", templateId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function saveAutomationConfig(key: string, value: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  if (!key) return { ok: false, error: "Key required." };
  const { error } = await supabase
    .from("automation_config")
    .update({ value })
    .eq("key", key);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function updatePerson(id: string, name: string, phone: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  if (!name.trim()) return { ok: false, error: "Name required." };
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name.trim(), phone: phone.trim() || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAdminClient(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured in .env.local");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function inviteStaff(
  email: string,
  role: string,
  name: string,
  phone?: string
): Promise<{ ok: boolean; error?: string }> {
  const { ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  if (!email.trim() || !role || !name.trim()) return { ok: false, error: "Email, role, and name required." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminClient: any;
  try {
    adminClient = getAdminClient();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const { data, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email.trim(), {
    options: { data: { role, full_name: name.trim() } },
  });
  if (inviteErr) return { ok: false, error: inviteErr.message };

  // Set role, name, and phone on the profile the trigger just created.
  // inviteUserByEmail() only ever populates auth.users.email — unlike phone-OTP
  // self-signup, there's no auth.users.phone for handle_new_user() to copy from,
  // so it has to be written here instead.
  await adminClient
    .from("profiles")
    .update({ role, full_name: name.trim(), phone: phone?.trim() || null })
    .eq("id", data.user.id);

  revalidatePath("/staff/admin");
  return { ok: true };
}

// ─── Referral actions ─────────────────────────────────────────────────────────

function genCode(prefix: string): string {
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix.toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 12)}-${suffix}`;
}

export async function createReferralCode(
  referrerIdOrNull: string | null,
  partnerName: string | null,
  partnerContact: string | null,
  notes: string | null,
  paymentMethod: string | null,
  accountTitle: string | null,
  accountNumber: string | null,
): Promise<{ ok: boolean; code?: string; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };

  const prefix = partnerName ?? "PARTNER";
  const code = genCode(prefix);

  const { error } = await supabase.from("referral_codes").insert({
    code,
    referrer_id: referrerIdOrNull,
    partner_name: partnerName,
    partner_contact: partnerContact,
    notes,
    payment_method: paymentMethod || null,
    account_title: accountTitle || null,
    account_number: accountNumber || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/staff/admin");
  return { ok: true, code };
}

export async function saveReferralCodePayment(
  id: string,
  paymentMethod: string | null,
  accountTitle: string | null,
  accountNumber: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  const { error } = await supabase
    .from("referral_codes")
    .update({ payment_method: paymentMethod || null, account_title: accountTitle || null, account_number: accountNumber || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function toggleReferralCode(id: string, isActive: boolean): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  const { error } = await supabase.from("referral_codes").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  return { ok: true };
}

export async function markReferralsPaid(ids: string[]): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  // Only a converted referral can be paid — a "referred" row means the
  // patient signed up with the code but never actually enrolled.
  const { error } = await supabase
    .from("referrals")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .in("id", ids)
    .eq("status", "converted");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/admin");
  revalidatePath("/staff/payouts");
  return { ok: true };
}
