"use client";

import { useState, useTransition } from "react";
import { LAB_PRESETS, presetFor, type LabResult } from "@/lib/labs-shared";
import { addLabResult, updateLabResult, deleteLabResult } from "./lab-actions";

const FLAG_CLASS: Record<LabResult["flag"], string> = {
  low: "bg-marigold-soft text-[#9A6A14]",
  high: "bg-coral/10 text-coral",
  normal: "bg-mint text-primary-deep",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function LabResults({
  patientId,
  results,
  canEdit,
}: {
  patientId: string;
  results: LabResult[];
  canEdit: boolean;
}) {
  const [analyte, setAnalyte] = useState(LAB_PRESETS[0].analyte);
  const [value, setValue] = useState("");
  const [takenOn, setTakenOn] = useState(todayStr());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editTakenOn, setEditTakenOn] = useState(todayStr());
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const preset = presetFor(analyte) ?? LAB_PRESETS[0];

  const add = () => {
    const v = Number(value);
    if (!Number.isFinite(v)) {
      setError("Enter a numeric value.");
      return;
    }
    start(async () => {
      setError("");
      try {
        await addLabResult({
          patientId,
          analyte: preset.analyte,
          label: preset.label,
          value: v,
          unit: preset.unit,
          refLow: preset.ref_low,
          refHigh: preset.ref_high,
          takenOn,
        });
        setValue("");
        setTakenOn(todayStr());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save. Please try again.");
      }
    });
  };

  const startEdit = (r: LabResult) => {
    setEditingId(r.id);
    setEditValue(String(r.value));
    setEditTakenOn(r.taken_on);
  };

  const saveEdit = (r: LabResult) => {
    const v = Number(editValue);
    if (!Number.isFinite(v)) {
      setError("Enter a numeric value.");
      return;
    }
    start(async () => {
      setError("");
      try {
        await updateLabResult({
          id: r.id,
          patientId,
          value: v,
          refLow: r.ref_low,
          refHigh: r.ref_high,
          takenOn: editTakenOn,
        });
        setEditingId(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save. Please try again.");
      }
    });
  };

  return (
    <section>
      <h2 className="eyebrow mb-3">Lab results</h2>

      {canEdit && (
        <div className="mb-3 flex flex-wrap items-end gap-2 rounded-card border border-line bg-card p-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-[10.5px] uppercase tracking-wide text-ink-soft">Panel</span>
            <select
              value={analyte}
              onChange={(e) => setAnalyte(e.target.value)}
              className="rounded-lg border border-line bg-paper px-2 py-1.5 font-body text-[13px] text-ink"
            >
              {LAB_PRESETS.map((p) => (
                <option key={p.analyte} value={p.analyte}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-[10.5px] uppercase tracking-wide text-ink-soft">
              Value ({preset.unit})
            </span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
              placeholder="0.0"
              className="w-24 rounded-lg border border-line bg-paper px-2 py-1.5 font-body text-[13px] text-ink"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-[10.5px] uppercase tracking-wide text-ink-soft">Taken on</span>
            <input
              type="date"
              value={takenOn}
              onChange={(e) => setTakenOn(e.target.value)}
              className="rounded-lg border border-line bg-paper px-2 py-1.5 font-body text-[13px] text-ink"
            />
          </label>
          <button
            onClick={add}
            disabled={pending || !value.trim()}
            className="rounded-lg bg-primary px-3 py-1.5 font-body text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Add"}
          </button>
        </div>
      )}
      {error && <p className="mb-2 font-body text-[13px] text-red">{error}</p>}

      {results.length === 0 ? (
        <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
          No lab results recorded.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((r) => (
            <div key={r.id} className="rounded-card border border-line bg-card px-3.5 py-2.5">
              {editingId === r.id ? (
                <div className="flex flex-wrap items-end gap-2">
                  <span className="font-body text-[13px] font-semibold text-ink">{r.label}</span>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    inputMode="decimal"
                    className="w-20 rounded-lg border border-line bg-paper px-2 py-1 font-body text-[13px] text-ink"
                  />
                  <span className="font-body text-[12px] text-ink-soft">{r.unit}</span>
                  <input
                    type="date"
                    value={editTakenOn}
                    onChange={(e) => setEditTakenOn(e.target.value)}
                    className="rounded-lg border border-line bg-paper px-2 py-1 font-body text-[12px] text-ink"
                  />
                  <button
                    onClick={() => saveEdit(r)}
                    disabled={pending}
                    className="rounded-lg bg-primary px-2.5 py-1 font-body text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="font-body text-[12px] text-ink-soft hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-body text-[13px] font-semibold text-ink">{r.label}</div>
                    <div className="font-body text-[11.5px] text-ink-soft">{r.taken_on}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 font-body text-[11px] font-bold ${FLAG_CLASS[r.flag]}`}>
                    {r.value} {r.unit}
                  </span>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => startEdit(r)}
                        className="font-body text-[12px] font-semibold text-ink-soft hover:text-ink"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => start(() => deleteLabResult(r.id, patientId))}
                        disabled={pending}
                        aria-label={`Delete ${r.label}`}
                        className="px-1 font-body text-ink-soft hover:text-red disabled:opacity-50"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
