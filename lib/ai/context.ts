import type { SupabaseClient } from "@supabase/supabase-js";
import type { TriageContext } from "./triage";

/**
 * Assemble the rolling context the coach is allowed to see: a 7-day glucose
 * summary, cohort day, and the NAMES of active medications only — never doses
 * (SPEC §3a: "active medications LIST ONLY — never dosing advice").
 */
export async function getChatContext(
  supabase: SupabaseClient,
  userId: string
): Promise<TriageContext> {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // TODO: cache via React cache() or Redis (30 msg/day limit makes this acceptable for v1)
  const [{ data: readings }, { data: plan }, { data: mealPlan }, { data: cohortDay }, { data: mh }] =
    await Promise.all([
      supabase
        .from("glucose_readings")
        .select("value_mgdl, flag, taken_at")
        .eq("patient_id", userId)
        .gte("taken_at", thirtyDaysAgo)
        .order("taken_at", { ascending: false }),
      supabase
        .from("medication_plans")
        .select("medications, effective_from")
        .eq("patient_id", userId)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("meal_plans")
        .select("meals")
        .eq("patient_id", userId)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.rpc("sehat_cohort_day", { p: userId }),
      supabase
        .from("medical_history")
        .select("diabetes_type,diagnosis_year,allergies,comorbidities")
        .eq("patient_id", userId)
        .maybeSingle(),
    ]);

  let recentReadingsSummary: string | undefined;
  if (readings && readings.length) {
    const sorted = [...readings].sort(
      (a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime()
    );
    const vals = sorted.map((r) => r.value_mgdl);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const flagged = readings.filter((r) => r.flag !== "none").length;

    // Simple trend: compare first-half avg vs second-half avg over the 30-day window.
    let trend = "";
    if (vals.length >= 6) {
      const mid = Math.floor(vals.length / 2);
      const firstAvg = vals.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const secondAvg = vals.slice(mid).reduce((a, b) => a + b, 0) / (vals.length - mid);
      if (secondAvg - firstAvg > 10) trend = ", trend: rising";
      else if (firstAvg - secondAvg > 10) trend = ", trend: improving";
      else trend = ", trend: stable";
    }

    recentReadingsSummary = `${readings.length} readings in 30d, avg ${avg}, range ${min}-${max} mg/dL, ${flagged} flagged${trend}`;
  }

  // Names only — strip any dose/schedule fields defensively.
  const activeMedications = Array.isArray(plan?.medications)
    ? (plan!.medications as Array<{ name?: string }>)
        .map((m) => m?.name)
        .filter((n): n is string => Boolean(n))
    : [];

  const mealItems = Array.isArray(mealPlan?.meals)
    ? (mealPlan!.meals as Array<{ meal?: string; description?: string }>)
        .filter((m) => m?.description)
        .map((m) => `${m.meal}: ${m.description}`)
    : [];
  const mealPlanSummary = mealItems.length ? mealItems.join("; ") : undefined;

  const mhRow = mh as { diabetes_type?: string; diagnosis_year?: number; allergies?: string[]; comorbidities?: string[] } | null;
  const medParts = [
    mhRow?.diabetes_type ? `Type: ${mhRow.diabetes_type}` : null,
    mhRow?.diagnosis_year ? `Diagnosed: ${mhRow.diagnosis_year}` : null,
    mhRow?.allergies?.length ? `Allergies: ${mhRow.allergies.join(", ")}` : null,
    mhRow?.comorbidities?.length ? `Comorbidities: ${mhRow.comorbidities.join(", ")}` : null,
  ].filter(Boolean);
  const medicalContext = medParts.length ? medParts.join("; ") : undefined;

  return {
    cohortDay: (cohortDay as number) ?? undefined,
    recentReadingsSummary,
    activeMedications,
    mealPlanSummary,
    medicalContext,
  };
}

/** Human-readable label for the routed role, for handoff copy. */
export function roleLabel(routedTo: "nutritionist" | "coach" | "doctor"): string {
  return routedTo === "doctor"
    ? "doctor"
    : routedTo === "nutritionist"
      ? "nutritionist"
      : "movement coach";
}
