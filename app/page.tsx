export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { homePathForRole } from "@/lib/roles";
import { MarketingLanding } from "@/components/marketing/MarketingLanding";

const TITLE = "90 Days to Diabetes Remission — Loop/90";
const DESCRIPTION =
  "A doctor-led 90-day cohort program for type-2 diabetes remission, built around real Pakistani food. One doctor, one nutritionist, one coach, one AI — per cohort.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "Loop/90",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512 }],
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION, images: ["/icon-512.png"] },
};

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
