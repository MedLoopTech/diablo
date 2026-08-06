import { createServerSupabase } from "@/lib/supabase/server";
import type { Resource } from "@/lib/resources-shared";
import type { PlanFlag } from "@/lib/plan";
import type { AutomationConfigRow } from "@/lib/automation";

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
export type Person = { id: string; name: string | null; phone: string | null; role: string; plan: string | null };
export type Template = {
  id: string;
  phase: number;
  kind: string;
  title: string;
  subtitle: string | null;
  photo_mode: "off" | "optional" | "required";
  photo_prompt: string | null;
  photo_points_bonus: number;
};

export type AppointmentStat = { role: string; label: string; total: number; upcoming: number; completed: number };

export type RewardType = "cash" | "consult" | "resource" | "plan_upgrade" | "voucher";

export type ReferralCodeRow = {
  id: string;
  code: string;
  referrer_id: string | null;
  referrer_name: string | null;
  partner_name: string | null;
  partner_contact: string | null;
  payment_method: string | null;
  account_title: string | null;
  account_number: string | null;
  is_active: boolean;
  notes: string | null;
  reward_type: RewardType;
  reward_value: Record<string, unknown>;
  referral_count: number;
  referred_count: number;
  converted_count: number;
  converted_pkr: number;
  paid_count: number;
  paid_pkr: number;
};

export type ReferralRow = {
  id: string;
  code: string;
  referrer_name: string | null;
  patient_name: string | null;
  enrolled_at: string | null;
  converted_at: string | null;
  payout_pkr: number;
  status: "referred" | "converted" | "paid";
  paid_at: string | null;
};

export type AdminOverview = {
  cohorts: AdminCohort[];
  staff: Person[];
  patients: Person[];
  templates: Template[];
  resources: (Resource & { is_active: boolean })[];
  planFlags: PlanFlag[];
  appointmentStats: AppointmentStat[];
  automationConfig: AutomationConfigRow[];
  referralCodes: ReferralCodeRow[];
  referrals: ReferralRow[];
};

export type StaffPerfRow = {
  id: string;
  name: string | null;
  role: string;
  patientCount: number;
  consultsCompleted: number;
  consultsUpcoming: number;
  referralCount: number;
  pendingPkr: number;
  paidPkr: number;
};

export async function getStaffPerformance(): Promise<{ rows: StaffPerfRow[]; totalPatients: number }> {
  const supabase = createServerSupabase();

  const [{ data: staff }, { data: pods }, { data: cohortMembers }, { data: bookings }, { data: referrals }, { count: patientCount }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, role").in("role", ["doctor", "nutritionist", "coach"]),
      supabase.from("care_pods").select("cohort_id, doctor_id, nutritionist_id, coach_id"),
      supabase.from("cohort_members").select("cohort_id"),
      supabase.from("consult_bookings").select("status, slot_time, consult_windows(staff_id)"),
      supabase.from("referrals").select("referrer_id, payout_pkr, status"),
      supabase.from("cohort_members").select("patient_id", { count: "exact", head: true }),
    ]);

  // Patient counts per cohort
  const cohortSize = new Map<string, number>();
  for (const m of cohortMembers ?? []) cohortSize.set(m.cohort_id as string, (cohortSize.get(m.cohort_id as string) ?? 0) + 1);

  const patientsByStaff = new Map<string, number>();
  for (const pod of pods ?? []) {
    const n = cohortSize.get(pod.cohort_id as string) ?? 0;
    if (pod.doctor_id) patientsByStaff.set(pod.doctor_id as string, (patientsByStaff.get(pod.doctor_id as string) ?? 0) + n);
    if (pod.nutritionist_id) patientsByStaff.set(pod.nutritionist_id as string, (patientsByStaff.get(pod.nutritionist_id as string) ?? 0) + n);
    if (pod.coach_id) patientsByStaff.set(pod.coach_id as string, (patientsByStaff.get(pod.coach_id as string) ?? 0) + n);
  }

  // Consult counts per staff
  const now = new Date().toISOString();
  const completedByStaff = new Map<string, number>();
  const upcomingByStaff = new Map<string, number>();
  for (const b of bookings ?? []) {
    const staffId = (b as unknown as { consult_windows?: { staff_id?: string } }).consult_windows?.staff_id;
    if (!staffId) continue;
    if ((b as unknown as { status: string }).status === "completed") completedByStaff.set(staffId, (completedByStaff.get(staffId) ?? 0) + 1);
    else if ((b as unknown as { slot_time: string }).slot_time > now) upcomingByStaff.set(staffId, (upcomingByStaff.get(staffId) ?? 0) + 1);
  }

  // Referral stats per staff. Only "converted" referrals count toward the
  // pending payout total — a "referred" row hasn't earned anything yet.
  const refCount = new Map<string, number>();
  const pendingPkr = new Map<string, number>();
  const paidPkr = new Map<string, number>();
  for (const r of referrals ?? []) {
    const rid = r.referrer_id as string;
    if (!rid) continue;
    refCount.set(rid, (refCount.get(rid) ?? 0) + 1);
    const status = r.status as string;
    if (status === "paid") paidPkr.set(rid, (paidPkr.get(rid) ?? 0) + ((r.payout_pkr as number) ?? 0));
    else if (status === "converted") pendingPkr.set(rid, (pendingPkr.get(rid) ?? 0) + ((r.payout_pkr as number) ?? 0));
  }

  const rows = (staff ?? []).map((s) => ({
    id: s.id as string,
    name: s.full_name as string | null,
    role: s.role as string,
    patientCount: patientsByStaff.get(s.id as string) ?? 0,
    consultsCompleted: completedByStaff.get(s.id as string) ?? 0,
    consultsUpcoming: upcomingByStaff.get(s.id as string) ?? 0,
    referralCount: refCount.get(s.id as string) ?? 0,
    pendingPkr: pendingPkr.get(s.id as string) ?? 0,
    paidPkr: paidPkr.get(s.id as string) ?? 0,
  })).sort((a, b) => b.patientCount - a.patientCount);

  return { rows, totalPatients: patientCount ?? 0 };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = createServerSupabase();

  const [{ data: cohorts }, { data: pods }, { data: members }, { data: profiles }, { data: templates }, { data: resources }, { data: planFlagsRaw }, { data: bookingsRaw }, { data: automationRows }, { data: refCodes }, { data: refRows }] =
    await Promise.all([
      supabase.from("cohorts").select("id, name, start_date, status").order("start_date", { ascending: false }),
      supabase.from("care_pods").select("cohort_id, doctor_id, nutritionist_id, coach_id"),
      supabase.from("cohort_members").select("cohort_id, patient_id"),
      supabase.from("profiles").select("id, full_name, phone, role, plan"),
      supabase.from("task_templates").select("id, phase, kind, title, subtitle, photo_mode, photo_prompt, photo_points_bonus").order("phase").order("sort_order"),
      supabase.from("resources").select("id, title, type, description, url, tags, is_active, created_at").order("created_at", { ascending: false }),
      supabase.from("plan_feature_flags").select("plan, feature_key, label, enabled, sort_order").order("sort_order").order("plan"),
      supabase.from("consult_bookings").select("status, consult_windows(staff_id, profiles:staff_id(role))"),
      supabase.from("automation_config").select("key, value, label, description, group_name, sort_order, updated_at").order("group_name").order("sort_order"),
      supabase.from("referral_codes").select("id, code, referrer_id, partner_name, partner_contact, payment_method, account_title, account_number, is_active, notes, reward_type, reward_value").order("created_at", { ascending: false }),
      supabase.from("referrals").select("id, code, referrer_id, patient_id, enrolled_at, converted_at, payout_pkr, status, paid_at").order("enrolled_at", { ascending: false }),
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
    phone: p.phone as string | null,
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

  // Build referral code rows with aggregated stats — a "referred" row is a
  // signup that hasn't converted (enrolled in a cohort) yet, so it's a
  // follow-up target, not money owed.
  const refsByCode = new Map<string, { referred: number; converted: number; paid: number; converted_pkr: number; paid_pkr: number }>();
  for (const r of refRows ?? []) {
    const code = r.code as string;
    const cur = refsByCode.get(code) ?? { referred: 0, converted: 0, paid: 0, converted_pkr: 0, paid_pkr: 0 };
    const status = r.status as string;
    if (status === "paid") { cur.paid += 1; cur.paid_pkr += (r.payout_pkr as number) ?? 0; }
    else if (status === "converted") { cur.converted += 1; cur.converted_pkr += (r.payout_pkr as number) ?? 0; }
    else { cur.referred += 1; }
    refsByCode.set(code, cur);
  }
  const referralCodes: ReferralCodeRow[] = (refCodes ?? []).map((rc) => {
    const stats = refsByCode.get(rc.code as string) ?? { referred: 0, converted: 0, paid: 0, converted_pkr: 0, paid_pkr: 0 };
    return {
      id: rc.id as string,
      code: rc.code as string,
      referrer_id: (rc.referrer_id as string) ?? null,
      referrer_name: rc.referrer_id ? (nameOf.get(rc.referrer_id as string) ?? null) : null,
      partner_name: (rc.partner_name as string) ?? null,
      partner_contact: (rc.partner_contact as string) ?? null,
      payment_method: (rc.payment_method as string) ?? null,
      account_title: (rc.account_title as string) ?? null,
      account_number: (rc.account_number as string) ?? null,
      is_active: rc.is_active as boolean,
      notes: (rc.notes as string) ?? null,
      reward_type: (rc.reward_type as ReferralCodeRow["reward_type"]) ?? "cash",
      reward_value: (rc.reward_value as Record<string, unknown>) ?? {},
      referral_count: stats.referred + stats.converted + stats.paid,
      referred_count: stats.referred,
      converted_count: stats.converted,
      converted_pkr: stats.converted_pkr,
      paid_count: stats.paid,
      paid_pkr: stats.paid_pkr,
    };
  });

  const referrals: ReferralRow[] = (refRows ?? []).map((r) => ({
    id: r.id as string,
    code: r.code as string,
    referrer_name: r.referrer_id ? (nameOf.get(r.referrer_id as string) ?? null) : null,
    patient_name: r.patient_id ? (nameOf.get(r.patient_id as string) ?? null) : null,
    converted_at: (r.converted_at as string) ?? null,
    enrolled_at: (r.enrolled_at as string) ?? null,
    payout_pkr: (r.payout_pkr as number) ?? 2000,
    status: r.status as ReferralRow["status"],
    paid_at: (r.paid_at as string) ?? null,
  }));

  return {
    cohorts: adminCohorts,
    staff: people.filter((p) => p.role !== "patient"),
    patients: people.filter((p) => p.role === "patient"),
    templates: (templates ?? []) as Template[],
    resources: (resources ?? []) as (Resource & { is_active: boolean })[],
    planFlags: (planFlagsRaw as PlanFlag[]) ?? [],
    appointmentStats,
    automationConfig: (automationRows ?? []) as AutomationConfigRow[],
    referralCodes,
    referrals,
  };
}
