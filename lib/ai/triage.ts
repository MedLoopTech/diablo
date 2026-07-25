import type { AIProvider } from "./provider";
import { getProvider } from "./provider";
import { TRIAGE_SYSTEM } from "./prompts";

export type TriageClass =
  | "ai_answerable"
  | "route_nutritionist"
  | "route_coach"
  | "route_doctor"
  | "urgent";

export type TriageResult = {
  class: TriageClass;
  confidence: number;
  routed_to: "nutritionist" | "coach" | "doctor" | null;
  reason: string;
  /** true when a deterministic rule decided this, bypassing the LLM. */
  deterministic: boolean;
};

export type TriageContext = {
  cohortDay?: number;
  recentReadingsSummary?: string;
  activeMedications?: string[]; // names only, never dosing
};

// If the LLM says "answerable" but is less sure than this, we route to a human.
const ANSWERABLE_CONFIDENCE_FLOOR = 0.6;

// —————————————————————————— deterministic safety rules ——————————————————————————
// These run BEFORE the LLM so no model judgment can let an unsafe message through.
// Matched as whole words, case-insensitive.

// Possible emergencies — signs of severe hypo/hyper, cardiac, or stroke.
const URGENT = [
  "dizzy", "dizziness", "lightheaded", "light-headed",
  "chest pain", "chest tightness",
  "can't breathe", "cant breathe", "short of breath", "breathless",
  "faint", "fainting", "fainted", "passed out", "pass out", "unconscious", "collapse",
  "numb", "numbness",
  "slurred", "slurring",
  "blurry", "blurred", "double vision", "can't see", "cant see", "loss of vision",
  "seizure", "convulsion",
  "confused", "confusion", "disoriented",
  "shaking", "shaky", "trembling", "cold sweat", "sweating a lot",
  "vomiting blood", "blood in",
];

// Anything clinical that must go to a doctor (never AI-answered).
const MEDICATION = [
  "medication", "medicine", "meds", "drug", "dose", "dosage", "tablet", "tablets",
  "pill", "pills", "prescription", "prescribe", "injection", "inject",
  "metformin", "insulin", "glipizide", "gliclazide", "glimepiride", "sulfonylurea",
  "januvia", "sitagliptin", "ozempic", "semaglutide", "jardiance", "empagliflozin",
  "victoza", "trulicity", "lantus", "humalog", "novorapid", "glucophage",
  "stop taking", "start taking", "skip my", "adjust my", "increase my", "decrease my",
];
const PREGNANCY = ["pregnant", "pregnancy", "breastfeeding", "breast-feeding", "conceive", "expecting"];
const CONDITIONS = [
  "kidney", "renal", "heart disease", "cardiac", "liver", "thyroid",
  "blood pressure", "hypertension", "cholesterol", "stroke",
];

function hasWord(text: string, phrase: string): boolean {
  // Word-boundary match; phrases with spaces match as substrings on word edges.
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(text);
}

function deterministic(message: string): TriageResult | null {
  const t = message.toLowerCase();
  if (URGENT.some((w) => hasWord(t, w))) {
    return { class: "urgent", confidence: 1, routed_to: "doctor", reason: "emergency symptom keyword", deterministic: true };
  }
  if (
    MEDICATION.some((w) => hasWord(t, w)) ||
    PREGNANCY.some((w) => hasWord(t, w)) ||
    CONDITIONS.some((w) => hasWord(t, w))
  ) {
    return { class: "route_doctor", confidence: 1, routed_to: "doctor", reason: "medication/symptom/condition keyword", deterministic: true };
  }
  return null;
}

function routedTo(cls: TriageClass): TriageResult["routed_to"] {
  switch (cls) {
    case "route_nutritionist": return "nutritionist";
    case "route_coach": return "coach";
    case "route_doctor":
    case "urgent": return "doctor";
    default: return null;
  }
}

const VALID: TriageClass[] = [
  "ai_answerable", "route_nutritionist", "route_coach", "route_doctor", "urgent",
];

/**
 * Classify a patient message. Deterministic safety rules decide first; only
 * messages that clear them reach the LLM. Any parse failure or low-confidence
 * "answerable" falls back to route_doctor ("when in doubt, route to a human").
 */
export async function triage(
  message: string,
  ctx: TriageContext = {},
  provider?: AIProvider
): Promise<TriageResult> {
  const forced = deterministic(message);
  if (forced) return forced;

  const ai = provider ?? (await getProvider());
  const contextLine = [
    ctx.cohortDay ? `Cohort day: ${ctx.cohortDay}.` : "",
    ctx.recentReadingsSummary ? `Recent glucose: ${ctx.recentReadingsSummary}.` : "",
    ctx.activeMedications?.length ? `Active medications (names only): ${ctx.activeMedications.join(", ")}.` : "",
  ].filter(Boolean).join(" ");

  let raw = "";
  try {
    raw = await ai.complete({
      system: TRIAGE_SYSTEM,
      messages: [{ role: "user", content: `${contextLine}\n\nPatient: ${message}` }],
      json: true,
      temperature: 0,
      maxTokens: 200,
    });
    const parsed = JSON.parse(raw) as { class?: string; confidence?: number; reason?: string };
    const cls = parsed.class as TriageClass;
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;

    if (!VALID.includes(cls)) {
      return { class: "route_doctor", confidence: 0, routed_to: "doctor", reason: "unparseable class; safe default", deterministic: false };
    }
    // "When in doubt, route to a human": a hesitant answerable becomes a doctor route.
    if (cls === "ai_answerable" && confidence < ANSWERABLE_CONFIDENCE_FLOOR) {
      return { class: "route_doctor", confidence, routed_to: "doctor", reason: "low-confidence answerable; safe default", deterministic: false };
    }
    return { class: cls, confidence, routed_to: routedTo(cls), reason: parsed.reason ?? "", deterministic: false };
  } catch {
    return { class: "route_doctor", confidence: 0, routed_to: "doctor", reason: "triage LLM error/parse failure; safe default", deterministic: false };
  }
}
