import { createServerSupabase } from "@/lib/supabase/server";
import type { LabResult } from "@/lib/labs-shared";

export * from "@/lib/labs-shared";

const COLUMNS = "id, document_id, analyte, label, value, unit, ref_low, ref_high, flag, taken_on";

/** The signed-in patient's own lab history, most recent first. */
export async function getMyLabResults(limit = 40): Promise<LabResult[]> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("lab_results")
    .select(COLUMNS)
    .eq("patient_id", user.id)
    .order("taken_on", { ascending: false })
    .limit(limit);
  return (data ?? []) as LabResult[];
}

/** A patient's lab history for the staff detail page — RLS scopes this to the caller's pod. */
export async function getPatientLabResults(patientId: string, limit = 40): Promise<LabResult[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("lab_results")
    .select(COLUMNS)
    .eq("patient_id", patientId)
    .order("taken_on", { ascending: false })
    .limit(limit);
  return (data ?? []) as LabResult[];
}
