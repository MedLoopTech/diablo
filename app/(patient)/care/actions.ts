"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Book a consult slot, attaching a context snapshot (last 3 days of readings +
 * meals) so the clinician sees the patient's recent picture at the visit —
 * SPEC §1 consult_bookings.context_snapshot.
 */
export async function bookSlot(
  windowId: string,
  slotTime: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: readings }, { data: meals }] = await Promise.all([
    supabase
      .from("glucose_readings")
      .select("value_mgdl, context, flag, taken_at")
      .eq("patient_id", user.id)
      .gte("taken_at", threeDaysAgo)
      .order("taken_at", { ascending: false }),
    supabase
      .from("meals")
      .select("meal_type, ai_analysis, eaten_at")
      .eq("patient_id", user.id)
      .gte("eaten_at", threeDaysAgo)
      .order("eaten_at", { ascending: false }),
  ]);

  const { error } = await supabase.from("consult_bookings").insert({
    window_id: windowId,
    slot_time: slotTime,
    patient_id: user.id,
    reason: reason || null,
    status: "booked",
    context_snapshot: {
      captured_at: new Date().toISOString(),
      readings: readings ?? [],
      meals: meals ?? [],
    },
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/care");
  return { ok: true };
}
