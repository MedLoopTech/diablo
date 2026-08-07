export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { homePathForRole } from "@/lib/roles";
import MarketingLanding from "./(marketing)/page";

export default async function RootPage() {
  if (!supabaseConfigured()) redirect("/login");

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous visitors land on the public marketing page instead of being
  // bounced straight to a login form — this is the actual public homepage.
  if (!user) return <MarketingLanding />;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(homePathForRole(profile?.role ?? "patient"));
}
