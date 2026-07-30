import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { syncCgmConnection } from "@/lib/cgm-sync";

export async function POST() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: conn } = await supabase
    .from("cgm_connections")
    .select("id")
    .eq("patient_id", user.id)
    .eq("active", true)
    .single();

  if (!conn) return NextResponse.json({ error: "No active CGM connection." }, { status: 404 });

  const result = await syncCgmConnection(conn.id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, inserted: result.inserted });
}
