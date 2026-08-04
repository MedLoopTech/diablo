import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { syncCgmConnection } from "@/lib/cgm-sync";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabase();
  const { data: connections } = await admin
    .from("cgm_connections")
    .select("id")
    .eq("active", true);

  if (!connections?.length) return NextResponse.json({ synced: 0 });

  const results = await Promise.allSettled(
    connections.map((c) => syncCgmConnection(c.id))
  );

  const inserted = results.reduce((sum, r) => {
    return sum + (r.status === "fulfilled" ? r.value.inserted : 0);
  }, 0);

  const errors = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ synced: connections.length, inserted, errors });
}
