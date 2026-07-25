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

export type Medication = { name: string; dose: string; schedule: string };
export type MedicationPlan = {
  id: string;
  medications: Medication[];
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
  bookings: { id: string; slot_time: string; reason: string | null; status: string; context_snapshot: Record<string, unknown> | null }[];
};

/** Full timeline for one patient. RLS returns nothing if not in the doctor's pod. */
export async function getPatientDetail(patientId: string): Promise<PatientDetail | null> {
  const supabase = createServerSupabase();
  const [{ data: prof }, { data: readings }, { data: meals }, { data: esc }, { data: plan }, { data: bookings }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("id", patientId).maybeSingle(),
      supabase.from("glucose_readings").select("id, value_mgdl, context, flag, taken_at").eq("patient_id", patientId).order("taken_at", { ascending: false }).limit(30),
      supabase.from("meals").select("id, meal_type, ai_analysis, eaten_at").eq("patient_id", patientId).order("eaten_at", { ascending: false }).limit(10),
      supabase.from("escalations").select("id, kind, status, created_at").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(20),
      supabase.from("medication_plans").select("id, medications, effective_from, notes").eq("patient_id", patientId).order("effective_from", { ascending: false }).limit(1).maybeSingle(),
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
