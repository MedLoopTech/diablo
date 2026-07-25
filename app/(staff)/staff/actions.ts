"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function updateEscalationStatus(
  id: string,
  status: "acknowledged" | "resolved"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const patch: Record<string, unknown> = { status };
  if (status === "resolved") patch.resolved_at = new Date().toISOString();

  // RLS restricts updates to escalations the staff member is allowed to touch.
  const { error } = await supabase.from("escalations").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff");
  return { ok: true };
}
