import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push";

// Runs at 3am UTC = 8am Karachi (UTC+5).
// Sends a personalised push nudge to patients who haven't logged glucose today.

const CRON_SECRET = process.env.CRON_SECRET;

// "Today" in Karachi = since midnight PKT (UTC-5h = 19:00 UTC yesterday).
function todayPKTStart(): string {
  const now = new Date();
  // midnight Karachi = today's date at 19:00 UTC the previous calendar day
  const karachi = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
  const midnight = new Date(karachi);
  midnight.setHours(0, 0, 0, 0);
  // Convert back to UTC: PKT is UTC+5 so subtract 5 hours
  return new Date(midnight.getTime() - 5 * 60 * 60 * 1000).toISOString();
}

function buildNudge(streak: number, cohortDay: number): { title: string; body: string } {
  if (cohortDay <= 3) {
    return {
      title: "Day " + cohortDay + " — you've got this",
      body: "Log your first glucose reading of the day. Takes 10 seconds.",
    };
  }
  if (streak === 0) {
    return {
      title: "Fresh start today",
      body: "Log your glucose to begin a new streak. Every day is a chance to reset.",
    };
  }
  if (streak >= 14) {
    return {
      title: streak + "-day streak 🔥",
      body: "Don't let today break it. One reading keeps the momentum alive.",
    };
  }
  if (streak >= 7) {
    return {
      title: "Week-long streak — impressive",
      body: "Log your glucose to keep the streak going. Your care team can see the progress.",
    };
  }
  if (streak >= 3) {
    return {
      title: streak + " days in a row",
      body: "One reading today keeps your streak alive. Your coach is watching the trend.",
    };
  }
  return {
    title: "Time to log your glucose",
    body: "Your doctor reviews readings every day. Make sure yours is there.",
  };
}

export async function GET(request: Request) {
  // Vercel calls cron routes with Authorization: Bearer <CRON_SECRET>.
  const auth = request.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabase();
  const todayStart = todayPKTStart();

  // All active patients: in a cohort where cohort day is 1–90.
  const { data: members, error: membersErr } = await admin
    .from("cohort_members")
    .select("patient_id, cohorts!inner(start_date)")
    .filter("cohorts.start_date", "lte", new Date().toISOString().slice(0, 10));

  if (membersErr) {
    console.error("[nudge] cohort_members fetch failed:", membersErr);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  type MemberRow = { patient_id: string; cohorts: unknown };
  const patients = (members ?? []) as MemberRow[];

  let nudged = 0;
  let skipped = 0;

  for (const row of patients) {
    const patient_id = row.patient_id;
    const cohortArr = row.cohorts as { start_date: string }[] | { start_date: string };
    const cohortObj = Array.isArray(cohortArr) ? cohortArr[0] : cohortArr;
    if (!cohortObj?.start_date) { skipped++; continue; }
    // Alias so the rest of the loop body is unchanged
    const cohorts = cohortObj;
    // Cohort day (1-based, capped at 90).
    const startMs = new Date(cohorts.start_date).getTime();
    const cohortDay = Math.min(90, Math.max(1, Math.floor((Date.now() - startMs) / 86_400_000) + 1));

    // Skip patients past day 90.
    if (cohortDay > 90) { skipped++; continue; }

    // Check whether they've already logged today.
    const { count } = await admin
      .from("glucose_readings")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patient_id)
      .gte("taken_at", todayStart);

    if ((count ?? 0) > 0) { skipped++; continue; }

    // Fetch current streak from points_ledger (streak = consecutive days with a log).
    const { data: streakRow } = await admin
      .from("profiles")
      .select("current_streak")
      .eq("id", patient_id)
      .maybeSingle();
    const streak: number = (streakRow as { current_streak?: number } | null)?.current_streak ?? 0;

    const { title, body } = buildNudge(streak, cohortDay);

    const sent = await sendPushToUser(admin, patient_id, {
      title,
      body,
      url: "/log",
    });

    if (sent > 0) nudged++;
    else skipped++; // no push subscription registered
  }

  return NextResponse.json({ ok: true, nudged, skipped, total: patients.length });
}
