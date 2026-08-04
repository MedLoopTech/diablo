import { createServerSupabase } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/announcements-shared";

export * from "@/lib/announcements-shared";

const COLUMNS =
  "id, cohort_id, title, body, cta_label, cta_url, starts_on, ends_on, published";

/**
 * Live announcements for the patient's own cohort. RLS already restricts
 * this to published, in-window rows the caller's cohort can see; the
 * explicit filters here keep the intent visible at the call site and cap
 * how many a patient sees at once — Today is for their readings, not a
 * billboard.
 */
export async function getLiveAnnouncements(limit = 2): Promise<Announcement[]> {
  const supabase = createServerSupabase();
  const { data: cohortId } = await supabase.rpc("my_cohort");
  if (!cohortId) return [];

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("cohort_announcements")
    .select(COLUMNS)
    .eq("cohort_id", cohortId)
    .eq("published", true)
    .or(`starts_on.is.null,starts_on.lte.${today}`)
    .or(`ends_on.is.null,ends_on.gte.${today}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/** Cohorts the current staff member's pods serve, for the management screen's picker. */
export async function getStaffCohorts(): Promise<{ id: string; name: string }[]> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role === "admin") {
    const { data } = await supabase.from("cohorts").select("id, name").order("start_date", { ascending: false });
    return data ?? [];
  }

  const { data: pods } = await supabase
    .from("care_pods")
    .select("cohort_id")
    .or(`doctor_id.eq.${user.id},nutritionist_id.eq.${user.id},coach_id.eq.${user.id}`);
  const cohortIds = (pods ?? []).map((p) => p.cohort_id);
  if (!cohortIds.length) return [];

  const { data } = await supabase.from("cohorts").select("id, name").in("id", cohortIds);
  return data ?? [];
}

/** Every announcement for a cohort, live or not — the pod staff management screen. */
export async function getCohortAnnouncements(cohortId: string): Promise<Announcement[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("cohort_announcements")
    .select(COLUMNS)
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
