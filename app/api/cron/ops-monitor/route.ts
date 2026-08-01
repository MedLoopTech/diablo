import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { loadConfig } from "@/lib/automation";
import { sendTelegram } from "@/lib/notify";

// Runs daily at 7 am PKT (2 am UTC) via Vercel Cron.
// Checks urgent glucose readings, inactive patients, and overdue tasks,
// then sends a single ops report to the staff Telegram chat.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const cfg = await loadConfig();
  const inactivityDays = parseInt(cfg.threshold_inactivity_days ?? "3", 10);

  const todayPKT = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
  const datePKT = new Date().toLocaleDateString("en-PK", {
    timeZone: "Asia/Karachi",
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // ── 1. Urgent glucose (≥250 or ≤70, not yet acknowledged, last 24h) ──────────
  const since24h = new Date(Date.now() - 86400000).toISOString();
  const { data: urgentRows } = await supabase
    .from("glucose_readings")
    .select("value_mgdl, created_at, flag, profiles:patient_id(full_name)")
    .eq("flag", "urgent")
    .gte("created_at", since24h)
    .order("created_at", { ascending: false })
    .limit(50);

  // ── 2. Inactive patients (no log in N days, cohort active) ─────────────────
  const cutoff = new Date(Date.now() - inactivityDays * 86400000)
    .toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
  const { data: inactiveRows } = await supabase
    .from("profiles")
    .select("full_name, last_active_date, cohort_members!inner(cohorts!inner(status))")
    .eq("role", "patient")
    .eq("cohort_members.cohorts.status", "active")
    .not("last_active_date", "is", null)
    .lt("last_active_date", cutoff)
    .limit(50);

  // ── 3. Overdue tasks ────────────────────────────────────────────────────────
  const { data: overdueRows } = await supabase
    .from("tasks")
    .select("title, due_date, profiles:patient_id(full_name)")
    .is("completed_at", null)
    .lt("due_date", todayPKT)
    .order("due_date")
    .limit(100);

  // ── Build report ────────────────────────────────────────────────────────────
  const urgent = (urgentRows ?? []) as Array<{ value_mgdl: number; flag: string; profiles?: { full_name?: string } }>;
  const inactive = (inactiveRows ?? []) as Array<{ full_name?: string; last_active_date?: string }>;
  const overdue = (overdueRows ?? []) as Array<{ title?: string; due_date?: string; profiles?: { full_name?: string } }>;

  const urgentLines = urgent.length
    ? urgent.map((r) => `  - ${r.profiles?.full_name ?? "?"}: ${r.value_mgdl} mg/dL`).join("\n")
    : "  None";

  const inactiveLines = inactive.length
    ? inactive.map((p) => {
        const days = p.last_active_date
          ? Math.floor((Date.now() - new Date(p.last_active_date).getTime()) / 86400000)
          : "?";
        return `  - ${p.full_name ?? "?"} — ${days} days silent`;
      }).join("\n")
    : "  None";

  const overdueLines = overdue.slice(0, 10).map(
    (t) => `  - ${t.profiles?.full_name ?? "?"}: "${t.title}" (due ${t.due_date})`
  ).join("\n") + (overdue.length > 10 ? `\n  ...and ${overdue.length - 10} more` : "");

  const report = [
    `*Daily Ops Report — ${datePKT}*`,
    "",
    `🚨 *Urgent Glucose (${urgent.length}):*`,
    urgentLines,
    "",
    `😴 *Inactive Patients >${inactivityDays}d (${inactive.length}):*`,
    inactiveLines,
    "",
    `📋 *Overdue Tasks (${overdue.length}):*`,
    overdue.length ? overdueLines : "  None",
  ].join("\n");

  const chatId = cfg.notify_ops_telegram_chat_id ?? "";
  await sendTelegram(chatId, report);

  return NextResponse.json({
    ok: true,
    date: todayPKT,
    urgentCount: urgent.length,
    inactiveCount: inactive.length,
    overdueCount: overdue.length,
  });
}
