import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Weekly cron: writes a progress_snapshots row per active patient.
// Vercel Cron calls this every Sunday at 1 am UTC (6 am PKT).
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const todayPKT = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
  const weekAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });

  const { data: members } = await supabase
    .from("cohort_members")
    .select("patient_id, cohorts(status)")
    .eq("cohorts.status", "active");

  let written = 0;

  for (const m of members ?? []) {
    const row = m as { patient_id: string };

    // Average fasting glucose this week.
    const { data: readings } = await supabase
      .from("glucose_readings")
      .select("value_mgdl")
      .eq("patient_id", row.patient_id)
      .gte("taken_at", weekAgo + "T00:00:00+00:00")
      .eq("context", "fasting");

    const values = (readings ?? []).map((r: { value_mgdl: number }) => r.value_mgdl);
    const avgFasting = values.length
      ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length)
      : null;

    // Latest weight this week.
    const { data: weights } = await supabase
      .from("weight_logs")
      .select("weight_kg")
      .eq("patient_id", row.patient_id)
      .gte("logged_at", weekAgo + "T00:00:00+00:00")
      .order("logged_at", { ascending: false })
      .limit(1);

    const latestWeight = weights?.[0]?.weight_kg ?? null;

    // Task completion rate.
    const { data: tasks } = await supabase
      .from("tasks")
      .select("completed")
      .eq("patient_id", row.patient_id)
      .gte("due_date", weekAgo);

    const totalTasks = tasks?.length ?? 0;
    const doneTasks = (tasks ?? []).filter((t: { completed: boolean }) => t.completed).length;
    const taskPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : null;

    const { error } = await supabase.from("progress_snapshots").insert({
      patient_id: row.patient_id,
      snapshot_date: todayPKT,
      avg_fasting_7d: avgFasting,       // existing column
      avg_fasting_glucose: avgFasting,  // new column (same value)
      weight_kg: latestWeight,
      task_completion_pct: taskPct,
    });
    if (!error) written++;
  }

  return NextResponse.json({ ok: true, written, date: todayPKT });
}
