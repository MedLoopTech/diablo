"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { RECORDS_BUCKET } from "@/lib/documents";
import { revalidatePath } from "next/cache";

/** RLS (documents_staff_rw, via staff_sees_patient) is the real boundary here. */

export async function toggleDocumentSharing(id: string, patientId: string, shared: boolean) {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("documents").update({ shared_with_patient: shared }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/staff/patients/${patientId}`);
  revalidatePath("/log");
}

export async function deleteDocument(id: string, patientId: string) {
  const supabase = createServerSupabase();

  const { data: doc } = await supabase.from("documents").select("storage_path").eq("id", id).maybeSingle();

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (doc?.storage_path) {
    const admin = createAdminSupabase();
    await admin.storage.from(RECORDS_BUCKET).remove([doc.storage_path]);
  }

  revalidatePath(`/staff/patients/${patientId}`);
  revalidatePath("/log");
}
