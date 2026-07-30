import { createServerSupabase } from "@/lib/supabase/server";
import { karachiToday, karachiTodayRangeUtc } from "@/lib/time";
import type { GlucoseReading, Task } from "@/lib/types";
import type { MovementPlan } from "@/lib/staff";

/** Pod doctor's first name for the current patient, or null before enrollment. */
export async function getPodDoctorName(): Promise<string | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("cohort_members")
    .select("cohorts(care_pods(profiles:doctor_id(full_name)))")
    .eq("patient_id", user.id)
    .limit(1)
    .maybeSingle();

  // Deeply nested join shape is awkward to type; read defensively.
  const full = (data as unknown as {
    cohorts?: { care_pods?: { profiles?: { full_name?: string } } };
  })?.cohorts?.care_pods?.profiles?.full_name;
  return full ? full.split(" ").slice(-1)[0] : null;
}

/** Today's glucose readings (Asia/Karachi), oldest→newest. */
export async function getTodaysReadings(): Promise<GlucoseReading[]> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { startISO, endISO } = karachiTodayRangeUtc();
  const { data } = await supabase
    .from("glucose_readings")
    .select("id, value_mgdl, context, taken_at, flag")
    .eq("patient_id", user.id)
    .gte("taken_at", startISO)
    .lt("taken_at", endISO)
    .order("taken_at", { ascending: true });
  return (data as GlucoseReading[]) ?? [];
}

/** Ensure today's tasks exist, then return them ordered for display. */
export async function getTodaysTasks(): Promise<Task[]> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  await supabase.rpc("ensure_daily_tasks", { p: user.id });

  const forDate = karachiToday(); // yyyy-mm-dd matching tasks.for_date
  const { data } = await supabase
    .from("tasks")
    .select("id, for_date, cohort_day, title, subtitle, kind, done_at, photo_mode, photo_prompt, photo_points_bonus, evidence_url, evidence_at")
    .eq("patient_id", user.id)
    .eq("for_date", forDate)
    .order("created_at", { ascending: true });
  return (data as Task[]) ?? [];
}

/** Current movement plan assigned by the patient's pod coach. */
export async function getMyMovementPlan(): Promise<MovementPlan | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("movement_plans")
    .select("id, exercises, effective_from, notes")
    .eq("patient_id", user.id)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as MovementPlan) ?? null;
}

export async function getPointsAndStreak(): Promise<{
  points: number;
  streak: number;
  cohortDay: number;
}> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { points: 0, streak: 0, cohortDay: 1 };

  const [{ data: pts }, { data: strk }, { data: day }] = await Promise.all([
    supabase.rpc("patient_points", { p: user.id }),
    supabase.rpc("patient_streak", { p: user.id }),
    supabase.rpc("sehat_cohort_day", { p: user.id }),
  ]);
  return {
    points: (pts as number) ?? 0,
    streak: (strk as number) ?? 0,
    cohortDay: (day as number) ?? 1,
  };
}
