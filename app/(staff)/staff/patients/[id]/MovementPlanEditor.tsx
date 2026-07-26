"use client";

import { useState } from "react";
import type { MovementExercise, MovementPlan } from "@/lib/staff";

const CATEGORIES = ["cardio", "strength", "yoga", "balance", "breathing", "mobility"];

const PRESETS: MovementExercise[] = [
  { name: "Brisk walk", category: "cardio", duration_min: 30, sets: null, reps: null, notes: "After breakfast or lunch" },
  { name: "Bodyweight squats", category: "strength", duration_min: null, sets: 3, reps: "15", notes: null },
  { name: "Chair yoga flow", category: "yoga", duration_min: 20, sets: null, reps: null, notes: "Gentle — suitable for beginners" },
  { name: "Heel raises", category: "balance", duration_min: null, sets: 3, reps: "20", notes: "Hold onto chair if needed" },
  { name: "Deep breathing", category: "breathing", duration_min: 5, sets: null, reps: null, notes: "4-7-8 pattern, before bed" },
];

const EMPTY: MovementExercise = { name: "", category: "cardio", duration_min: null, sets: null, reps: null, notes: null };

const field = "rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none";

export function MovementPlanEditor({ patientId, plan }: { patientId: string; plan: MovementPlan | null }) {
  const [rows, setRows] = useState<MovementExercise[]>(
    plan?.exercises?.length ? plan.exercises : [{ ...EMPTY }]
  );
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setRow = <K extends keyof MovementExercise>(i: number, key: K, v: string) =>
    setRows((r) =>
      r.map((row, j) =>
        j === i
          ? {
              ...row,
              [key]:
                key === "duration_min" || key === "sets"
                  ? v === "" ? null : Number(v)
                  : v === "" ? null : v,
            }
          : row
      )
    );

  const addPreset = (preset: MovementExercise) => setRows((r) => [...r, { ...preset }]);
  const addRow = () => setRows((r) => [...r, { ...EMPTY }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const exercises = rows.filter((r) => r.name.trim());
    try {
      const res = await fetch("/api/movement-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, exercises, notes }),
      });
      const data = await res.json();
      setMsg(res.ok ? { ok: true, text: "Saved. Audit trail recorded." } : { ok: false, text: data.error ?? `Failed (${res.status})` });
    } catch {
      setMsg({ ok: false, text: "Network error." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="eyebrow">Movement plan</h3>
        <span className="font-body text-[11px] text-ink-soft">Coach only · audited</span>
      </div>

      {/* Quick presets */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="font-body text-[11px] text-ink-soft self-center">Quick add:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => addPreset(p)}
            className="rounded-full border border-line bg-paper px-2.5 py-1 font-body text-[11.5px] text-ink hover:border-primary hover:text-primary-deep"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((ex, i) => (
          <div key={i} className="rounded-[10px] border border-line bg-paper p-3">
            <div className="flex gap-2">
              <input
                value={ex.name}
                onChange={(e) => setRow(i, "name", e.target.value)}
                placeholder="Exercise name"
                className={`${field} flex-1`}
              />
              <select
                value={ex.category}
                onChange={(e) => setRow(i, "category", e.target.value)}
                className={`${field} w-28`}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => removeRow(i)} className="px-2 font-body text-[13px] text-ink-soft hover:text-coral" aria-label="Remove">✕</button>
            </div>
            <div className="mt-2 flex gap-2">
              <label className="flex flex-col gap-0.5">
                <span className="font-body text-[10px] text-ink-soft">Duration (min)</span>
                <input
                  type="number"
                  min="1"
                  value={ex.duration_min ?? ""}
                  onChange={(e) => setRow(i, "duration_min", e.target.value)}
                  placeholder="—"
                  className={`${field} w-24`}
                />
              </label>
              <label className="flex flex-col gap-0.5">
                <span className="font-body text-[10px] text-ink-soft">Sets</span>
                <input
                  type="number"
                  min="1"
                  value={ex.sets ?? ""}
                  onChange={(e) => setRow(i, "sets", e.target.value)}
                  placeholder="—"
                  className={`${field} w-20`}
                />
              </label>
              <label className="flex flex-col gap-0.5">
                <span className="font-body text-[10px] text-ink-soft">Reps / hold</span>
                <input
                  value={ex.reps ?? ""}
                  onChange={(e) => setRow(i, "reps", e.target.value)}
                  placeholder="e.g. 15 or 30 sec"
                  className={`${field} w-32`}
                />
              </label>
              <label className="flex flex-1 flex-col gap-0.5">
                <span className="font-body text-[10px] text-ink-soft">Notes</span>
                <input
                  value={ex.notes ?? ""}
                  onChange={(e) => setRow(i, "notes", e.target.value)}
                  placeholder="Modifications, cues…"
                  className={`${field} w-full`}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addRow} className="mt-2 font-body text-[12.5px] font-bold text-primary-deep">+ Add exercise</button>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="General guidance (intensity, rest days, hydration, safety cues)…"
        rows={2}
        className={`${field} mt-3 w-full`}
      />

      <div className="mt-3 flex items-center gap-3">
        <button onClick={save} disabled={busy} className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50">
          {busy ? "Saving…" : "Save plan"}
        </button>
        {msg && <span className={`font-body text-[12.5px] ${msg.ok ? "text-primary-deep" : "text-coral"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
