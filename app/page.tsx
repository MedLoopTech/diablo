import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/roles";

export default async function RootPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(homePathForRole(profile?.role ?? "patient"));
}
