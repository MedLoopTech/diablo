"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { RECORDS_BUCKET } from "@/lib/documents";
import { revalidatePath } from "next/cache";

/**
 * RLS (documents_patient_delete: patient_id = auth.uid() and uploaded_by =
 * auth.uid()) is the real boundary — a patient can remove a report they
 * added themselves, but not one their care pod shared.
 */
export async function deleteMyDocument(id: string) {
  const supabase = createServerSupabase();

  const { data: doc } = await supabase.from("documents").select("storage_path").eq("id", id).maybeSingle();

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (doc?.storage_path) {
    const admin = createAdminSupabase();
    await admin.storage.from(RECORDS_BUCKET).remove([doc.storage_path]);
  }

  revalidatePath("/log");
}
