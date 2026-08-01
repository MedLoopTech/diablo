import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { loadConfig, interpolate } from "@/lib/automation";
import { sendWhatsApp } from "@/lib/notify";

// Runs every hour via Vercel Cron (GET + Authorization: Bearer CRON_SECRET).
// Sends 24-hour and 1-hour WhatsApp reminders for upcoming consultations.
// Uses reminder_24h_sent / reminder_1h_sent flags to prevent duplicates.
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

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
  const in1h = new Date(now.getTime() + 3600 * 1000).toISOString();

  // ── 24-hour reminders ───────────────────────────────────────────────────────
  const { data: due24h } = await supabase
    .from("consult_bookings")
    .select("id, consult_windows(scheduled_at, kind, profiles:staff_id(role)), profiles:patient_id(full_name, phone)")
    .eq("status", "confirmed")
    .eq("reminder_24h_sent", false)
    .gte("consult_windows.scheduled_at", now.toISOString())
    .lte("consult_windows.scheduled_at", in24h)
    .limit(100);

  let sent24h = 0;
  for (const booking of due24h ?? []) {
    const b = booking as {
      id: string;
      consult_windows?: { scheduled_at?: string; kind?: string };
      profiles?: { full_name?: string; phone?: string };
    };
    const phone = b.profiles?.phone ?? "";
    const name = b.profiles?.full_name ?? "there";
    const sessionTime = b.consult_windows?.scheduled_at
      ? new Date(b.consult_windows.scheduled_at).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })
      : "—";
    const sessionType = b.consult_windows?.kind ?? "consultation";

    const msg = interpolate(cfg.msg_session_24h_wa ?? "Reminder {name}: consultation tomorrow at {session_time}.", {
      name, session_time: sessionTime, session_type: sessionType,
    });

    const ok = await sendWhatsApp(phone, msg);
    if (ok) {
      await supabase.from("consult_bookings").update({ reminder_24h_sent: true }).eq("id", b.id);
      sent24h++;
    }
  }

  // ── 1-hour reminders ────────────────────────────────────────────────────────
  const { data: due1h } = await supabase
    .from("consult_bookings")
    .select("id, consult_windows(scheduled_at, kind, profiles:staff_id(role)), profiles:patient_id(full_name, phone)")
    .eq("status", "confirmed")
    .eq("reminder_1h_sent", false)
    .gte("consult_windows.scheduled_at", now.toISOString())
    .lte("consult_windows.scheduled_at", in1h)
    .limit(100);

  let sent1h = 0;
  for (const booking of due1h ?? []) {
    const b = booking as {
      id: string;
      consult_windows?: { scheduled_at?: string; kind?: string };
      profiles?: { full_name?: string; phone?: string };
    };
    const phone = b.profiles?.phone ?? "";
    const name = b.profiles?.full_name ?? "there";
    const sessionTime = b.consult_windows?.scheduled_at
      ? new Date(b.consult_windows.scheduled_at).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })
      : "—";
    const sessionType = b.consult_windows?.kind ?? "consultation";

    const msg = interpolate(cfg.msg_session_1h_wa ?? "{name}: session in 1 hour — {session_time}", {
      name, session_time: sessionTime, session_type: sessionType,
      app_url: cfg.app_url ?? "https://sehat90.com/app",
    });

    const ok = await sendWhatsApp(phone, msg);
    if (ok) {
      await supabase.from("consult_bookings").update({ reminder_1h_sent: true }).eq("id", b.id);
      sent1h++;
    }
  }

  return NextResponse.json({ ok: true, sent24h, sent1h });
}
