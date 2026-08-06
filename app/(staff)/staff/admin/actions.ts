"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import type { RewardType } from "@/lib/admin";
import { formatMoney } from "@/lib/currency";
import { getPlatformCurrency } from "@/lib/currency-server";

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
  rewardType: RewardType = "cash",
  rewardValue: Record<string, unknown> = {},
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
    reward_type: rewardType,
    reward_value: rewardValue,
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

function genVoucherCode(): string {
  return `VCHR-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function markReferralsPaid(
  ids: string[]
): Promise<{ ok: boolean; error?: string; fulfillments?: { referralId: string; note: string }[] }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Only a converted referral can be paid — a "referred" row means the
  // patient signed up with the code but never actually enrolled.
  const { data: rows, error: fetchError } = await supabase
    .from("referrals")
    .select("id, code, patient_id, payout_pkr")
    .in("id", ids)
    .eq("status", "converted");
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!rows || rows.length === 0) return { ok: true, fulfillments: [] };

  const codes = Array.from(new Set(rows.map((r) => r.code)));
  const [{ data: codeRows, error: codeError }, currency] = await Promise.all([
    supabase.from("referral_codes").select("code, reward_type, reward_value").in("code", codes),
    getPlatformCurrency(supabase),
  ]);
  if (codeError) return { ok: false, error: codeError.message };
  const codeMap = new Map((codeRows ?? []).map((c) => [c.code, c]));

  const fulfillments: { referralId: string; note: string }[] = [];
  const paidIds: string[] = [];
  const fulfillmentRows: { referral_id: string; reward_type: RewardType; fulfilled_by: string; details: Record<string, unknown> }[] = [];

  for (const r of rows) {
    const rc = codeMap.get(r.code);
    const rewardType = (rc?.reward_type as RewardType) ?? "cash";
    const rewardValue = (rc?.reward_value as Record<string, unknown>) ?? {};

    if (rewardType === "plan_upgrade") {
      const tier = (rewardValue.tier as string) ?? "plus";
      if (r.patient_id) {
        const { error: planError } = await supabase.from("profiles").update({ plan: tier }).eq("id", r.patient_id);
        if (planError) return { ok: false, error: planError.message };
      }
      fulfillmentRows.push({ referral_id: r.id, reward_type: rewardType, fulfilled_by: user.id, details: { tier } });
      fulfillments.push({ referralId: r.id, note: `Plan upgraded to ${tier}` });
    } else if (rewardType === "voucher") {
      const voucherCode = genVoucherCode();
      fulfillmentRows.push({
        referral_id: r.id,
        reward_type: rewardType,
        fulfilled_by: user.id,
        details: { voucher_code: voucherCode, partner: rewardValue.partner ?? null, discount_pct: rewardValue.discount_pct ?? null },
      });
      fulfillments.push({ referralId: r.id, note: `Voucher ${voucherCode}` });
    } else if (rewardType === "consult" || rewardType === "resource") {
      fulfillmentRows.push({ referral_id: r.id, reward_type: rewardType, fulfilled_by: user.id, details: rewardValue });
      fulfillments.push({ referralId: r.id, note: rewardType === "consult" ? "Consult entitlement recorded — book manually" : "Resource entitlement recorded" });
    } else {
      fulfillmentRows.push({ referral_id: r.id, reward_type: "cash", fulfilled_by: user.id, details: { amount_pkr: r.payout_pkr } });
      fulfillments.push({ referralId: r.id, note: `${formatMoney(r.payout_pkr, currency)} paid` });
    }
    paidIds.push(r.id);
  }

  // Insert the audit trail before flipping status — if this fails, the
  // referrals stay "converted" and a retry is clean. Flipping status first
  // would let a failed insert here leave referrals marked paid with no
  // fulfillment record, and an invisible one at that: a retry would find
  // nothing left in "converted" state and silently report success.
  const { error: fulfillError } = await supabase.from("reward_fulfillments").insert(fulfillmentRows);
  if (fulfillError) return { ok: false, error: fulfillError.message };

  const { error: updateError } = await supabase
    .from("referrals")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .in("id", paidIds);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath("/staff/admin");
  revalidatePath("/staff/payouts");
  return { ok: true, fulfillments };
}
