"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * RLS (labs_doctor_insert/update/delete, via is_pod_doctor) is the real
 * boundary — only the pod doctor or admin can write. This mirrors
 * medication_plans exactly: nutritionist/coach can read lab values
 * (labs_staff_read) but not edit them.
 */

export async function addLabResult(data: {
  patientId: string;
  analyte: string;
  label: string;
  value: number;
  unit: string;
  refLow: number | null;
  refHigh: number | null;
  takenOn: string;
}) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // flag is derived by the DB trigger, not sent.
  const { error } = await supabase.from("lab_results").insert({
    patient_id: data.patientId,
    analyte: data.analyte,
    label: data.label,
    value: data.value,
    unit: data.unit,
    ref_low: data.refLow,
    ref_high: data.refHigh,
    taken_on: data.takenOn,
    entered_by: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/staff/patients/${data.patientId}`);
}

export async function updateLabResult(data: {
  id: string;
  patientId: string;
  value: number;
  refLow: number | null;
  refHigh: number | null;
  takenOn: string;
}) {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("lab_results")
    .update({
      value: data.value,
      ref_low: data.refLow,
      ref_high: data.refHigh,
      taken_on: data.takenOn,
    })
    .eq("id", data.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/staff/patients/${data.patientId}`);
}

export async function deleteLabResult(id: string, patientId: string) {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("lab_results").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/staff/patients/${patientId}`);
}
