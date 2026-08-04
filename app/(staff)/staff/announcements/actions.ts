"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { checkAnnouncementCopy, safeHref } from "@/lib/announcements-shared";
import { revalidatePath } from "next/cache";

/**
 * RLS already enforces pod-membership/admin on every write below, but the
 * checks here keep the failure a clear message instead of a bare Postgres
 * "row violates policy" error, and let us return early before hitting the DB.
 */
async function requirePodStaffOrAdmin(cohortId: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "admin") return { supabase, userId: user.id };

  const { data: pod } = await supabase
    .from("care_pods")
    .select("doctor_id, nutritionist_id, coach_id")
    .eq("cohort_id", cohortId)
    .maybeSingle();
  const inPod = pod && [pod.doctor_id, pod.nutritionist_id, pod.coach_id].includes(user.id);
  if (!inPod) throw new Error("not_authorised");

  return { supabase, userId: user.id };
}

export async function createAnnouncement(data: {
  cohortId: string;
  title: string;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  startsOn: string | null;
  endsOn: string | null;
}) {
  // Validated server-side as well as in the form — the action is the real
  // boundary, and these rules are non-negotiable (see announcements-shared.ts).
  const claim = checkAnnouncementCopy(data.title, data.body, data.ctaLabel);
  if (claim) throw new Error(claim);

  const url = safeHref(data.ctaUrl);
  if (data.ctaUrl?.trim() && !url) {
    throw new Error("That link isn't a valid web address (http:// or https:// only).");
  }
  if (data.endsOn && data.startsOn && data.endsOn < data.startsOn) {
    throw new Error("The end date can't be before the start date.");
  }

  const { supabase, userId } = await requirePodStaffOrAdmin(data.cohortId);

  const { error } = await supabase.from("cohort_announcements").insert({
    cohort_id: data.cohortId,
    title: data.title,
    body: data.body,
    cta_label: data.ctaLabel,
    cta_url: url,
    starts_on: data.startsOn || null,
    ends_on: data.endsOn || null,
    created_by: userId,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/staff/announcements");
  revalidatePath("/today");
}

export async function toggleAnnouncement(id: string, cohortId: string, published: boolean) {
  const { supabase } = await requirePodStaffOrAdmin(cohortId);
  const { error } = await supabase
    .from("cohort_announcements")
    .update({ published })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/staff/announcements");
  revalidatePath("/today");
}

export async function deleteAnnouncement(id: string, cohortId: string) {
  const { supabase } = await requirePodStaffOrAdmin(cohortId);
  const { error } = await supabase.from("cohort_announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/staff/announcements");
  revalidatePath("/today");
}
