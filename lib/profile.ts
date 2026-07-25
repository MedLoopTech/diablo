import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import type { Role } from "@/lib/roles";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  timezone: string;
};

/** Current user's profile, or null when signed out / env not configured. */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!supabaseConfigured()) return null;
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, avatar_url, timezone")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}
