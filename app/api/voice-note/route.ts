import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase, VOICE_BUCKET } from "@/lib/supabase/admin";
import { MAX_VOICE_NOTES_PER_DAY } from "@/lib/voice-notes-shared";
import { supabaseConfigured } from "@/lib/env";
import { roleLabel } from "@/lib/ai/context";
import { sendPushToUser } from "@/lib/push";

const ALLOWED_MIME = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/wav"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * A voice note: no transcription, so none of the deterministic + LLM triage
 * rules in lib/ai/triage.ts can run on it. This route never imports the AI
 * provider or triage module — structurally, not just by convention, it
 * cannot reach an AI reply. It always creates an escalation for the pod
 * doctor, the same "when in doubt, route to a human" default text falls
 * back to (CLAUDE.md safety rule 3).
 */
export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (!ALLOWED_MIME.some((m) => file.type.startsWith(m))) {
    return NextResponse.json({ error: "Unsupported audio format." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Voice message is too long." }, { status: 413 });
  }
  if (file.size < 800) {
    // Below ~1s is almost always an accidental tap, not a real message.
    return NextResponse.json({ error: "too_short" }, { status: 400 });
  }

  // Enforced here as well as by the DB trigger — a modified client could
  // otherwise upload as many voice notes as it likes, each one landing in
  // the doctor's inbox as an interruption that has to be opened and listened to.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", user.id)
    .eq("sender", "patient")
    .not("audio_path", "is", null)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_VOICE_NOTES_PER_DAY) {
    return NextResponse.json(
      {
        error: `You've sent ${MAX_VOICE_NOTES_PER_DAY} voice messages today — that's the most we can pass on to your care pod in one day. Try typing instead, or send more tomorrow.`,
      },
      { status: 429 }
    );
  }

  const ext = file.type.includes("mp4") ? "m4a" : file.type.includes("ogg") ? "ogg" : file.type.includes("wav") ? "wav" : "webm";
  const path = `${user.id}/${randomUUID()}.${ext}`;

  const admin = createAdminSupabase();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await admin.storage
    .from(VOICE_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const { error: msgErr } = await supabase.from("chat_messages").insert({
    patient_id: user.id,
    sender: "patient",
    body: "",
    audio_path: path,
    triage: {
      class: "route_doctor",
      routed_to: "doctor",
      reason: "voice message — not transcribed, routed for review",
      deterministic: true,
    },
  });
  if (msgErr) {
    await admin.storage.from(VOICE_BUCKET).remove([path]);
    console.error("[voice-note] message insert failed:", msgErr);
    return NextResponse.json({ error: "Could not save message. Please try again." }, { status: 500 });
  }

  // Route to the pod doctor — always, unconditionally, no dedup. A voice
  // note is more likely to carry something time-sensitive than a routine
  // text follow-up, so it always gets its own entry in the queue.
  const { data: pod } = await supabase
    .from("cohort_members")
    .select("cohorts(care_pods(doctor_id))")
    .eq("patient_id", user.id)
    .limit(1)
    .maybeSingle();
  const assignedTo = (
    pod as unknown as { cohorts?: { care_pods?: { doctor_id?: string } } }
  )?.cohorts?.care_pods?.doctor_id;

  const { error: escErr } = await supabase.from("escalations").insert({
    patient_id: user.id,
    kind: "ai_routed",
    payload: { message: "[voice message]", triage: { class: "route_doctor", routed_to: "doctor" } },
    assigned_to: assignedTo ?? null,
    status: "open",
  });
  if (escErr) {
    // The patient must NOT be told "your doctor has been notified" if no escalation exists.
    console.error("[voice-note] escalation insert failed:", escErr);
    return NextResponse.json(
      { error: "Your voice message was saved but couldn't be routed. Please also reach your care pod via the Care tab." },
      { status: 500 }
    );
  }

  if (assignedTo) {
    const { data: patientProfile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    await sendPushToUser(supabase, assignedTo, {
      title: "🎤 New voice message",
      body: `${patientProfile?.full_name ?? "Patient"} sent a voice message`,
      url: "/staff",
    });
  }

  const label = roleLabel("doctor");
  return NextResponse.json({
    reply: `Voice message sent — I don't listen to these automatically, so I've flagged it for your ${label} to review directly.`,
    escalated: true,
  });
}
