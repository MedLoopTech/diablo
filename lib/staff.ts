import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/roles";

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

/** Open escalations visible to the current staff member (RLS scopes to pod).
 *  Doctors and admins see all open escalations for their pod patients.
 *  Nutritionists and coaches see only escalations assigned to them (ai_routed). */
export async function getOpenEscalations(): Promise<Escalation[]> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id;

  // Determine role to decide scope.
  let role: string | null = null;
  if (uid) {
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
    role = prof?.role ?? null;
  }

  let query = supabase
    .from("escalations")
    .select("id, patient_id, kind, payload, status, created_at, profiles:patient_id(full_name)")
    .neq("status", "resolved")
    .order("created_at", { ascending: false });

  // Non-doctors only see their own assigned escalations.
  if (uid && role && role !== "doctor" && !isAdminRole(role)) {
    query = query.eq("assigned_to", uid);
  }

  const { data } = await query;

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

export type MovementExercise = {
  name: string;
  category: string;
  duration_min: number | null;
  sets: number | null;
  reps: string | null;
  notes: string | null;
};
export type MovementPlan = {
  id: string;
  exercises: MovementExercise[];
  effective_from: string;
  notes: string | null;
};

export type MedicalHistoryRow = {
  diabetes_type: string | null;
  diagnosis_year: number | null;
  allergies: string[];
  comorbidities: string[];
  pre_existing_meds: { name: string; dose?: string; frequency?: string }[];
  family_history: string | null;
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
  currentMovementPlan: MovementPlan | null;
  bookings: { id: string; slot_time: string; reason: string | null; status: string; context_snapshot: Record<string, unknown> | null }[];
  medicalHistory: MedicalHistoryRow | null;
};

/** Full timeline for one patient. RLS returns nothing if not in the doctor's pod. */
export async function getPatientDetail(patientId: string): Promise<PatientDetail | null> {
  const supabase = createServerSupabase();
  const [{ data: prof }, { data: readings }, { data: meals }, { data: esc }, { data: plan }, { data: mealPlan }, { data: movementPlan }, { data: bookings }, { data: mh }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("id", patientId).maybeSingle(),
      supabase.from("glucose_readings").select("id, value_mgdl, context, flag, taken_at").eq("patient_id", patientId).order("taken_at", { ascending: false }).limit(30),
      supabase.from("meals").select("id, meal_type, ai_analysis, eaten_at").eq("patient_id", patientId).order("eaten_at", { ascending: false }).limit(10),
      supabase.from("escalations").select("id, kind, status, created_at").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(20),
      supabase.from("medication_plans").select("id, medications, effective_from, notes").eq("patient_id", patientId).order("effective_from", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("meal_plans").select("id, meals, effective_from, notes").eq("patient_id", patientId).order("effective_from", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("movement_plans").select("id, exercises, effective_from, notes").eq("patient_id", patientId).order("effective_from", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("consult_bookings").select("id, slot_time, reason, status, context_snapshot").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(10),
      supabase.from("medical_history").select("diabetes_type,diagnosis_year,allergies,comorbidities,pre_existing_meds,family_history,notes").eq("patient_id", patientId).maybeSingle(),
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
    currentMovementPlan: (movementPlan as MovementPlan) ?? null,
    bookings: (bookings ?? []) as PatientDetail["bookings"],
    medicalHistory: mh ? {
      diabetes_type: (mh as MedicalHistoryRow).diabetes_type ?? null,
      diagnosis_year: (mh as MedicalHistoryRow).diagnosis_year ?? null,
      allergies: (mh as MedicalHistoryRow).allergies ?? [],
      comorbidities: (mh as MedicalHistoryRow).comorbidities ?? [],
      pre_existing_meds: ((mh as MedicalHistoryRow).pre_existing_meds as MedicalHistoryRow["pre_existing_meds"]) ?? [],
      family_history: (mh as MedicalHistoryRow).family_history ?? null,
      notes: (mh as MedicalHistoryRow).notes ?? null,
    } : null,
  };
}

export type CoachPatientRow = {
  id: string;
  name: string | null;
  movementDone: number;
  movementTotal: number;
  movementPct: number;
  streak: number;
};

export type CoachAnalytics = {
  patientCount: number;
  movementAdherencePct: number | null;
  patients: CoachPatientRow[];
};

/** Movement-focused analytics for a coach dashboard. */
export async function getCoachAnalytics(): Promise<CoachAnalytics> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const empty: CoachAnalytics = { patientCount: 0, movementAdherencePct: null, patients: [] };
  if (!user) return empty;

  const ids = await myPatientIds(supabase, user.id);
  if (!ids.length) return empty;

  const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: tasks }, { data: profiles }, { data: streaks }] = await Promise.all([
    supabase
      .from("tasks")
      .select("patient_id, kind, done_at")
      .in("patient_id", ids)
      .in("kind", ["movement", "yoga", "exercise"])
      .gte("for_date", sevenAgo.slice(0, 10)),
    supabase.from("profiles").select("id, full_name").in("id", ids),
    supabase.from("points_ledger").select("patient_id, streak_day").in("patient_id", ids).order("created_at", { ascending: false }),
  ]);

  const nameOf = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));

  // Latest streak per patient
  const streakOf = new Map<string, number>();
  for (const s of streaks ?? []) {
    if (!streakOf.has(s.patient_id as string))
      streakOf.set(s.patient_id as string, s.streak_day as number ?? 0);
  }

  const perPatient = new Map<string, { done: number; total: number }>();
  for (const t of tasks ?? []) {
    const cur = perPatient.get(t.patient_id as string) ?? { done: 0, total: 0 };
    cur.total += 1;
    if (t.done_at) cur.done += 1;
    perPatient.set(t.patient_id as string, cur);
  }

  // Include all patients, even those with no movement tasks this week
  const patients: CoachPatientRow[] = ids.map((id) => {
    const v = perPatient.get(id) ?? { done: 0, total: 0 };
    return {
      id,
      name: nameOf.get(id) ?? null,
      movementDone: v.done,
      movementTotal: v.total,
      movementPct: v.total ? Math.round((v.done / v.total) * 100) : 0,
      streak: streakOf.get(id) ?? 0,
    };
  }).sort((a, b) => b.movementPct - a.movementPct || b.streak - a.streak);

  const totalDone = patients.reduce((s, p) => s + p.movementDone, 0);
  const totalTasks = patients.reduce((s, p) => s + p.movementTotal, 0);

  return {
    patientCount: ids.length,
    movementAdherencePct: totalTasks ? Math.round((totalDone / totalTasks) * 100) : null,
    patients,
  };
}

// ─── Prescription + outcome rows ─────────────────────────────────────────────

export type DoctorPatientRow = {
  id: string;
  name: string | null;
  plan: { medications: Medication[]; effective_from: string } | null;
  avgFasting30d: number | null;
  fastingTrendPct: number | null; // negative = improving
  estHba1c: number | null;
  flags30d: number;
  openEscalations: number;
};

export type NutritionistPatientRow = {
  id: string;
  name: string | null;
  plan: { meals: MealItem[]; effective_from: string; notes: string | null } | null;
  avgPostMeal30d: number | null;
  weightChange30d: number | null; // kg, negative = lost
  mealAdherence7d: number | null; // %
};

export type CoachPatientOutcomeRow = {
  id: string;
  name: string | null;
  plan: { exercises: MovementExercise[]; effective_from: string } | null;
  movementDone7d: number;
  movementTotal7d: number;
  movementPct7d: number;
  streak: number;
  points: number;
};

export async function getDoctorPrescriptionOutcomes(): Promise<DoctorPatientRow[]> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const ids = await myPatientIds(supabase, user.id);
  if (!ids.length) return [];

  const thirtyAgo = new Date(Date.now() - 30 * 864e5).toISOString();
  const fifteenAgo = new Date(Date.now() - 15 * 864e5).toISOString();

  const [{ data: profiles }, { data: plans }, { data: readings }, { data: escalations }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").in("id", ids),
      supabase.from("medication_plans").select("patient_id, medications, effective_from").in("patient_id", ids).order("effective_from", { ascending: false }),
      supabase.from("glucose_readings").select("patient_id, value_mgdl, flag, taken_at").in("patient_id", ids).eq("context", "fasting").gte("taken_at", thirtyAgo),
      supabase.from("escalations").select("patient_id, kind, status").in("patient_id", ids).neq("status", "resolved"),
    ]);

  const nameOf = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));
  const planOf = new Map<string, { medications: Medication[]; effective_from: string }>();
  for (const p of (plans ?? [])) {
    if (!planOf.has(p.patient_id as string))
      planOf.set(p.patient_id as string, { medications: p.medications as Medication[], effective_from: p.effective_from as string });
  }
  const readingMap = new Map<string, { value: number; takenAt: string; flag: string }[]>();
  for (const r of (readings ?? [])) {
    const arr = readingMap.get(r.patient_id as string) ?? [];
    arr.push({ value: r.value_mgdl as number, takenAt: r.taken_at as string, flag: r.flag as string });
    readingMap.set(r.patient_id as string, arr);
  }
  const escMap = new Map<string, number>();
  for (const e of (escalations ?? [])) escMap.set(e.patient_id as string, (escMap.get(e.patient_id as string) ?? 0) + 1);

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  return ids.map((id) => {
    const rs = readingMap.get(id) ?? [];
    const all = rs.map((r) => r.value);
    const recent = rs.filter((r) => r.takenAt >= fifteenAgo).map((r) => r.value);
    const earlier = rs.filter((r) => r.takenAt < fifteenAgo).map((r) => r.value);
    const avg30 = avg(all);
    const avgR = avg(recent); const avgE = avg(earlier);
    const trendPct = avgR != null && avgE != null && avgE > 0 ? Math.round(((avgR - avgE) / avgE) * 100) : null;
    return {
      id, name: nameOf.get(id) ?? null,
      plan: planOf.get(id) ?? null,
      avgFasting30d: avg30,
      fastingTrendPct: trendPct,
      estHba1c: avg30 != null ? Math.round(((avg30 + 46.7) / 28.7) * 10) / 10 : null,
      flags30d: rs.filter((r) => r.flag !== "none").length,
      openEscalations: escMap.get(id) ?? 0,
    };
  });
}

export async function getNutritionistPlanOutcomes(): Promise<NutritionistPatientRow[]> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const ids = await myPatientIds(supabase, user.id);
  if (!ids.length) return [];

  const thirtyAgo = new Date(Date.now() - 30 * 864e5).toISOString();
  const sevenAgo = new Date(Date.now() - 7 * 864e5).toISOString();

  const [{ data: profiles }, { data: plans }, { data: readings }, { data: weighIns }, { data: tasks }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").in("id", ids),
      supabase.from("meal_plans").select("patient_id, meals, effective_from, notes").in("patient_id", ids).order("effective_from", { ascending: false }),
      supabase.from("glucose_readings").select("patient_id, value_mgdl").in("patient_id", ids).in("context", ["post_meal", "pre_meal"]).gte("taken_at", thirtyAgo),
      supabase.from("weigh_ins").select("patient_id, weight_kg, taken_at").in("patient_id", ids).gte("taken_at", thirtyAgo).order("taken_at"),
      supabase.from("tasks").select("patient_id, done_at").in("patient_id", ids).eq("kind", "meal").gte("for_date", sevenAgo.slice(0, 10)),
    ]);

  const nameOf = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));
  const planOf = new Map<string, { meals: MealItem[]; effective_from: string; notes: string | null }>();
  for (const p of (plans ?? [])) {
    if (!planOf.has(p.patient_id as string))
      planOf.set(p.patient_id as string, { meals: p.meals as MealItem[], effective_from: p.effective_from as string, notes: p.notes as string | null });
  }
  const postMealMap = new Map<string, number[]>();
  for (const r of (readings ?? [])) {
    const arr = postMealMap.get(r.patient_id as string) ?? [];
    arr.push(r.value_mgdl as number);
    postMealMap.set(r.patient_id as string, arr);
  }
  const weightMap = new Map<string, number[]>();
  for (const w of (weighIns ?? [])) {
    const arr = weightMap.get(w.patient_id as string) ?? [];
    arr.push(w.weight_kg as number);
    weightMap.set(w.patient_id as string, arr);
  }
  const taskMap = new Map<string, { done: number; total: number }>();
  for (const t of (tasks ?? [])) {
    const cur = taskMap.get(t.patient_id as string) ?? { done: 0, total: 0 };
    cur.total += 1; if (t.done_at) cur.done += 1;
    taskMap.set(t.patient_id as string, cur);
  }

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  return ids.map((id) => {
    const pm = postMealMap.get(id) ?? [];
    const wt = weightMap.get(id) ?? [];
    const tk = taskMap.get(id);
    const weightChange = wt.length >= 2 ? Math.round((wt[wt.length - 1] - wt[0]) * 10) / 10 : null;
    return {
      id, name: nameOf.get(id) ?? null,
      plan: planOf.get(id) ?? null,
      avgPostMeal30d: avg(pm),
      weightChange30d: weightChange,
      mealAdherence7d: tk?.total ? Math.round((tk.done / tk.total) * 100) : null,
    };
  });
}

export async function getCoachPlanOutcomes(): Promise<CoachPatientOutcomeRow[]> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const ids = await myPatientIds(supabase, user.id);
  if (!ids.length) return [];

  const sevenAgo = new Date(Date.now() - 7 * 864e5).toISOString();

  const [{ data: profiles }, { data: plans }, { data: tasks }, { data: ledger }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").in("id", ids),
      supabase.from("movement_plans").select("patient_id, exercises, effective_from").in("patient_id", ids).order("effective_from", { ascending: false }),
      supabase.from("tasks").select("patient_id, done_at").in("patient_id", ids).in("kind", ["walk", "yoga_live"]).gte("for_date", sevenAgo.slice(0, 10)),
      supabase.from("points_ledger").select("patient_id, streak_day, points").in("patient_id", ids).order("created_at", { ascending: false }),
    ]);

  const nameOf = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));
  const planOf = new Map<string, { exercises: MovementExercise[]; effective_from: string }>();
  for (const p of (plans ?? [])) {
    if (!planOf.has(p.patient_id as string))
      planOf.set(p.patient_id as string, { exercises: p.exercises as MovementExercise[], effective_from: p.effective_from as string });
  }
  const taskMap = new Map<string, { done: number; total: number }>();
  for (const t of (tasks ?? [])) {
    const cur = taskMap.get(t.patient_id as string) ?? { done: 0, total: 0 };
    cur.total += 1; if (t.done_at) cur.done += 1;
    taskMap.set(t.patient_id as string, cur);
  }
  const streakOf = new Map<string, number>();
  const pointsOf = new Map<string, number>();
  for (const l of (ledger ?? [])) {
    const pid = l.patient_id as string;
    if (!streakOf.has(pid)) streakOf.set(pid, (l.streak_day as number) ?? 0);
    pointsOf.set(pid, (pointsOf.get(pid) ?? 0) + ((l.points as number) ?? 0));
  }

  return ids.map((id) => {
    const t = taskMap.get(id) ?? { done: 0, total: 0 };
    return {
      id, name: nameOf.get(id) ?? null,
      plan: planOf.get(id) ?? null,
      movementDone7d: t.done, movementTotal7d: t.total,
      movementPct7d: t.total ? Math.round((t.done / t.total) * 100) : 0,
      streak: streakOf.get(id) ?? 0,
      points: pointsOf.get(id) ?? 0,
    };
  }).sort((a, b) => b.movementPct7d - a.movementPct7d || b.streak - a.streak);
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

export type PatientReviewRow = {
  id: string;
  name: string | null;
  existingReview: { status: string; note: string | null } | null;
};

/** Patients in the current staff member's pods, with their review status for `weekStart`. */
export async function getWeeklyReviewData(weekStart: string): Promise<PatientReviewRow[]> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const ids = await myPatientIds(supabase, user.id);
  if (!ids.length) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ids)
    .order("full_name");

  const { data: reviews } = await supabase
    .from("patient_reviews")
    .select("patient_id, status, note")
    .in("patient_id", ids)
    .eq("reviewed_by", user.id)
    .eq("week_start", weekStart);

  const reviewMap = new Map((reviews ?? []).map((r) => [r.patient_id as string, { status: r.status as string, note: (r.note as string | null) ?? null }]));

  return (profiles ?? []).map((p) => ({
    id: p.id as string,
    name: (p.full_name as string | null) ?? null,
    existingReview: reviewMap.get(p.id as string) ?? null,
  }));
}

/** One referred patient at any funnel stage, with enough detail to act on. */
export type ReferralFunnelRow = {
  patientId: string;
  name: string | null;
  phone: string | null;
  status: "referred" | "converted" | "paid";
  referredAt: string | null;
  convertedAt: string | null;
  payoutPkr: number;
};

/** Referred patients not yet enrolled — a follow-up target, not a payout. Kept for the dashboard teaser. */
export type ReferralFollowUp = { patientId: string; name: string | null; phone: string | null; referredAt: string | null };

/** Returns the current staff member's own referral code + full funnel, or null if none assigned. */
export async function getMyReferralCode(): Promise<{
  code: string;
  referral_count: number;
  referred_count: number;
  converted_count: number;
  pending_pkr: number;
  paid_pkr: number;
  followUps: ReferralFollowUp[];
  rows: ReferralFunnelRow[];
} | null> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rc } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("referrer_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!rc) return null;

  const { data: refs } = await supabase
    .from("referrals")
    .select("patient_id, payout_pkr, status, enrolled_at, converted_at")
    .eq("code", rc.code as string)
    .order("enrolled_at", { ascending: false });

  const all = refs ?? [];
  const referred = all.filter((r) => r.status === "referred");
  const converted = all.filter((r) => r.status === "converted");
  const paid = all.filter((r) => r.status === "paid");

  // Only a converted-but-unpaid referral is money actually owed.
  const pendingPkr = converted.reduce((s, r) => s + ((r.payout_pkr as number) ?? 0), 0);
  const paidPkr = paid.reduce((s, r) => s + ((r.payout_pkr as number) ?? 0), 0);

  const ids = all.map((r) => r.patient_id as string).filter(Boolean);
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, full_name, phone").in("id", ids)
    : { data: [] };
  const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  const rows: ReferralFunnelRow[] = all.map((r) => {
    const p = byId.get(r.patient_id as string);
    return {
      patientId: r.patient_id as string,
      name: (p?.full_name as string) ?? null,
      phone: (p?.phone as string) ?? null,
      status: r.status as ReferralFunnelRow["status"],
      referredAt: (r.enrolled_at as string) ?? null,
      convertedAt: (r.converted_at as string) ?? null,
      payoutPkr: (r.payout_pkr as number) ?? 0,
    };
  });

  const followUps: ReferralFollowUp[] = rows
    .filter((r) => r.status === "referred")
    .map((r) => ({ patientId: r.patientId, name: r.name, phone: r.phone, referredAt: r.referredAt }));

  return {
    code: rc.code as string,
    referral_count: all.length,
    referred_count: referred.length,
    converted_count: converted.length + paid.length,
    pending_pkr: pendingPkr,
    paid_pkr: paidPkr,
    followUps,
    rows,
  };
}
