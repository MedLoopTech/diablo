"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, Eyebrow } from "@/components/ui";
import { DOCUMENT_KIND_LABEL, type DocumentKind, type PatientDocumentWithUrl } from "@/lib/documents-shared";
import type { LabResult } from "@/lib/labs-shared";
import { deleteMyDocument } from "./document-actions";

const FLAG_CLASS: Record<LabResult["flag"], string> = {
  low: "bg-marigold-soft text-[#9A6A14]",
  high: "bg-coral/10 text-coral",
  normal: "bg-mint text-primary-deep",
};

export function RecordsSection({
  myUserId,
  labResults,
  documents,
}: {
  myUserId: string;
  labResults: LabResult[];
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
    <>
      {labResults.length > 0 && (
        <div>
          <Eyebrow className="mb-3">Lab results</Eyebrow>
          <div className="flex flex-col gap-2">
            {labResults.map((r) => (
              <Card key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-body text-[13.5px] font-bold text-ink">{r.label}</div>
                  <div className="font-body text-[11.5px] text-ink-soft">{r.taken_on}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 font-body text-[12px] font-bold ${FLAG_CLASS[r.flag]}`}>
                  {r.value} {r.unit}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <Eyebrow className="mb-3">My records</Eyebrow>

        <Card className="mb-3 flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fasting panel, 4 Aug"
            maxLength={120}
            className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none focus:border-primary"
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
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="min-w-0 flex-1 font-body text-[12px]"
            />
          </div>
          <button
            onClick={upload}
            disabled={uploading}
            className="self-start rounded-lg bg-primary px-4 py-2 font-body text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload a report"}
          </button>
          {error && <p className="font-body text-[12.5px] text-red">{error}</p>}
        </Card>

        {documents.length === 0 ? (
          <Card>
            <p className="font-body text-[13.5px] text-ink-soft">
              Upload a lab report, prescription, or scan — your care pod can see it too.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {documents.map((d) => (
              <Card key={d.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  {d.signedUrl ? (
                    <a
                      href={d.signedUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-body text-[13.5px] font-bold text-primary hover:underline"
                    >
                      {d.title}
                    </a>
                  ) : (
                    <span className="font-body text-[13.5px] font-bold text-ink">{d.title}</span>
                  )}
                  <div className="font-body text-[11.5px] text-ink-soft">
                    {DOCUMENT_KIND_LABEL[d.kind]}{d.taken_on ? ` · ${d.taken_on}` : ""}
                    {d.uploaded_by !== myUserId && " · from your care pod"}
                  </div>
                </div>
                {d.uploaded_by === myUserId && (
                  <button
                    onClick={() => start(() => deleteMyDocument(d.id))}
                    disabled={pending}
                    aria-label={`Delete ${d.title}`}
                    className="shrink-0 px-1 font-body text-ink-soft hover:text-red disabled:opacity-50"
                  >
                    ×
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
