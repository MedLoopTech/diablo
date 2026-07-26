import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { getProvider } from "@/lib/ai/provider";
import { triage } from "@/lib/ai/triage";
import { getChatContext, roleLabel } from "@/lib/ai/context";
import { CHAT_SYSTEM } from "@/lib/ai/prompts";
import { extractTags, getRelevantResources } from "@/lib/resources";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const { message } = (await request.json().catch(() => ({}))) as {
    message?: string;
  };
  if (!message || !message.trim()) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const ctx = await getChatContext(supabase, user.id);
  const provider = await getProvider();

  // Step 1 — triage (deterministic safety rules, then LLM).
  const t = await triage(message, ctx, provider);

  // Persist the patient message with its triage record.
  await supabase.from("chat_messages").insert({
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

  // Step 2a — answerable: generate a warm, safe reply, optionally citing resources.
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
      // If generation fails, fall back to a safe human handoff rather than nothing.
      reply =
        "I'm having trouble answering right now — I've noted your question for your care pod. Please try again shortly.";
    }
    await supabase.from("chat_messages").insert({
      patient_id: user.id,
      sender: "ai",
      body: reply,
    });
    return NextResponse.json({ reply, triage: t, escalated: false });
  }

  // Step 2b — route to a human: create an escalation and reply with a handoff.
  const routed = t.routed_to ?? "doctor";

  // Assign to the relevant pod staff member if a pod exists.
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

  await supabase.from("escalations").insert({
    patient_id: user.id,
    kind: t.class === "urgent" ? "patient_flagged" : "ai_routed",
    payload: { message, triage: t },
    assigned_to: assignedTo ?? null,
    status: "open",
  });

  const label = roleLabel(routed);
  const reply =
    t.class === "urgent"
      ? `This needs attention now — I've alerted your ${label} immediately. If you have severe symptoms (chest pain, trouble breathing, fainting, confusion), please seek emergency care right away.`
      : `That's best handled by your ${label}. I've flagged it for them with your recent context attached, and they'll follow up. I'm always here for routine questions in the meantime.`;

  await supabase.from("chat_messages").insert({
    patient_id: user.id,
    sender: "ai",
    body: reply,
  });

  return NextResponse.json({ reply, triage: t, escalated: true });
}
