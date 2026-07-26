"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

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

export async function enrollPatient(cohortId: string, patientId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admins only." };
  const { error } = await supabase.from("cohort_members").insert({ cohort_id: cohortId, patient_id: patientId });
  if (error) return { ok: false, error: error.message.includes("duplicate") ? "Already enrolled." : error.message };
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
