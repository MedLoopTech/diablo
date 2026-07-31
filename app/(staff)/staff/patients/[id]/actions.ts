"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function upsertMedicalHistory(
  patientId: string,
  data: {
    diabetesType: string | null;
    diagnosisYear: number | null;
    allergies: string[];
    comorbidities: string[];
    preExistingMeds: { name: string; dose?: string; frequency?: string }[];
    familyHistory: string | null;
    notes: string | null;
  }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized." };

  const { error } = await supabase.from("medical_history").upsert(
    {
      patient_id: patientId,
      diabetes_type: data.diabetesType,
      diagnosis_year: data.diagnosisYear,
      allergies: data.allergies,
      comorbidities: data.comorbidities,
      pre_existing_meds: data.preExistingMeds,
      family_history: data.familyHistory,
      notes: data.notes,
      updated_by: user.id,
    },
    { onConflict: "patient_id" }
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/staff/patients/${patientId}`);
  return { ok: true };
}
