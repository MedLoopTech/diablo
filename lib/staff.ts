import { createServerSupabase } from "@/lib/supabase/server";

export type Escalation = {
  id: string;
  patient_id: string;
  kind: "glucose_urgent" | "glucose_routine" | "ai_routed" | "patient_flagged";
  payload: Record<string, unknown> | null;
  status: "open" | "acknowledged" | "resolved";
  created_at: string;
  patient_name: string | null;
};

export type FlaggedReading = {
  id: string;
  patient_id: string;
  value_mgdl: number;
  context: string;
  flag: "routine" | "urgent";
  taken_at: string;
  photo_url: string | null;
  patient_name: string | null;
};

// Order: urgent escalations first, then most recent. Mirrors the doctor's triage.
const KIND_RANK: Record<Escalation["kind"], number> = {
  glucose_urgent: 0,
  patient_flagged: 1,
  ai_routed: 2,
  glucose_routine: 3,
};

/** Open escalations visible to the current staff member (RLS scopes to pod). */
export async function getOpenEscalations(): Promise<Escalation[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("escalations")
    .select("id, patient_id, kind, payload, status, created_at, profiles:patient_id(full_name)")
    .neq("status", "resolved")
    .order("created_at", { ascending: false });

  const rows = (data ?? []).map((e) => ({
    id: e.id as string,
    patient_id: e.patient_id as string,
    kind: e.kind as Escalation["kind"],
    payload: e.payload as Record<string, unknown> | null,
    status: e.status as Escalation["status"],
    created_at: e.created_at as string,
    patient_name:
      (e as unknown as { profiles?: { full_name?: string } }).profiles?.full_name ?? null,
  }));
  return rows.sort(
    (a, b) =>
      KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
      b.created_at.localeCompare(a.created_at)
  );
}

export type StaffAnalytics = {
  patientCount: number;
  openEscalations: number;
  urgentCount: number;
  avgFasting: number | null;
  timeInRangePct: number | null;
  estCohortHba1c: number | null;
  adherencePct: number | null;
  cohortTrend: { date: string; avgFasting: number }[];
  atRisk: { id: string; name: string | null; avg: number; flags: number; lastValue: number | null }[];
};

/** Patient ids in the current staff member's pods. */
async function myPatientIds(supabase: ReturnType<typeof createServerSupabase>, uid: string): Promise<string[]> {
  const { data: pods } = await supabase
    .from("care_pods")
    .select("cohort_id")
    .or(`doctor_id.eq.${uid},nutritionist_id.eq.${uid},coach_id.eq.${uid}`);
  const cohortIds = (pods ?? []).map((p) => p.cohort_id);
  if (!cohortIds.length) return [];
  const { data: members } = await supabase
    .from("cohort_members")
    .select("patient_id")
    .in("cohort_id", cohortIds);
  return Array.from(new Set((members ?? []).map((m) => m.patient_id as string)));
}

/** Cohort-level analytics for the doctor dashboard (RLS-scoped to their pods). */
export async function getStaffAnalytics(): Promise<StaffAnalytics> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const empty: StaffAnalytics = {
    patientCount: 0, openEscalations: 0, urgentCount: 0, avgFasting: null,
    timeInRangePct: null, estCohortHba1c: null, adherencePct: null, cohortTrend: [], atRisk: [],
  };
  if (!user) return empty;

  const ids = await myPatientIds(supabase, user.id);
  if (!ids.length) return empty;

  const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: readings }, { data: escalations }, { data: profiles }, { data: tasks }] =
    await Promise.all([
      supabase.from("glucose_readings").select("patient_id, value_mgdl, context, flag, taken_at").in("patient_id", ids).gte("taken_at", thirtyAgo),
      supabase.from("escalations").select("kind, status").in("patient_id", ids).neq("status", "resolved"),
      supabase.from("profiles").select("id, full_name").in("id", ids),
      supabase.from("tasks").select("patient_id, done_at").in("patient_id", ids).gte("for_date", sevenAgo.slice(0, 10)),
    ]);

  const r = readings ?? [];
  const nameOf = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));

  const all = r.map((x) => x.value_mgdl as number);
  const avg = all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : null;
  const estCohortHba1c = avg != null ? Math.round(((avg + 46.7) / 28.7) * 10) / 10 : null;
  const fasting = r.filter((x) => x.context === "fasting").map((x) => x.value_mgdl as number);
  const avgFasting = fasting.length ? Math.round(fasting.reduce((a, b) => a + b, 0) / fasting.length) : null;
  const inRange = all.filter((v) => v < 180).length;
  const timeInRangePct = all.length ? Math.round((inRange / all.length) * 100) : null;

  // Cohort fasting trend by day.
  const byDay = new Map<string, number[]>();
  for (const x of r) {
    if (x.context !== "fasting") continue;
    const d = (x.taken_at as string).slice(0, 10);
    (byDay.get(d) ?? byDay.set(d, []).get(d)!).push(x.value_mgdl as number);
  }
  const cohortTrend = Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, vals]) => ({ date: date.slice(5), avgFasting: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }));

  // At-risk ranking: highest recent average + flag count.
  const perPatient = new Map<string, { vals: number[]; flags: number; last: number | null; lastAt: string }>();
  for (const x of r) {
    const cur = perPatient.get(x.patient_id as string) ?? { vals: [], flags: 0, last: null, lastAt: "" };
    cur.vals.push(x.value_mgdl as number);
    if (x.flag !== "none") cur.flags += 1;
    if ((x.taken_at as string) > cur.lastAt) { cur.lastAt = x.taken_at as string; cur.last = x.value_mgdl as number; }
    perPatient.set(x.patient_id as string, cur);
  }
  const atRisk = Array.from(perPatient.entries())
    .map(([id, v]) => ({ id, name: nameOf.get(id) ?? null, avg: Math.round(v.vals.reduce((a, b) => a + b, 0) / v.vals.length), flags: v.flags, lastValue: v.last }))
    .sort((a, b) => b.flags - a.flags || b.avg - a.avg)
    .slice(0, 5);

  const doneTasks = (tasks ?? []).filter((t) => t.done_at).length;
  const adherencePct = tasks?.length ? Math.round((doneTasks / tasks.length) * 100) : null;

  const esc = escalations ?? [];
  return {
    patientCount: ids.length,
    openEscalations: esc.length,
    urgentCount: esc.filter((e) => e.kind === "glucose_urgent" || e.kind === "patient_flagged").length,
    avgFasting, timeInRangePct, estCohortHba1c, adherencePct, cohortTrend, atRisk,
  };
}

export type Medication = { name: string; dose: string; schedule: string };
export type MedicationPlan = {
  id: string;
  medications: Medication[];
  effective_from: string;
  notes: string | null;
};

export type MealItem = { meal: string; description: string; carb_target_g: number | null };
export type MealPlan = {
  id: string;
  meals: MealItem[];
  effective_from: string;
  notes: string | null;
};

export type PatientDetail = {
  id: string;
  name: string | null;
  readings: { id: string; value_mgdl: number; context: string; flag: string; taken_at: string }[];
  meals: { id: string; meal_type: string; ai_analysis: Record<string, unknown> | null; eaten_at: string }[];
  escalations: { id: string; kind: string; status: string; created_at: string }[];
  currentPlan: MedicationPlan | null;
  currentMealPlan: MealPlan | null;
  bookings: { id: string; slot_time: string; reason: string | null; status: string; context_snapshot: Record<string, unknown> | null }[];
};

/** Full timeline for one patient. RLS returns nothing if not in the doctor's pod. */
export async function getPatientDetail(patientId: string): Promise<PatientDetail | null> {
  const supabase = createServerSupabase();
  const [{ data: prof }, { data: readings }, { data: meals }, { data: esc }, { data: plan }, { data: mealPlan }, { data: bookings }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("id", patientId).maybeSingle(),
      supabase.from("glucose_readings").select("id, value_mgdl, context, flag, taken_at").eq("patient_id", patientId).order("taken_at", { ascending: false }).limit(30),
      supabase.from("meals").select("id, meal_type, ai_analysis, eaten_at").eq("patient_id", patientId).order("eaten_at", { ascending: false }).limit(10),
      supabase.from("escalations").select("id, kind, status, created_at").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(20),
      supabase.from("medication_plans").select("id, medications, effective_from, notes").eq("patient_id", patientId).order("effective_from", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("meal_plans").select("id, meals, effective_from, notes").eq("patient_id", patientId).order("effective_from", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("consult_bookings").select("id, slot_time, reason, status, context_snapshot").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(10),
    ]);

  if (!prof) return null; // not visible under RLS or does not exist
  return {
    id: prof.id as string,
    name: (prof.full_name as string) ?? null,
    readings: (readings ?? []) as PatientDetail["readings"],
    meals: (meals ?? []) as PatientDetail["meals"],
    escalations: (esc ?? []) as PatientDetail["escalations"],
    currentPlan: (plan as MedicationPlan) ?? null,
    currentMealPlan: (mealPlan as MealPlan) ?? null,
    bookings: (bookings ?? []) as PatientDetail["bookings"],
  };
}

/** Flagged glucose readings for the doctor's patients (RLS scoped). */
export async function getFlaggedReadings(): Promise<FlaggedReading[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("glucose_readings")
    .select("id, patient_id, value_mgdl, context, flag, taken_at, photo_url, profiles:patient_id(full_name)")
    .neq("flag", "none")
    .order("taken_at", { ascending: false })
    .limit(50);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    patient_id: r.patient_id as string,
    value_mgdl: r.value_mgdl as number,
    context: r.context as string,
    flag: r.flag as FlaggedReading["flag"],
    taken_at: r.taken_at as string,
    photo_url: (r.photo_url as string) ?? null,
    patient_name:
      (r as unknown as { profiles?: { full_name?: string } }).profiles?.full_name ?? null,
  }));
}
