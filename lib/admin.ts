import { createServerSupabase } from "@/lib/supabase/server";
import type { Resource } from "@/lib/resources-shared";

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
export type Person = { id: string; name: string | null; role: string };
export type Template = { id: string; phase: number; kind: string; title: string; subtitle: string | null };

export type AdminOverview = {
  cohorts: AdminCohort[];
  staff: Person[];
  patients: Person[];
  templates: Template[];
  resources: (Resource & { is_active: boolean })[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = createServerSupabase();

  const [{ data: cohorts }, { data: pods }, { data: members }, { data: profiles }, { data: templates }, { data: resources }] =
    await Promise.all([
      supabase.from("cohorts").select("id, name, start_date, status").order("start_date", { ascending: false }),
      supabase.from("care_pods").select("cohort_id, doctor_id, nutritionist_id, coach_id"),
      supabase.from("cohort_members").select("cohort_id, patient_id"),
      supabase.from("profiles").select("id, full_name, role"),
      supabase.from("task_templates").select("id, phase, kind, title, subtitle").order("phase").order("sort_order"),
      supabase.from("resources").select("id, title, type, description, url, tags, is_active, created_at").order("created_at", { ascending: false }),
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

  const people = (profiles ?? []).map((p) => ({ id: p.id as string, name: p.full_name as string | null, role: p.role as string }));
  return {
    cohorts: adminCohorts,
    staff: people.filter((p) => p.role !== "patient"),
    patients: people.filter((p) => p.role === "patient"),
    templates: (templates ?? []) as Template[],
    resources: (resources ?? []) as (Resource & { is_active: boolean })[],
  };
}
