import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Called daily by Vercel Cron (vercel.json) or an external scheduler.
// Creates consult bookings / escalation prompts at cohort days 45 and 90.
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const todayPKT = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });

  // Fetch all active cohort members with their cohort start dates.
  const { data: members } = await supabase
    .from("cohort_members")
    .select("patient_id, cohorts(start_date, status, care_pods(doctor_id))")
    .eq("cohorts.status", "active");

  let prompted = 0;

  for (const m of members ?? []) {
    const row = m as {
      patient_id: string;
      cohorts?: {
        start_date?: string;
        status?: string;
        care_pods?: { doctor_id?: string };
      };
    };
    const startDate = row.cohorts?.start_date;
    if (!startDate) continue;

    const dayNum =
      Math.floor(
        (new Date(todayPKT).getTime() - new Date(startDate).getTime()) / 86400000
      ) + 1;

    if (dayNum !== 45 && dayNum !== 90) continue;

    const kind = dayNum === 45 ? "medication_review_day45" : "hba1c_lab_day90";
    const body =
      dayNum === 45
        ? "You've reached Day 45 — a great time for a medication review with your doctor. Book a consult to discuss how your body is responding to the current plan."
        : "You've reached Day 90 — please schedule an HbA1c lab test to measure your remission progress. Your doctor will review the results in your final consult.";

    // Check we haven't already created this prompt for this patient.
    const { count } = await supabase
      .from("escalations")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", row.patient_id)
      .eq("kind", kind);

    if ((count ?? 0) > 0) continue;

    // Insert a chat message (AI) and an escalation.
    await Promise.all([
      supabase.from("chat_messages").insert({
        patient_id: row.patient_id,
        sender: "ai",
        body,
      }),
      supabase.from("escalations").insert({
        patient_id: row.patient_id,
        kind: "ai_routed",
        payload: { kind, day: dayNum, message: body },
        assigned_to: row.cohorts?.care_pods?.doctor_id ?? null,
        status: "open",
      }),
    ]);

    prompted++;
  }

  return NextResponse.json({ ok: true, prompted, date: todayPKT });
}
