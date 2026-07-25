import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { serviceRoleKey, supabaseUrl } from "@/lib/env";

/**
 * Demo login: signs into one of the seeded demo accounts so the app can be
 * toured across roles without email. DISABLED in production, and restricted to
 * the @sehat90.app demo accounts, so it can never impersonate a real user.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Demo login is disabled in production.", { status: 404 });
  }
  const email = new URL(request.url).searchParams.get("email");
  if (!email || !email.endsWith("@sehat90.app")) {
    return NextResponse.json({ error: "demo accounts only (@sehat90.app)" }, { status: 400 });
  }
  const url = supabaseUrl();
  const svc = serviceRoleKey();
  if (!url || !svc) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const supabase = createServerSupabase();
  await supabase.auth.signOut().catch(() => {});

  const admin = createClient(url, svc, { auth: { autoRefreshToken: false, persistSession: false } });
  // The account must already exist (created by the seed); do not create arbitrary users.
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data?.properties?.hashed_token) {
    return NextResponse.json({ error: "run scripts/seed.mjs first" }, { status: 404 });
  }
  const { error: vErr } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  });
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });
  return NextResponse.redirect(new URL("/", request.url));
}
