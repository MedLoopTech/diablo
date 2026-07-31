"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { PatientReviewRow } from "@/lib/staff";
import { savePatientReview } from "../actions";

const STATUS_OPTS = [
  { value: "reviewed",        label: "Reviewed — on track" },
  { value: "needs_followup",  label: "Needs follow-up" },
  { value: "escalated",       label: "Escalate to team" },
] as const;

export function WeeklyReviewForm({
  patient,
  weekStart,
}: {
  patient: PatientReviewRow;
  weekStart: string;
}) {
  const existing = patient.existingReview;
  const [open, setOpen] = useState(!existing);
  const [status, setStatus] = useState<"reviewed" | "needs_followup" | "escalated">(
    (existing?.status as "reviewed" | "needs_followup" | "escalated") ?? "reviewed"
  );
  const [note, setNote] = useState(existing?.note ?? "");
  const [saved, setSaved] = useState(!!existing);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      const r = await savePatientReview(patient.id, weekStart, note, status);
      if (r.ok) { setSaved(true); setOpen(false); setError(null); }
      else setError(r.error ?? "Failed to save.");
    });

  const statusLabel = STATUS_OPTS.find((o) => o.value === status)?.label ?? status;
  const badge =
    status === "escalated"   ? "bg-coral text-white"
    : status === "needs_followup" ? "bg-marigold-soft text-[#9A6A14]"
    : "bg-mint text-primary-deep";

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/staff/patients/${patient.id}`}
          className="font-body text-[14px] font-bold text-ink underline-offset-2 hover:underline"
        >
          {patient.name ?? "Patient"}
        </Link>
        <div className="flex items-center gap-2">
          {saved && (
            <span className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold ${badge}`}>
              {statusLabel}
            </span>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-line bg-paper px-3 py-1 font-body text-[12px] font-bold text-ink"
          >
            {open ? "Cancel" : saved ? "Edit" : "Review"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Clinical note (optional)…"
            rows={3}
            className="rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
          />
          {error && <span className="font-body text-[12px] text-coral">{error}</span>}
          <div className="flex items-center gap-2">
            <button
              onClick={submit}
              disabled={pending}
              className="rounded-full bg-primary px-4 py-1.5 font-body text-[12px] font-bold text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
