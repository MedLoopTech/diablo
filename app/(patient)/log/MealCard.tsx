"use client";

import { useState, useRef } from "react";
import { Card, Eyebrow, Pill } from "@/components/ui";

type Analysis = {
  dish_guess: string;
  est_carbs_g: number;
  glycemic_load: "low" | "med" | "high";
  feedback_text: string;
  healthier_swap: string;
};

const GL_CLASS: Record<Analysis["glycemic_load"], string> = {
  low: "bg-mint text-primary-deep",
  med: "bg-marigold-soft text-[#9A6A14]",
  high: "bg-coral-soft text-coral",
};

export function MealCard() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setNote(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("meal_type", "lunch");
      const res = await fetch("/api/ai/meal", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setNote("Couldn't analyze that photo — try again with better lighting.");
        return;
      }
      setAnalysis(data.analysis);
      if (data.lowConfidence) {
        setNote(`Not fully sure this is "${data.analysis.dish_guess}" — tap to retake if that's wrong.`);
      }
    } catch {
      setNote("Upload failed — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <Eyebrow>Meal · photo</Eyebrow>
        <Pill className="bg-marigold-soft text-[#9A6A14]">AI analyzed</Pill>
      </div>

      {analysis && (
        <div className="mt-3 flex gap-3">
          <div className="flex h-[84px] w-[84px] flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-marigold-soft text-[30px]">
            🍛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-body text-[14px] font-bold text-ink">
                {analysis.dish_guess}
              </span>
              <Pill className={GL_CLASS[analysis.glycemic_load]}>
                {analysis.glycemic_load} GL
              </Pill>
            </div>
            <div className="mt-1 font-body text-[12px] leading-relaxed text-ink-soft">
              ~{analysis.est_carbs_g}g carbs · {analysis.feedback_text} {analysis.healthier_swap}
            </div>
          </div>
        </div>
      )}

      {note && (
        <div className="mt-2 rounded-[12px] bg-marigold-soft px-3 py-2 font-body text-[12.5px] text-[#9A6A14]">
          {note}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPhoto}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="mt-3 w-full rounded-[14px] border border-dashed border-line bg-paper px-3 py-3 font-body text-[13px] font-bold text-primary-deep disabled:opacity-50"
      >
        {busy ? "Analyzing…" : analysis ? "📷 Snap another meal" : "📷 Snap your meal"}
      </button>
    </Card>
  );
}
