import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { libreLogin, libreGetConnections, encryptToken } from "@/lib/cgm";
import { getMyPlanFeatures } from "@/lib/plan";

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { features } = await getMyPlanFeatures();
  if (!features.cgmSync) {
    return NextResponse.json({ error: "CGM sync requires a Premium plan." }, { status: 403 });
  }

  const { email, password } = await request.json();
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  // Authenticate with LibreView
  let auth;
  try {
    auth = await libreLogin(email.trim().toLowerCase(), password);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  // Discover the patient's LibreView patientId from their connections
  let patientId = auth.userId;
  try {
    const connections = await libreGetConnections(auth.token);
    if (connections.length > 0) patientId = connections[0];
  } catch {
    // fall back to userId
  }

  const admin = createAdminSupabase();
  const { error } = await admin.from("cgm_connections").upsert(
    {
      patient_id: user.id,
      provider: "libre",
      provider_user_id: patientId,
      auth_token_enc: encryptToken(auth.token),
      token_expires_at: auth.expiresAt.toISOString(),
      active: true,
      error_message: null,
    },
    { onConflict: "patient_id,provider" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
