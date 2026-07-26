"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/roles";

export async function completeOnboarding(
  name: string,
  phone?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!name.trim()) return { ok: false, error: "Your name is required." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: name.trim(),
      phone: phone?.trim() || null,
      onboarding_complete: true,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  redirect(homePathForRole(profile?.role ?? "patient"));
}
