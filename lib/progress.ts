import { createServerSupabase } from "@/lib/supabase/server";

export type ProgressData = {
  cohortDay: number;
  estHba1c: number | null; // trailing-30d estimate
  baselineHba1c: number | null;
  weightKg: number | null;
  baselineWeightKg: number | null;
  timeInRangePct: number | null;
  fastingTrend: { date: string; value: number }[];
  avgFasting7d: number | null;
};

// est HbA1c from mean glucose — SPEC §2: (avg_glucose_mgdl + 46.7) / 28.7.
function estHba1cFrom(avgGlucose: number): number {
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10;
}

export async function getProgressData(): Promise<ProgressData> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      cohortDay: 1, estHba1c: null, baselineHba1c: null, weightKg: null,
      baselineWeightKg: null, timeInRangePct: null, fastingTrend: [], avgFasting7d: null,
    };
  }

  const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: day }, { data: readings30 }, { data: member }, { data: snapshot }] =
    await Promise.all([
      supabase.rpc("sehat_cohort_day", { p: user.id }),
      supabase
        .from("glucose_readings")
        .select("value_mgdl, context, taken_at")
        .eq("patient_id", user.id)
        .gte("taken_at", thirtyAgo)
        .order("taken_at", { ascending: true }),
      supabase
        .from("cohort_members")
        .select("baseline_hba1c, baseline_weight_kg")
        .eq("patient_id", user.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("progress_snapshots")
        .select("weight_kg")
        .eq("patient_id", user.id)
        .order("week", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const all = readings30 ?? [];
  const estHba1c = all.length ? estHba1cFrom(all.reduce((s, r) => s + r.value_mgdl, 0) / all.length) : null;
  const inRange = all.filter((r) => r.value_mgdl < 180).length;
  const timeInRangePct = all.length ? Math.round((inRange / all.length) * 100) : null;

  const fasting = all.filter((r) => r.context === "fasting");
  const fastingTrend = fasting.map((r) => ({ date: r.taken_at.slice(0, 10), value: r.value_mgdl }));
  const fasting7d = fasting.filter((r) => r.taken_at >= sevenAgo);
  const avgFasting7d = fasting7d.length
    ? Math.round(fasting7d.reduce((s, r) => s + r.value_mgdl, 0) / fasting7d.length)
    : null;

  return {
    cohortDay: (day as number) ?? 1,
    estHba1c,
    baselineHba1c: (member?.baseline_hba1c as number) ?? null,
    weightKg: (snapshot?.weight_kg as number) ?? null,
    baselineWeightKg: (member?.baseline_weight_kg as number) ?? null,
    timeInRangePct,
    fastingTrend,
    avgFasting7d,
  };
}
