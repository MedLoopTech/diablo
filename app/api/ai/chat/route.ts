import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { getProvider } from "@/lib/ai/provider";
import { triage } from "@/lib/ai/triage";
import { getChatContext, roleLabel } from "@/lib/ai/context";
import { CHAT_SYSTEM } from "@/lib/ai/prompts";
import { extractTags, getRelevantResources } from "@/lib/resources";
import { sendPushToUser } from "@/lib/push";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  // Zod validation — reject malformed or oversized payloads early.
  const body = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "invalid input" }, { status: 400 });
  }
  const { message } = parsed.data;

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Rate limit: 30 patient messages per 24 h.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", user.id)
    .eq("sender", "patient")
    .gte("created_at", since);
  if ((count ?? 0) >= 30) {
    return NextResponse.json(
      { error: "Daily message limit reached. Your care team can always be reached via the Care tab." },
      { status: 429, headers: { "Retry-After": "86400" } }
    );
  }

  const ctx = await getChatContext(supabase, user.id);
  const provider = await getProvider();

  // Step 1 — triage (deterministic safety rules, then LLM).
  const t = await triage(message, ctx, provider);

  // Persist the patient message — if this fails, abort before sending any reply.
  const { error: msgErr } = await supabase.from("chat_messages").insert({
    patient_id: user.id,
    sender: "patient",
    body: message,
    triage: {
      class: t.class,
      confidence: t.confidence,
      routed_to: t.routed_to,
      deterministic: t.deterministic,
    },
  });
  if (msgErr) {
    console.error("[chat] patient message insert failed:", msgErr);
    return NextResponse.json({ error: "Failed to save message. Please try again." }, { status: 500 });
  }

  // Step 2a — AI-answerable: generate a reply.
  if (t.class === "ai_answerable") {
    const tags = extractTags(message);
    const matchedResources = await getRelevantResources(supabase, tags);
    const resourceNote = matchedResources.length
      ? `\n\nRelevant resources available in the app's library (you may mention these naturally if they add value):\n` +
        matchedResources
          .map((r) => `- "${r.title}" (${r.type.replace("_", " ")})${r.url ? ` — ${r.url}` : ""}`)
          .join("\n")
      : "";

    let reply: string;
    try {
      reply = await provider.complete({
        system: CHAT_SYSTEM + resourceNote,
        messages: [{ role: "user", content: message }],
        maxTokens: 450,
        temperature: 0.4,
      });
    } catch {
      reply = "I'm having trouble answering right now — I've noted your question for your care pod. Please try again shortly.";
    }

    const { error: replyErr } = await supabase.from("chat_messages").insert({
      patient_id: user.id,
      sender: "ai",
      body: reply,
    });
    if (replyErr) console.error("[chat] AI reply insert failed:", replyErr);

    return NextResponse.json({ reply, triage: t, escalated: false });
  }

  // Step 2b — route to human: create an escalation. This MUST succeed before
  // telling the patient "your doctor has been notified".
  const routed = t.routed_to ?? "doctor";

  const { data: pod } = await supabase
    .from("cohort_members")
    .select("cohorts(care_pods(doctor_id, nutritionist_id, coach_id))")
    .eq("patient_id", user.id)
    .limit(1)
    .maybeSingle();
  const pods = (pod as unknown as {
    cohorts?: { care_pods?: { doctor_id?: string; nutritionist_id?: string; coach_id?: string } };
  })?.cohorts?.care_pods;
  const assignedTo =
    routed === "nutritionist"
      ? pods?.nutritionist_id
      : routed === "coach"
        ? pods?.coach_id
        : pods?.doctor_id;

  const { error: escErr } = await supabase.from("escalations").insert({
    patient_id: user.id,
    kind: t.class === "urgent" ? "patient_flagged" : "ai_routed",
    payload: { message, triage: t },
    assigned_to: assignedTo ?? null,
    status: "open",
  });
  if (escErr) {
    // The patient must NOT be told "your doctor has been notified" if no escalation exists.
    console.error("[chat] escalation insert failed:", escErr);
    return NextResponse.json(
      { error: "Unable to route your message right now. Please contact your care team directly via the Care tab." },
      { status: 500 }
    );
  }

  // Push urgent alerts to the assigned staff member.
  if (t.class === "urgent" && assignedTo) {
    const { data: patientProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    await sendPushToUser(supabase, assignedTo, {
      title: "⚠️ Urgent patient message",
      body: `${patientProfile?.full_name ?? "Patient"}: ${message.slice(0, 100)}`,
      url: "/staff",
    });
  }

  const label = roleLabel(routed);
  const reply =
    t.class === "urgent"
      ? `This needs attention now — I've alerted your ${label} immediately. If you have severe symptoms (chest pain, trouble breathing, fainting, confusion), please seek emergency care right away.`
      : `That's best handled by your ${label}. I've flagged it for them with your recent context attached, and they'll follow up. I'm always here for routine questions in the meantime.`;

  const { error: replyErr } = await supabase.from("chat_messages").insert({
    patient_id: user.id,
    sender: "ai",
    body: reply,
  });
  if (replyErr) console.error("[chat] handoff reply insert failed:", replyErr);

  return NextResponse.json({ reply, triage: t, escalated: true });
}
