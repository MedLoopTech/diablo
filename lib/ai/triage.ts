import type { AIProvider } from "./provider";
import { getProvider } from "./provider";
import { TRIAGE_SYSTEM } from "./prompts";
import { THRESHOLDS } from "@/lib/thresholds";

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
  mealPlanSummary?: string; // from the nutritionist's plan
};

// If the LLM says "answerable" but is less sure than this, we route to a human.
const ANSWERABLE_CONFIDENCE_FLOOR = 0.6;

// —————————————————————————— deterministic safety rules ——————————————————————————
// These run BEFORE the LLM so no model judgment can let an unsafe message through.
// Matched as whole words, case-insensitive.

// Possible emergencies — signs of severe hypo/hyper, cardiac, or stroke.
const URGENT = [
  "dizzy", "dizziness", "lightheaded", "light-headed", "lightheadedness",
  "chest pain", "chest tightness", "chest pressure", "chest hurts",
  "can't breathe", "cant breathe", "short of breath", "breathless", "difficulty breathing",
  "faint", "fainting", "fainted", "passed out", "pass out", "unconscious", "collapse", "collapsed",
  "numb", "numbness",
  "slurred", "slurring",
  "blurry", "blurred", "double vision", "can't see", "cant see", "loss of vision", "vision went",
  "seizure", "convulsion",
  "confused", "confusion", "disoriented",
  "shaking", "shaky", "trembling", "cold sweat", "sweating a lot", "woozy",
  "vomiting blood", "blood in", "bleeding",
  "heart racing", "heart is racing", "racing heart", "palpitation", "heart beat fast",
  "weakness", "very weak", "no strength",
  "left arm", "arm feels heavy", "arm is heavy", "arm went heavy",
  // Roman Urdu emergency terms
  "chakkar",           // dizzy / dizziness
  "seena dard",        // chest pain
  "seene mein dard",   // pain in the chest
  "behosh",            // unconscious / fainted
];

// Glucometer max-out indicator — "HI" on screen means >600 mg/dL.
const GLUCOMETER_HI = /\b(?:meter|glucometer|glucometre|machine)\b.{0,30}\bhi\b|\breads?\s+hi\b/i;

// Anything clinical that must go to a doctor (never AI-answered).
const MEDICATION = [
  "medication", "medicine", "meds", "drug", "dose", "dosage", "tablet", "tablets",
  "pill", "pills", "prescription", "prescribe", "injection", "inject",
  "metformin", "insulin", "glipizide", "gliclazide", "glimepiride", "sulfonylurea",
  "januvia", "sitagliptin", "ozempic", "semaglutide", "jardiance", "empagliflozin",
  "victoza", "trulicity", "lantus", "humalog", "novorapid", "glucophage",
  "stop taking", "start taking", "skip my", "adjust my", "increase my", "decrease my",
  "reduce my", "lower my", "double my", "half my",
  // Roman Urdu medication terms
  "dawai", "dawa",     // medicine / medication
  "goliyan", "goli",   // pills / tablet
  "khurak",            // dose / dosage
];
const PREGNANCY = [
  "pregnant", "pregnancy", "breastfeeding", "breast-feeding", "conceive", "expecting",
  // Roman Urdu pregnancy terms
  "hamila",            // pregnant
  "hamal",             // pregnancy
  "doodh pila",        // breastfeeding (lit. "giving milk")
];
// Qualitative high-glucose phrase (no number) alongside pregnancy → urgent.
// "zyada" = more/high in Urdu; catches "sugar zyada hai" without a numeric reading.
const PREGNANCY_GLUCOSE_HIGH = /\b(?:sugar|glucose|readings?|levels?|bg)\b.{0,30}\b(?:high|zyada)\b|\b(?:high|zyada)\b.{0,30}\b(?:sugar|glucose|readings?|levels?|bg)\b/i;
const CONDITIONS = [
  "kidney", "renal", "heart disease", "cardiac", "liver", "thyroid",
  "blood pressure", "hypertension", "cholesterol", "stroke",
  "ramadan", "fasting month",
  "tingling", "pins and needles", "neuropathy", "feet feel like", "feet asleep",
  // Roman Urdu condition terms
  "gurda", "gurde",    // kidney (singular / possessive-plural)
  "ramazan",           // Ramadan (Urdu/Pakistani spelling)
  "roza",              // Ramadan fast — clinically significant for insulin/med timing
];

// Nutritionist topics — checked before MEDICATION so "meal plan" routes correctly.
const NUTRITIONIST_ROUTE = [
  "meal plan", "diet plan", "food plan", "eating plan", "nutrition plan", "meal schedule",
];

function hasWord(text: string, phrase: string): boolean {
  // Word-boundary match; phrases with spaces match as substrings on word edges.
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(text);
}

// Patient-reported glucose values — catches "my sugar is 380", "reading was 52", etc.
const GLUCOSE_CONTEXT = /\b(?:sugar|glucose|reading|level|check|test|fasting|random|bg)\b/i;
const GLUCOSE_VALUE = /\b(\d{2,3})\b/g;

function extractPatientGlucose(message: string): number | null {
  if (!GLUCOSE_CONTEXT.test(message)) return null;
  const nums = Array.from(message.matchAll(GLUCOSE_VALUE)).map((m) => parseInt(m[1]));
  // Return the most extreme value (most clinically significant)
  const critical = nums.find((n) => n >= THRESHOLDS.URGENT_HIGH || n <= THRESHOLDS.URGENT_LOW);
  if (critical !== undefined) return critical;
  const high = nums.find((n) => n >= THRESHOLDS.ROUTINE_HIGH);
  if (high !== undefined) return high;
  return null;
}

function deterministic(message: string): TriageResult | null {
  const t = message.toLowerCase();

  // 1. Numeric glucose in text — spec §2 applies to chat too.
  const patientGlucose = extractPatientGlucose(message);
  if (patientGlucose !== null) {
    if (patientGlucose >= THRESHOLDS.URGENT_HIGH || patientGlucose <= THRESHOLDS.URGENT_LOW) {
      return { class: "urgent", confidence: 1, routed_to: "doctor", reason: `patient-reported glucose ${patientGlucose} mg/dL`, deterministic: true };
    }
    if (patientGlucose >= THRESHOLDS.ROUTINE_HIGH) {
      return { class: "route_doctor", confidence: 1, routed_to: "doctor", reason: `patient-reported high glucose ${patientGlucose} mg/dL`, deterministic: true };
    }
  }

  // 2. Glucometer maxed out ("HI" on screen = >600 mg/dL).
  if (GLUCOMETER_HI.test(message)) {
    return { class: "urgent", confidence: 1, routed_to: "doctor", reason: "glucometer HI reading (>600 mg/dL)", deterministic: true };
  }

  // 3. Emergency symptoms.
  if (URGENT.some((w) => hasWord(t, w))) {
    return { class: "urgent", confidence: 1, routed_to: "doctor", reason: "emergency symptom keyword", deterministic: true };
  }

  // 4. Pregnancy + qualitative high glucose → urgent (compound clinical risk).
  if (PREGNANCY.some((w) => hasWord(t, w)) && PREGNANCY_GLUCOSE_HIGH.test(message)) {
    return { class: "urgent", confidence: 1, routed_to: "doctor", reason: "pregnancy with high glucose", deterministic: true };
  }

  // 5. Nutrition topics — checked before MEDICATION so "meal plan" isn't caught by action phrases.
  //    Only applies when no medication/pregnancy/condition keyword is also present.
  const isMedical =
    MEDICATION.some((w) => hasWord(t, w)) ||
    PREGNANCY.some((w) => hasWord(t, w)) ||
    CONDITIONS.some((w) => hasWord(t, w));
  if (!isMedical && NUTRITIONIST_ROUTE.some((w) => hasWord(t, w))) {
    return { class: "route_nutritionist", confidence: 1, routed_to: "nutritionist", reason: "nutrition plan keyword", deterministic: true };
  }

  // 6. Anything else clinical → doctor.
  if (isMedical) {
    return { class: "route_doctor", confidence: 1, routed_to: "doctor", reason: "medication/condition/pregnancy keyword", deterministic: true };
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
    ctx.mealPlanSummary ? `Current meal plan: ${ctx.mealPlanSummary}.` : "",
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
