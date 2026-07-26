"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function markAllRead(): Promise<{ ok: boolean }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  return { ok: true };
}
