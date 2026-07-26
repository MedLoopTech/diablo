"use client";

import { useState } from "react";
import type { MealItem, MealPlan } from "@/lib/staff";

const MEALS = ["breakfast", "lunch", "dinner", "snack"];

export function MealPlanEditor({ patientId, plan }: { patientId: string; plan: MealPlan | null }) {
  const [rows, setRows] = useState<MealItem[]>(
    plan?.meals?.length ? plan.meals : [{ meal: "breakfast", description: "", carb_target_g: null }]
  );
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setRow = (i: number, key: keyof MealItem, v: string) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: key === "carb_target_g" ? (v ? Number(v) : null) : v } : row)));
  const addRow = () => setRows((r) => [...r, { meal: "lunch", description: "", carb_target_g: null }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const meals = rows.filter((r) => r.description.trim());
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, meals, notes }),
      });
      const data = await res.json();
      setMsg(res.ok ? { ok: true, text: "Saved. Audit trail recorded." } : { ok: false, text: data.error ?? `Failed (${res.status})` });
    } catch {
      setMsg({ ok: false, text: "Network error." });
    } finally {
      setBusy(false);
    }
  };

  const field = "rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none";

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="eyebrow">Meal plan</h3>
        <span className="font-body text-[11px] text-ink-soft">Nutritionist only · audited</span>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((m, i) => (
          <div key={i} className="flex gap-2">
            <select value={m.meal} onChange={(e) => setRow(i, "meal", e.target.value)} className={`${field} w-32`}>
              {MEALS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <input value={m.description} onChange={(e) => setRow(i, "description", e.target.value)} placeholder="e.g. Daal + 1 roti + salad" className={`${field} flex-1`} />
            <input value={m.carb_target_g ?? ""} onChange={(e) => setRow(i, "carb_target_g", e.target.value.replace(/\D/g, ""))} placeholder="carbs g" inputMode="numeric" className={`${field} w-24`} />
            <button onClick={() => removeRow(i)} className={`${field} text-ink-soft`} aria-label="Remove">✕</button>
          </div>
        ))}
      </div>

      <button onClick={addRow} className="mt-2 font-body text-[12.5px] font-bold text-primary-deep">+ Add meal</button>

      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Guidance (portion sizes, swaps, hydration)…" rows={2} className={`${field} mt-3 w-full`} />

      <div className="mt-3 flex items-center gap-3">
        <button onClick={save} disabled={busy} className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50">
          {busy ? "Saving…" : "Save plan"}
        </button>
        {msg && <span className={`font-body text-[12.5px] ${msg.ok ? "text-primary-deep" : "text-coral"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
