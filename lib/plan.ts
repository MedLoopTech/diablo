import { createServerSupabase } from "@/lib/supabase/server";

export type Plan = "basic" | "plus" | "premium";
export const DEFAULT_PLAN: Plan = "basic";

export type PlanFeatures = {
  glucometerPhotoRequired: boolean;
  aiMealAnalysis: boolean;
  aiCoach: boolean;
  consultBooking: boolean;
  resourceLibrary: boolean;
};

export type PlanFlag = {
  plan: Plan;
  feature_key: string;
  label: string;
  enabled: boolean;
  sort_order: number;
};

/** Fallback features used when DB is unavailable. */
const FALLBACK: Record<Plan, PlanFeatures> = {
  basic:   { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true, consultBooking: true, resourceLibrary: true },
  plus:    { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true, consultBooking: true, resourceLibrary: true },
  premium: { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true, consultBooking: true, resourceLibrary: true },
};

function flagsToFeatures(flags: { feature_key: string; enabled: boolean }[], plan: Plan): PlanFeatures {
  const m = Object.fromEntries(flags.map((f) => [f.feature_key, f.enabled]));
  const fb = FALLBACK[plan];
  return {
    glucometerPhotoRequired: m["glucometer_photo_required"] ?? fb.glucometerPhotoRequired,
    aiMealAnalysis:          m["ai_meal_analysis"]          ?? fb.aiMealAnalysis,
    aiCoach:                 m["ai_coach"]                   ?? fb.aiCoach,
    consultBooking:          m["consult_booking"]            ?? fb.consultBooking,
    resourceLibrary:         m["resource_library"]           ?? fb.resourceLibrary,
  };
}

/** Fetch the current user's plan and its live feature flags from the DB. */
export async function getMyPlanFeatures(): Promise<{ plan: Plan; features: PlanFeatures }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { plan: DEFAULT_PLAN, features: FALLBACK[DEFAULT_PLAN] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  const plan = ((profile?.plan as Plan) || DEFAULT_PLAN);

  const { data: flags } = await supabase
    .from("plan_feature_flags")
    .select("feature_key, enabled")
    .eq("plan", plan);

  return { plan, features: flagsToFeatures(flags ?? [], plan) };
}

/** Fetch all plan_feature_flags rows (for admin panel). */
export async function getAllPlanFlags(): Promise<PlanFlag[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("plan_feature_flags")
    .select("plan, feature_key, label, enabled, sort_order")
    .order("sort_order")
    .order("plan");
  return (data as PlanFlag[]) ?? [];
}

/** Sync helper for non-DB contexts (keeps existing call sites working). */
export function planFeatures(plan: Plan | null | undefined): PlanFeatures {
  return FALLBACK[plan ?? DEFAULT_PLAN] ?? FALLBACK[DEFAULT_PLAN];
}

export function isGlucometerPhotoRequired(plan?: Plan | null): boolean {
  return planFeatures(plan).glucometerPhotoRequired;
}
