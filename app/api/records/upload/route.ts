import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { RECORDS_BUCKET } from "@/lib/documents";
import { ALLOWED_DOCUMENT_MIME, MAX_DOCUMENT_BYTES, type DocumentKind } from "@/lib/documents-shared";
import { supabaseConfigured } from "@/lib/env";

const KINDS: DocumentKind[] = [
  "lab_report", "prescription", "imaging", "discharge_summary", "referral", "other",
];

/**
 * Shared upload endpoint for a lab report or other record — a patient
 * uploading their own, or a pod staff member uploading on a patient's
 * behalf. The storage write goes through the service-role client (same
 * convention as PHOTO_BUCKET), but the row insert goes through the regular
 * RLS-scoped client, so authorization is enforced by Postgres, not
 * re-implemented here. If the insert is rejected (e.g. staff outside the
 * patient's pod), the just-uploaded object is deleted so nothing orphans.
 */
export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (!ALLOWED_DOCUMENT_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, JPEG, PNG, or WebP files are accepted." },
      { status: 415 }
    );
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json({ error: "File must be under 10 MB." }, { status: 413 });
  }

  const title = String(form?.get("title") ?? "").trim().slice(0, 120);
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const kindRaw = String(form?.get("kind") ?? "other");
  const kind: DocumentKind = (KINDS as string[]).includes(kindRaw) ? (kindRaw as DocumentKind) : "other";

  const takenOnRaw = form?.get("takenOn");
  const takenOn = typeof takenOnRaw === "string" && takenOnRaw ? takenOnRaw : null;

  // Defaults to the caller's own id; staff can pass a patient's id explicitly.
  const patientId = String(form?.get("patientId") ?? user.id);

  const ext = file.name.includes(".") ? file.name.split(".").pop()!.slice(0, 8) : "bin";
  const path = `${patientId}/${randomUUID()}-${Date.now()}.${ext}`;

  const admin = createAdminSupabase();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await admin.storage
    .from(RECORDS_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const { data: doc, error: insertErr } = await supabase
    .from("documents")
    .insert({
      patient_id: patientId,
      kind,
      title,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
      taken_on: takenOn,
      uploaded_by: user.id,
    })
    .select("id, kind, title, storage_path, mime_type, taken_on, shared_with_patient, uploaded_by, created_at")
    .single();

  if (insertErr || !doc) {
    // Not authorized to add a record for this patient, or some other write
    // failure — don't leave an orphaned object in storage.
    await admin.storage.from(RECORDS_BUCKET).remove([path]);
    return NextResponse.json(
      { error: insertErr?.message ?? "Could not save record." },
      { status: 403 }
    );
  }

  const { data: signed } = await admin.storage.from(RECORDS_BUCKET).createSignedUrl(path, 3600);

  return NextResponse.json({ ok: true, document: { ...doc, signedUrl: signed?.signedUrl ?? null } });
}
