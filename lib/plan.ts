/**
 * Tiered feature gating — the ONE place plan/package rules live.
 *
 * v1 has no payments (SPEC: out of scope), so there is no plan column on the
 * profile yet and everything resolves to the default tier. When packages land
 * (payment -> cohort assignment -> plan on profile), only this file changes:
 * read the patient's plan and flip the flags. Call sites already ask questions
 * like isGlucometerPhotoRequired(plan) rather than hardcoding behavior.
 */

export type Plan = "basic" | "plus" | "premium";
export const DEFAULT_PLAN: Plan = "basic";

export type PlanFeatures = {
  /** Must a glucometer photo accompany every glucose reading? */
  glucometerPhotoRequired: boolean;
  /** AI meal-photo analysis available? */
  aiMealAnalysis: boolean;
  /** AI coach chat available? */
  aiCoach: boolean;
};

// Per-tier configuration. Today every tier is permissive; adjust here when
// packages differentiate (e.g. premium requires photo verification).
const FEATURES: Record<Plan, PlanFeatures> = {
  basic: { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true },
  plus: { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true },
  premium: { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true },
};

export function planFeatures(plan: Plan | null | undefined): PlanFeatures {
  return FEATURES[plan ?? DEFAULT_PLAN] ?? FEATURES[DEFAULT_PLAN];
}

export function isGlucometerPhotoRequired(plan?: Plan | null): boolean {
  return planFeatures(plan).glucometerPhotoRequired;
}
