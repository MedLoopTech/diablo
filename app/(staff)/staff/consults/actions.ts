"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function createConsultWindow(
  date: string,
  startTime: string,
  endTime: string,
  slotMinutes: number
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  // RLS: consult_windows insert requires staff_id = auth.uid().
  const { error } = await supabase.from("consult_windows").insert({
    staff_id: user.id,
    date,
    start_time: startTime,
    end_time: endTime,
    slot_minutes: slotMinutes,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff/consults");
  return { ok: true };
}
