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

  const [ctx, { data: historyRows }] = await Promise.all([
    getChatContext(supabase, user.id),
    supabase
      .from("chat_messages")
      .select("sender, body")
      .eq("patient_id", user.id)
      .in("sender", ["patient", "ai"])
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // Last 6 messages (3 exchanges) as prior turns, oldest-first.
  const priorMsgs = (historyRows ?? [])
    .reverse()
    .map((m: { sender: string; body: string }) => ({
      role: m.sender === "patient" ? ("user" as const) : ("assistant" as const),
      content: m.body,
    }));

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

  // Step 2a — AI-answerable: stream the reply.
  if (t.class === "ai_answerable") {
    const tags = extractTags(message);
    const matchedResources = await getRelevantResources(supabase, tags);
    const resourceNote = matchedResources.length
      ? `\n\nRelevant resources available in the app's library (you may mention these naturally if they add value):\n` +
        matchedResources
          .map((r) => `- "${r.title}" (${r.type.replace("_", " ")})${r.url ? ` — ${r.url}` : ""}`)
          .join("\n")
      : "";

    const completeInput = {
      system: CHAT_SYSTEM + resourceNote,
      messages: [...priorMsgs, { role: "user" as const, content: message }],
      maxTokens: 450,
      temperature: 0.4,
    };

    // Stream if the provider supports it; fall back to complete() for tests/mocks.
    if (provider.stream) {
      const encoder = new TextEncoder();
      const gen = provider.stream(completeInput);

      const body = new ReadableStream({
        async start(controller) {
          let fullReply = "";
          try {
            for await (const chunk of gen) {
              fullReply += chunk;
              controller.enqueue(encoder.encode(chunk));
            }
          } catch {
            const fallback = "I'm having trouble answering right now — please try again shortly.";
            fullReply = fallback;
            controller.enqueue(encoder.encode(fallback));
          } finally {
            controller.close();
          }
          // Save reply after stream closes. Best-effort in serverless.
          supabase.from("chat_messages").insert({ patient_id: user.id, sender: "ai", body: fullReply })
            .then(({ error }) => { if (error) console.error("[chat] AI reply insert failed:", error); });
        },
      });

      return new Response(body, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Accel-Buffering": "no",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Non-streaming fallback (mocked provider in tests has no .stream).
    let reply: string;
    try {
      reply = await provider.complete(completeInput);
    } catch {
      reply = "I'm having trouble answering right now — I've noted your question for your care pod. Please try again shortly.";
    }
    const { error: replyErr } = await supabase.from("chat_messages").insert({ patient_id: user.id, sender: "ai", body: reply });
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

  // Cooldown: suppress duplicate ai_routed escalations within 2 hours for the
  // same patient+assignee pair (urgent/patient_flagged always fires).
  const isUrgent = t.class === "urgent";
  if (!isUrgent) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("escalations")
      .select("id")
      .eq("patient_id", user.id)
      .eq("kind", "ai_routed")
      .neq("status", "resolved")
      .gte("created_at", twoHoursAgo)
      .limit(1)
      .maybeSingle();
    if (existing) {
      // Open escalation already exists for this patient — don't flood the queue.
      // Fall through to send the reply but skip the insert.
      const label = roleLabel(routed);
      const reply = `That's best handled by your ${label}. I've already flagged a question for them — they'll follow up on all your recent messages together.`;
      await supabase.from("chat_messages").insert({ patient_id: user.id, sender: "ai", body: reply });
      return NextResponse.json({ reply, triage: t, escalated: false });
    }
  }

  const { error: escErr } = await supabase.from("escalations").insert({
    patient_id: user.id,
    kind: isUrgent ? "patient_flagged" : "ai_routed",
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
