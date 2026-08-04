import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { PatientDocument, PatientDocumentWithUrl } from "@/lib/documents-shared";

export * from "@/lib/documents-shared";

export const RECORDS_BUCKET = "clinical-records";

const COLUMNS =
  "id, kind, title, storage_path, mime_type, taken_on, shared_with_patient, uploaded_by, created_at";

/** Resolves a short-lived signed URL per row — the DB read already went through RLS. */
async function withSignedUrls(rows: PatientDocument[]): Promise<PatientDocumentWithUrl[]> {
  if (rows.length === 0) return [];
  const admin = createAdminSupabase();
  return Promise.all(
    rows.map(async (d) => {
      const { data: signed } = await admin.storage
        .from(RECORDS_BUCKET)
        .createSignedUrl(d.storage_path, 3600);
      return { ...d, signedUrl: signed?.signedUrl ?? null };
    })
  );
}

/** The signed-in patient's own documents (their uploads + anything staff shared). */
export async function getMyDocuments(limit = 30): Promise<PatientDocumentWithUrl[]> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("documents")
    .select(COLUMNS)
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return withSignedUrls((data ?? []) as PatientDocument[]);
}

/** A patient's documents for the staff detail page — RLS scopes this to the caller's pod. */
export async function getPatientDocuments(patientId: string, limit = 30): Promise<PatientDocumentWithUrl[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("documents")
    .select(COLUMNS)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return withSignedUrls((data ?? []) as PatientDocument[]);
}
