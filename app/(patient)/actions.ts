"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { GlucoseContext, GlucoseFlag } from "@/lib/types";

export type LogResult =
  | { ok: true; flag: GlucoseFlag; value: number }
  | { ok: false; error: string };

export async function logGlucose(
  value: number,
  context: GlucoseContext,
  photoPath?: string | null
): Promise<LogResult> {
  if (!Number.isInteger(value) || value <= 0 || value >= 1000) {
    return { ok: false, error: "Enter a value between 1 and 999 mg/dL." };
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  // The BEFORE-INSERT trigger stamps flag; AFTER-INSERT creates any escalation
  // and awards points. We read the flag back to drive the feedback state.
  const { data, error } = await supabase
    .from("glucose_readings")
    .insert({
      patient_id: user.id,
      value_mgdl: value,
      context,
      photo_url: photoPath ?? null,
    })
    .select("flag, value_mgdl")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not save the reading." };
  }

  revalidatePath("/today");
  revalidatePath("/log");
  revalidatePath("/progress");
  return { ok: true, flag: data.flag as GlucoseFlag, value: data.value_mgdl };
}

export async function toggleTask(
  taskId: string,
  done: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const { error } = await supabase.rpc("complete_task", {
    task_id: taskId,
    done,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/today");
  return { ok: true };
}
