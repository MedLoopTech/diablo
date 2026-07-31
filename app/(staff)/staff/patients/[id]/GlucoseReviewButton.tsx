"use client";

import { useState, useTransition } from "react";
import { markGlucoseReviewed } from "../../actions";

export function GlucoseReviewButton({
  readingId,
  existingNote,
  reviewedAt,
}: {
  readingId: string;
  existingNote?: string | null;
  reviewedAt?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(existingNote ?? "");
  const [done, setDone] = useState(!!reviewedAt);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      const r = await markGlucoseReviewed(readingId, note);
      if (r.ok) { setDone(true); setOpen(false); setMsg(null); }
      else setMsg(r.error ?? "Failed.");
    });

  if (done && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-mint px-2.5 py-0.5 font-body text-[11px] font-bold text-primary-deep"
      >
        ✓ Reviewed
      </button>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-line bg-paper px-2.5 py-0.5 font-body text-[11px] font-bold text-ink-soft"
      >
        Add note
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 p-1">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Clinical note (optional)…"
        rows={2}
        className="rounded-[8px] border border-line bg-paper px-2 py-1.5 font-body text-[12px] text-ink outline-none"
      />
      {msg && <span className="font-body text-[11px] text-coral">{msg}</span>}
      <div className="flex gap-1.5">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-primary px-3 py-1 font-body text-[11px] font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Mark reviewed"}
        </button>
        <button onClick={() => setOpen(false)} className="font-body text-[11px] text-ink-soft">Cancel</button>
      </div>
    </div>
  );
}
