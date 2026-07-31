"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";

export async function updateEscalationStatus(
  id: string,
  status: "acknowledged" | "resolved"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const patch: Record<string, unknown> = { status };
  if (status === "resolved") patch.resolved_at = new Date().toISOString();

  const { error } = await supabase.from("escalations").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff");
  revalidatePath("/staff/escalations");
  return { ok: true };
}

export async function markGlucoseReviewed(
  readingId: string,
  note: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized." };

  const { error } = await supabase
    .from("glucose_readings")
    .update({ doctor_note: note.trim() || null, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", readingId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff");
  return { ok: true };
}

export async function savePatientReview(
  patientId: string,
  weekStart: string,
  note: string,
  status: "reviewed" | "needs_followup" | "escalated"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized." };

  const { error } = await supabase
    .from("patient_reviews")
    .upsert(
      { patient_id: patientId, reviewed_by: user.id, week_start: weekStart, note: note.trim() || null, status },
      { onConflict: "patient_id,reviewed_by,week_start" }
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/weekly-review");
  return { ok: true };
}

export async function replyToPatient(
  patientId: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  if (!message.trim()) return { ok: false, error: "Message required." };
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized." };

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const role = profile?.role ?? "doctor";
  const name = profile?.full_name?.split(" ")[0] ?? "Your care team";

  const { error } = await supabase.from("chat_messages").insert({
    patient_id: patientId,
    sender: role,
    body: message.trim(),
  });
  if (error) return { ok: false, error: error.message };

  // Push notification to patient.
  const roleLabel: Record<string, string> = { doctor: "Doctor", nutritionist: "Nutritionist", coach: "Coach" };
  await sendPushToUser(supabase, patientId, {
    title: `Message from ${roleLabel[role] ?? "Care team"}`,
    body: `${name}: ${message.trim().slice(0, 100)}`,
    url: "/today",
  });

  revalidatePath("/staff");
  return { ok: true };
}
