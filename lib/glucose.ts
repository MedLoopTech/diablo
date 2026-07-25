import type { GlucoseContext, GlucoseFlag } from "@/lib/types";

// Dial zone colors — must match the prototype's zone() in GlucoseDial.
export const ZONE = {
  inRange: "#14664F", // primary — < 130
  elevated: "#EFA63C", // marigold — 130–179
  high: "#DF5F4C", // coral — >= 180
} as const;

export function zoneColor(value: number): string {
  if (value < 130) return ZONE.inRange;
  if (value < 180) return ZONE.elevated;
  return ZONE.high;
}

/** Server flagging thresholds, mirrored client-side for immediate feedback. */
export function flagFor(value: number): GlucoseFlag {
  if (value >= 250 || value <= 70) return "urgent";
  if (value >= 180) return "routine";
  return "none";
}

export const CONTEXT_LABEL: Record<GlucoseContext, string> = {
  fasting: "fasting",
  pre_meal: "pre-meal",
  post_meal: "post-meal",
  bedtime: "bedtime",
  random: "random",
};

export const CONTEXT_OPTIONS: { value: GlucoseContext; label: string }[] = [
  { value: "fasting", label: "Fasting" },
  { value: "pre_meal", label: "Pre-meal" },
  { value: "post_meal", label: "Post-meal" },
  { value: "bedtime", label: "Bedtime" },
  { value: "random", label: "Random" },
];

export type Feedback = { tone: "green" | "amber" | "red"; text: string };

/**
 * Post-log feedback copy. Encodes CLAUDE.md safety rule 2: urgent readings show
 * emergency guidance; routine readings tell the patient a doctor was flagged.
 * `doctorName` personalizes the routine/urgent message when the pod is known.
 */
export function feedbackFor(
  value: number,
  doctorName?: string | null
): Feedback {
  const flag = flagFor(value);
  const doctor = doctorName ? `Dr. ${doctorName}` : "your doctor";
  if (flag === "urgent") {
    const low = value <= 70;
    return {
      tone: "red",
      text: low
        ? `${value} is low. Have 15g of fast sugar now (juice, glucose tablets), then recheck in 15 minutes. ${doctor} has been alerted. If you feel confused, faint, or can't keep sugar down, seek emergency care.`
        : `${value} is very high. ${doctor} has been alerted for an urgent review. Drink water, avoid more carbs, and seek care now if you have chest pain, breathlessness, vomiting, or drowsiness.`,
    };
  }
  if (flag === "routine") {
    return {
      tone: "amber",
      text: `Above range — flagged to ${doctor} for review. They'll see it before your next window.`,
    };
  }
  return {
    tone: "green",
    text: "Added to today's horizon. Nice — trending inside your target band.",
  };
}
