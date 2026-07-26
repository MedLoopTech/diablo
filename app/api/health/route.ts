import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/env";

export const runtime = "edge";

export async function GET() {
  const checks = {
    supabase: supabaseConfigured(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  };

  const healthy = checks.supabase;
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", ...checks },
    { status: healthy ? 200 : 503 }
  );
}
