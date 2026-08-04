import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { loadConfig, interpolate } from "@/lib/automation";
import { sendWhatsApp } from "@/lib/notify";

// Runs every Sunday at 3 am UTC (8 am PKT) via Vercel Cron.
// Sends each active patient a weekly progress digest via WhatsApp.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const cfg = await loadConfig();

  // Fetch all active cohort members with cohort start dates for day calculation.
  const { data: members } = await supabase
    .from("cohort_members")
    .select("patient_id, cohorts(start_date, status), profiles:patient_id(full_name, phone, points_total, streak_days)")
    .eq("cohorts.status", "active");

  const todayPKT = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
  let sent = 0;
  let skipped = 0;

  for (const m of members ?? []) {
    const row = m as {
      patient_id: string;
      cohorts?: { start_date?: string; status?: string };
      profiles?: { full_name?: string; phone?: string; points_total?: number; streak_days?: number };
    };

    const phone = row.profiles?.phone ?? "";
    const name = row.profiles?.full_name ?? "there";
    if (!phone) { skipped++; continue; }

    const startDate = row.cohorts?.start_date;
    const cohortDay = startDate
      ? Math.min(90, Math.max(1,
          Math.floor((new Date(todayPKT).getTime() - new Date(startDate).getTime()) / 86400000) + 1
        ))
      : 1;
    const cohortWeek = Math.ceil(cohortDay / 7);

    const msg = interpolate(
      cfg.msg_weekly_digest_wa ?? "Week {cohort_week} update, {name}: {points} points, {streak} day streak.",
      {
        name,
        points: row.profiles?.points_total ?? 0,
        streak: row.profiles?.streak_days ?? 0,
        cohort_day: cohortDay,
        cohort_week: cohortWeek,
      }
    );

    const ok = await sendWhatsApp(phone, msg);
    if (ok) sent++; else skipped++;
  }

  return NextResponse.json({ ok: true, sent, skipped, date: todayPKT });
}
