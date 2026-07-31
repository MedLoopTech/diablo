"use client";

import { useState, useTransition } from "react";
import type { MedicalHistoryRow } from "@/lib/staff";
import { upsertMedicalHistory } from "./actions";

const COMORBIDITY_OPTIONS = [
  "Hypertension",
  "Thyroid disorder",
  "Kidney disease",
  "Heart disease",
  "PCOS",
  "Obesity",
  "Depression/Anxiety",
  "Other",
];

export function MedicalHistoryEditor({
  patientId,
  history,
}: {
  patientId: string;
  history: MedicalHistoryRow | null;
}) {
  const [diabetesType, setDiabetesType] = useState(history?.diabetes_type ?? "");
  const [diagnosisYear, setDiagnosisYear] = useState(
    history?.diagnosis_year ? String(history.diagnosis_year) : ""
  );
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>(history?.allergies ?? []);
  const [comorbidities, setComorbidities] = useState<string[]>(history?.comorbidities ?? []);
  const [meds, setMeds] = useState<{ name: string; dose?: string; frequency?: string }[]>(
    history?.pre_existing_meds ?? []
  );
  const [familyHistory, setFamilyHistory] = useState(history?.family_history ?? "");
  const [notes, setNotes] = useState(history?.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const addAllergy = () => {
    const tag = allergyInput.trim();
    if (tag && !allergies.includes(tag)) setAllergies((a) => [...a, tag]);
    setAllergyInput("");
  };

  const toggleComorbidity = (c: string) =>
    setComorbidities((cs) => cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]);

  const addMed = () => setMeds((m) => [...m, { name: "", dose: "", frequency: "" }]);
  const updateMed = (i: number, field: "name" | "dose" | "frequency", val: string) =>
    setMeds((ms) => ms.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  const removeMed = (i: number) => setMeds((ms) => ms.filter((_, idx) => idx !== i));

  const save = () => {
    setError(null);
    setSaved(false);
    start(async () => {
      const r = await upsertMedicalHistory(patientId, {
        diabetesType: diabetesType || null,
        diagnosisYear: diagnosisYear ? parseInt(diagnosisYear, 10) : null,
        allergies,
        comorbidities,
        preExistingMeds: meds.filter((m) => m.name.trim()),
        familyHistory: familyHistory.trim() || null,
        notes: notes.trim() || null,
      });
      if (r.ok) setSaved(true);
      else setError(r.error ?? "Failed to save.");
    });
  };

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <h3 className="eyebrow mb-4">Medical history</h3>

      <div className="flex flex-col gap-4">
        {/* Diabetes type + year */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 font-body text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
            Type
            <select
              value={diabetesType}
              onChange={(e) => setDiabetesType(e.target.value)}
              className="rounded-[10px] border border-line bg-paper px-3 py-2.5 font-body text-[13px] text-ink outline-none focus:border-primary"
            >
              <option value="">Unknown</option>
              <option value="type2">Type 2</option>
              <option value="type1">Type 1</option>
              <option value="prediabetes">Pre-diabetes</option>
              <option value="gestational">Gestational</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 font-body text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
            Year diagnosed
            <input
              type="number"
              value={diagnosisYear}
              onChange={(e) => setDiagnosisYear(e.target.value)}
              min={1950}
              max={new Date().getFullYear()}
              placeholder="e.g. 2018"
              className="rounded-[10px] border border-line bg-paper px-3 py-2.5 font-body text-[13px] text-ink outline-none focus:border-primary"
            />
          </label>
        </div>

        {/* Allergies */}
        <div className="flex flex-col gap-1.5">
          <span className="font-body text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
            Allergies
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
              placeholder="Type and press Add"
              className="flex-1 rounded-[10px] border border-line bg-paper px-3 py-2.5 font-body text-[13px] text-ink outline-none focus:border-primary"
            />
            <button type="button" onClick={addAllergy} className="rounded-[10px] border border-primary px-3 py-2.5 font-body text-[12px] font-semibold text-primary">
              Add
            </button>
          </div>
          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((a) => (
                <span key={a} className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-body text-[12px] font-semibold text-red-600">
                  {a}
                  <button type="button" onClick={() => setAllergies((as) => as.filter((x) => x !== a))} className="text-red-400 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comorbidities */}
        <div className="flex flex-col gap-1.5">
          <span className="font-body text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
            Comorbidities
          </span>
          <div className="flex flex-wrap gap-2">
            {COMORBIDITY_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleComorbidity(c)}
                className={`rounded-full border px-3 py-1 font-body text-[12px] font-semibold transition-colors ${
                  comorbidities.includes(c)
                    ? "border-primary bg-mint text-primary-deep"
                    : "border-line bg-paper text-ink-soft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-existing medications */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
              Pre-existing medications
            </span>
            <button type="button" onClick={addMed} className="font-body text-[12px] font-semibold text-primary">
              + Add
            </button>
          </div>
          {meds.length === 0 && (
            <p className="font-body text-[12.5px] text-ink-soft">None recorded.</p>
          )}
          {meds.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={m.name}
                onChange={(e) => updateMed(i, "name", e.target.value)}
                placeholder="Medication name"
                className="flex-1 rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={m.dose ?? ""}
                onChange={(e) => updateMed(i, "dose", e.target.value)}
                placeholder="Dose"
                className="w-24 rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={m.frequency ?? ""}
                onChange={(e) => updateMed(i, "frequency", e.target.value)}
                placeholder="Frequency"
                className="w-24 rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none focus:border-primary"
              />
              <button type="button" onClick={() => removeMed(i)} className="px-1 text-[18px] text-ink-soft hover:text-red-500">×</button>
            </div>
          ))}
        </div>

        {/* Family history */}
        <label className="flex flex-col gap-1 font-body text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
          Family history (optional)
          <textarea
            value={familyHistory}
            onChange={(e) => setFamilyHistory(e.target.value)}
            rows={2}
            placeholder="e.g. Father had T2D, maternal hypertension"
            className="resize-none rounded-[10px] border border-line bg-paper px-3 py-2.5 font-body text-[13px] text-ink outline-none focus:border-primary"
          />
        </label>

        {/* Clinical notes */}
        <label className="flex flex-col gap-1 font-body text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
          Clinical notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Additional notes for the care team"
            className="resize-none rounded-[10px] border border-line bg-paper px-3 py-2.5 font-body text-[13px] text-ink outline-none focus:border-primary"
          />
        </label>

        {error && (
          <p className="rounded-[10px] bg-red-50 px-3 py-2 font-body text-[12.5px] text-red-600">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-[10px] bg-mint px-3 py-2 font-body text-[12.5px] text-primary-deep">
            ✓ Medical history saved.
          </p>
        )}

        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-primary px-6 py-3 font-body text-[13.5px] font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save medical history"}
        </button>
      </div>
    </div>
  );
}
