"use client";

import { useState, useTransition } from "react";
import { saveProfile, saveMedicalHistory, skipMedicalHistory, type PreExistingMed } from "./actions";

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

export default function OnboardPage() {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState("");
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [pending1, start1] = useTransition();

  // Step 2 state
  const [diabetesType, setDiabetesType] = useState("");
  const [diagnosisYear, setDiagnosisYear] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [comorbidities, setComorbidities] = useState<string[]>([]);
  const [meds, setMeds] = useState<PreExistingMed[]>([]);
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [pending2, start2] = useTransition();

  const submitStep1 = () => {
    if (!name.trim()) { setStep1Error("Your name is required."); return; }
    start1(async () => {
      const r = await saveProfile(name, phone, refCode.trim().toUpperCase() || undefined);
      if (r && !r.ok) setStep1Error(r.error ?? "Something went wrong.");
      else setStep(2);
    });
  };

  const addAllergy = () => {
    const tag = allergyInput.trim();
    if (tag && !allergies.includes(tag)) setAllergies((a) => [...a, tag]);
    setAllergyInput("");
  };

  const toggleComorbidity = (c: string) =>
    setComorbidities((cs) => cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]);

  const addMed = () => setMeds((m) => [...m, { name: "", dose: "", frequency: "" }]);
  const updateMed = (i: number, field: keyof PreExistingMed, val: string) =>
    setMeds((ms) => ms.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  const removeMed = (i: number) => setMeds((ms) => ms.filter((_, idx) => idx !== i));

  const submitStep2 = () => {
    const validMeds = meds.filter((m) => m.name.trim());
    start2(async () => {
      const r = await saveMedicalHistory({
        diabetesType: diabetesType || undefined,
        diagnosisYear: diagnosisYear ? parseInt(diagnosisYear, 10) : undefined,
        allergies,
        comorbidities,
        preExistingMeds: validMeds,
      });
      if (r && !r.ok) setStep2Error(r.error ?? "Something went wrong.");
    });
  };

  const doSkip = () => {
    start2(async () => { await skipMedicalHistory(); });
  };

  if (step === 1) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm">
          <div className="mb-2 font-display text-[13px] font-semibold uppercase tracking-widest text-primary">
            Loop<span className="text-marigold">/90</span>
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink">
            Welcome — let&apos;s get you set up
          </h1>
          <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">
            Your care team and cohort will see this name. Takes 10 seconds.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 font-body text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
              Full name *
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setStep1Error(null); }}
                onKeyDown={(e) => e.key === "Enter" && submitStep1()}
                placeholder="Fatima Malik"
                autoFocus
                className="rounded-[12px] border border-line bg-card px-4 py-3.5 font-body text-[15px] font-normal text-ink outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-body text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
              Phone (optional)
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="rounded-[12px] border border-line bg-card px-4 py-3.5 font-body text-[15px] font-normal text-ink outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-body text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
              Referral code (optional)
              <input
                type="text"
                value={refCode}
                onChange={(e) => { setRefCode(e.target.value); setStep1Error(null); }}
                placeholder="e.g. DR-AYESHA-7X2"
                className="rounded-[12px] border border-line bg-card px-4 py-3.5 font-body text-[15px] font-normal text-ink outline-none focus:border-primary"
              />
            </label>

            {step1Error && (
              <p className="rounded-[10px] bg-red-50 px-3 py-2 font-body text-[12.5px] text-red-600">
                {step1Error}
              </p>
            )}

            <button
              onClick={submitStep1}
              disabled={pending1 || !name.trim()}
              className="mt-2 rounded-full bg-primary py-4 font-body text-[15px] font-bold text-white disabled:opacity-50"
            >
              {pending1 ? "Saving…" : "Continue →"}
            </button>
          </div>

          <p className="mt-6 font-body text-[12px] leading-relaxed text-ink-soft">
            By continuing you agree this platform is for health support only — not a replacement
            for medical care. AI suggestions are not clinical advice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-paper px-6 py-10">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-1 font-display text-[12px] font-semibold uppercase tracking-widest text-ink-soft">
          Step 2 of 2
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink">
          Your medical background
        </h1>
        <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-soft">
          Helps your care team and AI coach give you relevant guidance. All fields optional.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          {/* Diabetes type */}
          <label className="flex flex-col gap-1.5 font-body text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
            Diabetes type
            <select
              value={diabetesType}
              onChange={(e) => setDiabetesType(e.target.value)}
              className="rounded-[12px] border border-line bg-card px-4 py-3.5 font-body text-[15px] font-normal text-ink outline-none focus:border-primary"
            >
              <option value="">Select…</option>
              <option value="type2">Type 2</option>
              <option value="type1">Type 1</option>
              <option value="prediabetes">Pre-diabetes</option>
              <option value="gestational">Gestational</option>
              <option value="other">Other</option>
            </select>
          </label>

          {/* Year diagnosed */}
          <label className="flex flex-col gap-1.5 font-body text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
            Year diagnosed
            <input
              type="number"
              value={diagnosisYear}
              onChange={(e) => setDiagnosisYear(e.target.value)}
              min={1950}
              max={new Date().getFullYear()}
              placeholder="e.g. 2018"
              className="rounded-[12px] border border-line bg-card px-4 py-3.5 font-body text-[15px] font-normal text-ink outline-none focus:border-primary"
            />
          </label>

          {/* Allergies */}
          <div className="flex flex-col gap-1.5">
            <span className="font-body text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
              Allergies
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                placeholder="e.g. Penicillin, Sulfa"
                className="flex-1 rounded-[12px] border border-line bg-card px-4 py-3 font-body text-[14px] text-ink outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addAllergy}
                className="rounded-[12px] border border-primary px-4 py-3 font-body text-[13px] font-semibold text-primary"
              >
                Add
              </button>
            </div>
            {allergies.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {allergies.map((a) => (
                  <span key={a} className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-body text-[12px] font-semibold text-red-600">
                    {a}
                    <button type="button" onClick={() => setAllergies((as) => as.filter((x) => x !== a))} className="ml-0.5 text-red-400 hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comorbidities */}
          <div className="flex flex-col gap-1.5">
            <span className="font-body text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
              Other conditions
            </span>
            <div className="flex flex-wrap gap-2">
              {COMORBIDITY_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleComorbidity(c)}
                  className={`rounded-full border px-3 py-1.5 font-body text-[12.5px] font-semibold transition-colors ${
                    comorbidities.includes(c)
                      ? "border-primary bg-mint text-primary-deep"
                      : "border-line bg-card text-ink-soft"
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
              <span className="font-body text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
                Current medications
              </span>
              <button
                type="button"
                onClick={addMed}
                className="font-body text-[12px] font-semibold text-primary"
              >
                + Add
              </button>
            </div>
            {meds.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => updateMed(i, "name", e.target.value)}
                  placeholder="Name"
                  className="flex-1 rounded-[12px] border border-line bg-card px-3 py-2.5 font-body text-[13px] text-ink outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={m.dose ?? ""}
                  onChange={(e) => updateMed(i, "dose", e.target.value)}
                  placeholder="Dose"
                  className="w-20 rounded-[12px] border border-line bg-card px-3 py-2.5 font-body text-[13px] text-ink outline-none focus:border-primary"
                />
                <button type="button" onClick={() => removeMed(i)} className="px-1 font-body text-[18px] text-ink-soft hover:text-red-500">×</button>
              </div>
            ))}
          </div>

          {/* Consent */}
          <div className="rounded-[12px] border border-line bg-card p-3.5">
            <p className="font-body text-[12.5px] leading-relaxed text-ink-soft">
              🔒 Your health data may be processed by AI systems to provide personalised coaching. Your doctor and care team can view this information. Data is stored securely and never sold.
            </p>
          </div>

          {step2Error && (
            <p className="rounded-[10px] bg-red-50 px-3 py-2 font-body text-[12.5px] text-red-600">
              {step2Error}
            </p>
          )}

          <button
            onClick={submitStep2}
            disabled={pending2}
            className="rounded-full bg-primary py-4 font-body text-[15px] font-bold text-white disabled:opacity-50"
          >
            {pending2 ? "Saving…" : "Save & get started →"}
          </button>

          <button
            onClick={doSkip}
            disabled={pending2}
            className="pb-2 font-body text-[13px] text-ink-soft underline underline-offset-2 disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
