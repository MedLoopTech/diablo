"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Escalation } from "@/lib/staff";
import { updateEscalationStatus, replyToPatient } from "./actions";

const KIND_STYLE: Record<Escalation["kind"], { label: string; cls: string }> = {
  glucose_urgent: { label: "URGENT · glucose", cls: "bg-coral text-white" },
  patient_flagged: { label: "URGENT · flagged", cls: "bg-coral text-white" },
  ai_routed:      { label: "AI routed",        cls: "bg-marigold-soft text-[#9A6A14]" },
  glucose_routine:{ label: "Routine · glucose", cls: "bg-mint text-primary-deep" },
};

function summarize(e: Escalation): string {
  const p = e.payload ?? {};
  if (e.kind.startsWith("glucose") && typeof p.value_mgdl === "number") {
    return `${p.value_mgdl} mg/dL (${String(p.context ?? "reading")})`;
  }
  if (typeof p.message === "string") return `"${p.message.slice(0, 80)}"`;
  return "—";
}

function ReplyBox({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const send = () =>
    start(async () => {
      const r = await replyToPatient(patientId, text);
      setMsg(r.ok ? "Sent. Patient will see it in their chat." : r.error ?? "Failed.");
      if (r.ok) { setText(""); setOpen(false); }
    });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-line bg-paper px-3.5 py-1.5 font-body text-[12px] font-bold text-ink"
      >
        Reply to patient
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message to patient (appears in their AI coach chat)…"
        rows={2}
        className="rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
      />
      <div className="flex items-center gap-2">
        <button onClick={send} disabled={pending || !text.trim()} className="rounded-full bg-primary px-4 py-1.5 font-body text-[12px] font-bold text-white disabled:opacity-50">
          {pending ? "Sending…" : "Send"}
        </button>
        <button onClick={() => setOpen(false)} className="font-body text-[12px] text-ink-soft">Cancel</button>
        {msg && <span className="font-body text-[12px] text-primary-deep">{msg}</span>}
      </div>
    </div>
  );
}

export function EscalationQueue({ escalations }: { escalations: Escalation[] }) {
  const [pending, startTransition] = useTransition();

  const act = (id: string, status: "acknowledged" | "resolved") =>
    startTransition(() => { void updateEscalationStatus(id, status); });

  if (!escalations.length) {
    return (
      <div className="rounded-card border border-line bg-card p-6 text-center font-body text-[13px] text-ink-soft">
        No open escalations. 🎉
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {escalations.map((e) => {
        const style = KIND_STYLE[e.kind];
        return (
          <div key={e.id} className="rounded-card border border-line bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 font-body text-[11px] font-bold ${style.cls}`}>
                  {style.label}
                </span>
                {e.status === "acknowledged" && (
                  <span className="font-body text-[11px] text-ink-soft">acknowledged</span>
                )}
              </div>
              <span className="font-body text-[11px] text-ink-soft">
                {new Date(e.created_at).toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <Link href={`/staff/patients/${e.patient_id}`} className="font-body text-[14px] font-bold text-ink underline-offset-2 hover:underline">
                {e.patient_name ?? "Patient"}
              </Link>
              <span className="font-body text-[13px] text-ink-soft">{summarize(e)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {e.status === "open" && (
                <button onClick={() => act(e.id, "acknowledged")} disabled={pending} className="rounded-full border border-line bg-paper px-3.5 py-1.5 font-body text-[12px] font-bold text-ink disabled:opacity-50">
                  Acknowledge
                </button>
              )}
              <button onClick={() => act(e.id, "resolved")} disabled={pending} className="rounded-full bg-primary px-3.5 py-1.5 font-body text-[12px] font-bold text-white disabled:opacity-50">
                Resolve
              </button>
              <ReplyBox patientId={e.patient_id} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
