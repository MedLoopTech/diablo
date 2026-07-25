"use client";

import { useState } from "react";
import type { Medication, MedicationPlan } from "@/lib/staff";

export function MedicationEditor({
  patientId,
  plan,
}: {
  patientId: string;
  plan: MedicationPlan | null;
}) {
  const [meds, setMeds] = useState<Medication[]>(
    plan?.medications?.length ? plan.medications : [{ name: "", dose: "", schedule: "" }]
  );
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setRow = (i: number, key: keyof Medication, v: string) =>
    setMeds((m) => m.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  const addRow = () => setMeds((m) => [...m, { name: "", dose: "", schedule: "" }]);
  const removeRow = (i: number) => setMeds((m) => m.filter((_, j) => j !== i));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const medications = meds.filter((m) => m.name.trim());
    try {
      const res = await fetch("/api/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, medications, notes }),
      });
      const data = await res.json();
      setMsg(
        res.ok
          ? { ok: true, text: "Saved. Audit trail recorded." }
          : { ok: false, text: data.error ?? `Failed (${res.status})` }
      );
    } catch {
      setMsg({ ok: false, text: "Network error." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="eyebrow">Medication plan</h3>
        <span className="font-body text-[11px] text-ink-soft">Doctor only · audited</span>
      </div>

      <div className="flex flex-col gap-2">
        {meds.map((m, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={m.name}
              onChange={(e) => setRow(i, "name", e.target.value)}
              placeholder="Medication"
              className="flex-1 rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
            />
            <input
              value={m.dose}
              onChange={(e) => setRow(i, "dose", e.target.value)}
              placeholder="Dose"
              className="w-24 rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
            />
            <input
              value={m.schedule}
              onChange={(e) => setRow(i, "schedule", e.target.value)}
              placeholder="Schedule"
              className="w-32 rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
            />
            <button
              onClick={() => removeRow(i)}
              className="rounded-[10px] border border-line bg-paper px-3 font-body text-[13px] text-ink-soft"
              aria-label="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button onClick={addRow} className="mt-2 font-body text-[12.5px] font-bold text-primary-deep">
        + Add medication
      </button>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (rationale, review date)…"
        rows={2}
        className="mt-3 w-full rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save plan"}
        </button>
        {msg && (
          <span className={`font-body text-[12.5px] ${msg.ok ? "text-primary-deep" : "text-coral"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
