import { createServerSupabase } from "@/lib/supabase/server";

export type PodMember = { role: "doctor" | "nutritionist" | "coach"; name: string | null };
export type ConsultSlot = { windowId: string; staffId: string; date: string; time: string; label: string };

const ROLE_EMOJI: Record<string, string> = { doctor: "🩺", nutritionist: "🥗", coach: "🧘" };
export function podEmoji(role: string): string {
  return ROLE_EMOJI[role] ?? "👤";
}

export type PatientMealPlan = {
  meals: { meal: string; description: string; carb_target_g: number | null }[];
  notes: string | null;
  effective_from: string;
};

/** The current patient's active meal plan (authored by their nutritionist). */
export async function getMyMealPlan(): Promise<PatientMealPlan | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("meal_plans")
    .select("meals, notes, effective_from")
    .eq("patient_id", user.id)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as PatientMealPlan) ?? null;
}

/** The current patient's care pod roster (from their cohort's care_pod). */
export async function getCarePod(): Promise<PodMember[]> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("cohort_members")
    .select(
      "cohorts(care_pods(doctor:doctor_id(full_name), nutritionist:nutritionist_id(full_name), coach:coach_id(full_name)))"
    )
    .eq("patient_id", user.id)
    .limit(1)
    .maybeSingle();

  const pod = (data as unknown as {
    cohorts?: { care_pods?: {
      doctor?: { full_name?: string };
      nutritionist?: { full_name?: string };
      coach?: { full_name?: string };
    } };
  })?.cohorts?.care_pods;
  if (!pod) return [];

  return [
    { role: "doctor", name: pod.doctor?.full_name ?? null },
    { role: "nutritionist", name: pod.nutritionist?.full_name ?? null },
    { role: "coach", name: pod.coach?.full_name ?? null },
  ];
}

function slotsForWindow(w: {
  id: string;
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_minutes: number;
}): ConsultSlot[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const out: ConsultSlot[] = [];
  for (let t = toMin(w.start_time); t + w.slot_minutes <= toMin(w.end_time); t += w.slot_minutes) {
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    out.push({ windowId: w.id, staffId: w.staff_id, date: w.date, time: `${hh}:${mm}:00`, label: `${hh}:${mm}` });
  }
  return out;
}

/** Open consult slots the patient can book (windows minus already-booked slots). */
export async function getOpenSlots(): Promise<ConsultSlot[]> {
  const supabase = createServerSupabase();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });

  const { data: windows } = await supabase
    .from("consult_windows")
    .select("id, staff_id, date, start_time, end_time, slot_minutes")
    .gte("date", today)
    .order("date", { ascending: true });
  if (!windows?.length) return [];

  const { data: booked } = await supabase
    .from("consult_bookings")
    .select("window_id, slot_time")
    .in("window_id", windows.map((w) => w.id));
  const taken = new Set((booked ?? []).map((b) => `${b.window_id}|${b.slot_time}`));

  return windows
    .flatMap((w) => slotsForWindow(w))
    .filter((s) => !taken.has(`${s.windowId}|${s.time}`));
}
