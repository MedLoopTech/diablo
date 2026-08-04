"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DOCUMENT_KIND_LABEL, type DocumentKind, type PatientDocumentWithUrl } from "@/lib/documents-shared";
import { toggleDocumentSharing, deleteDocument } from "./document-actions";

export function DocumentsPanel({
  patientId,
  documents,
}: {
  patientId: string;
  documents: PatientDocumentWithUrl[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<DocumentKind>("lab_report");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const upload = async () => {
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("kind", kind);
      form.set("title", title.trim() || file.name);
      form.set("patientId", patientId);
      const res = await fetch("/api/records/upload", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed.");
      setTitle("");
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <h2 className="eyebrow mb-3">Documents</h2>

      <div className="mb-3 flex flex-col gap-2 rounded-card border border-line bg-card p-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Fasting panel, 4 Aug"
          maxLength={120}
          className="rounded-lg border border-line bg-paper px-2.5 py-1.5 font-body text-[13px] text-ink"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DocumentKind)}
            className="rounded-lg border border-line bg-paper px-2 py-1.5 font-body text-[13px] text-ink"
          >
            {Object.entries(DOCUMENT_KIND_LABEL).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
          <input ref={fileInput} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="font-body text-[12.5px]" />
          <button
            onClick={upload}
            disabled={uploading}
            className="rounded-lg bg-primary px-3 py-1.5 font-body text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        {error && <p className="font-body text-[12.5px] text-red">{error}</p>}
      </div>

      {documents.length === 0 ? (
        <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
          No documents uploaded.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-card border border-line bg-card px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                {d.signedUrl ? (
                  <a
                    href={d.signedUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-body text-[13px] font-semibold text-primary hover:underline"
                  >
                    {d.title}
                  </a>
                ) : (
                  <span className="font-body text-[13px] font-semibold text-ink">{d.title}</span>
                )}
                <div className="font-body text-[11.5px] text-ink-soft">
                  {DOCUMENT_KIND_LABEL[d.kind]}{d.taken_on ? ` · ${d.taken_on}` : ""}
                </div>
              </div>
              <button
                onClick={() => start(() => toggleDocumentSharing(d.id, patientId, !d.shared_with_patient))}
                disabled={pending}
                className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold disabled:opacity-50 ${
                  d.shared_with_patient ? "bg-mint text-primary-deep" : "border border-line bg-paper text-ink-soft"
                }`}
              >
                {d.shared_with_patient ? "Shared" : "Private"}
              </button>
              <button
                onClick={() => start(() => deleteDocument(d.id, patientId))}
                disabled={pending}
                aria-label={`Delete ${d.title}`}
                className="shrink-0 px-1 font-body text-ink-soft hover:text-red disabled:opacity-50"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
