/** Types and constants safe to import from client components. */

export type DocumentKind =
  | "lab_report"
  | "prescription"
  | "imaging"
  | "discharge_summary"
  | "referral"
  | "other";

export type PatientDocument = {
  id: string;
  kind: DocumentKind;
  title: string;
  storage_path: string;
  mime_type: string | null;
  taken_on: string | null;
  shared_with_patient: boolean;
  uploaded_by: string;
  created_at: string;
};

/** A document with a short-lived signed URL resolved for display/download. */
export type PatientDocumentWithUrl = PatientDocument & { signedUrl: string | null };

export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  lab_report: "Lab report",
  prescription: "Prescription",
  imaging: "Imaging",
  discharge_summary: "Discharge summary",
  referral: "Referral",
  other: "Other",
};

export const ALLOWED_DOCUMENT_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
