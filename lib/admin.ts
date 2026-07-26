import { createServerSupabase } from "@/lib/supabase/server";
import type { Resource } from "@/lib/resources-shared";
import type { PlanFlag } from "@/lib/plan";

export type AdminCohort = {
  id: string;
  name: string;
  start_date: string;
  status: string;
  memberCount: number;
  doctor: string | null;
  nutritionist: string | null;
  coach: string | null;
};
export type Person = { id: string; name: string | null; role: string; plan: string | null };
export type Template = { id: string; phase: number; kind: string; title: string; subtitle: string | null };

export type AppointmentStat = { role: string; label: string; total: number; upcoming: number; completed: number };

export type AdminOverview = {
  cohorts: AdminCohort[];
  staff: Person[];
  patients: Person[];
  templates: Template[];
  resources: (Resource & { is_active: boolean })[];
  planFlags: PlanFlag[];
  appointmentStats: AppointmentStat[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = createServerSupabase();

  const [{ data: cohorts }, { data: pods }, { data: members }, { data: profiles }, { data: templates }, { data: resources }, { data: planFlagsRaw }, { data: bookingsRaw }] =
    await Promise.all([
      supabase.from("cohorts").select("id, name, start_date, status").order("start_date", { ascending: false }),
      supabase.from("care_pods").select("cohort_id, doctor_id, nutritionist_id, coach_id"),
      supabase.from("cohort_members").select("cohort_id, patient_id"),
      supabase.from("profiles").select("id, full_name, role, plan"),
      supabase.from("task_templates").select("id, phase, kind, title, subtitle").order("phase").order("sort_order"),
      supabase.from("resources").select("id, title, type, description, url, tags, is_active, created_at").order("created_at", { ascending: false }),
      supabase.from("plan_feature_flags").select("plan, feature_key, label, enabled, sort_order").order("sort_order").order("plan"),
      supabase.from("consult_bookings").select("status, consult_windows(staff_id, profiles:staff_id(role))"),
    ]);

  const nameOf = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));
  const podBy = new Map((pods ?? []).map((p) => [p.cohort_id as string, p]));
  const countBy = new Map<string, number>();
  for (const m of members ?? []) countBy.set(m.cohort_id as string, (countBy.get(m.cohort_id as string) ?? 0) + 1);

  const adminCohorts: AdminCohort[] = (cohorts ?? []).map((c) => {
    const pod = podBy.get(c.id as string);
    return {
      id: c.id as string,
      name: c.name as string,
      start_date: c.start_date as string,
      status: c.status as string,
      memberCount: countBy.get(c.id as string) ?? 0,
      doctor: pod?.doctor_id ? nameOf.get(pod.doctor_id) ?? null : null,
      nutritionist: pod?.nutritionist_id ? nameOf.get(pod.nutritionist_id) ?? null : null,
      coach: pod?.coach_id ? nameOf.get(pod.coach_id) ?? null : null,
    };
  });

  const people = (profiles ?? []).map((p) => ({
    id: p.id as string,
    name: p.full_name as string | null,
    role: p.role as string,
    plan: (p.plan as string) ?? null,
  }));

  // Appointment stats grouped by staff role.
  const now = new Date().toISOString();
  const statMap = new Map<string, { total: number; upcoming: number; completed: number }>();
  for (const b of bookingsRaw ?? []) {
    const window = (b as unknown as { consult_windows?: { staff_id: string; profiles?: { role?: string } } }).consult_windows;
    const role = window?.profiles?.role ?? "unknown";
    const cur = statMap.get(role) ?? { total: 0, upcoming: 0, completed: 0 };
    cur.total += 1;
    if ((b as unknown as { status: string }).status === "completed") cur.completed += 1;
    else cur.upcoming += 1;
    statMap.set(role, cur);
  }
  const roleLabel: Record<string, string> = { doctor: "Doctor", nutritionist: "Nutritionist", coach: "Fitness Coach" };
  const appointmentStats: AppointmentStat[] = Array.from(statMap.entries()).map(([role, s]) => ({
    role, label: roleLabel[role] ?? role, ...s,
  }));

  return {
    cohorts: adminCohorts,
    staff: people.filter((p) => p.role !== "patient"),
    patients: people.filter((p) => p.role === "patient"),
    templates: (templates ?? []) as Template[],
    resources: (resources ?? []) as (Resource & { is_active: boolean })[],
    planFlags: (planFlagsRaw as PlanFlag[]) ?? [],
    appointmentStats,
  };
}
