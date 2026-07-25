"use client";

import { useState, useTransition } from "react";
import { Card, Eyebrow } from "@/components/ui";
import { CONTEXT_OPTIONS, feedbackFor, type Feedback } from "@/lib/glucose";
import type { GlucoseContext } from "@/lib/types";
import { logGlucose } from "../actions";

const TONE_CLASS: Record<Feedback["tone"], string> = {
  green: "bg-mint text-primary-deep",
  amber: "bg-coral-soft text-coral",
  red: "bg-coral text-white",
};

export function LogForm({ doctorName }: { doctorName: string | null }) {
  const [val, setVal] = useState("");
  const [context, setContext] = useState<GlucoseContext>("fasting");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    const n = Number(val);
    if (!val || !Number.isFinite(n)) return;
    setError(null);
    startTransition(async () => {
      const res = await logGlucose(n, context);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setFeedback(feedbackFor(res.value, doctorName));
      setVal("");
    });
  };

  return (
    <Card>
      <Eyebrow>Blood glucose</Eyebrow>

      <div className="mt-2.5 flex items-center gap-2">
        <input
          value={val}
          onChange={(e) => {
            setVal(e.target.value.replace(/\D/g, "").slice(0, 3));
            setFeedback(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="120"
          inputMode="numeric"
          aria-label="Blood glucose in mg/dL"
          className="w-[110px] rounded-[14px] border-none bg-paper px-3.5 py-2 font-display text-[34px] font-semibold text-ink outline-none"
        />
        <span className="font-body text-[12px] text-ink-soft">mg/dL</span>
        <div className="flex-1" />
        <button
          onClick={save}
          disabled={pending || !val}
          className="rounded-full bg-primary px-[18px] py-2.5 font-body text-[13px] font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save reading"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {CONTEXT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setContext(opt.value)}
            className={`rounded-full px-3 py-1.5 font-body text-[12px] font-semibold ${
              context === opt.value
                ? "bg-primary-deep text-white"
                : "bg-paper text-ink-soft"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-2.5 rounded-[12px] bg-coral-soft px-3 py-2 font-body text-[12.5px] text-coral">
          {error}
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className={`mt-2.5 rounded-[12px] px-3 py-2.5 font-body text-[12.5px] leading-relaxed ${TONE_CLASS[feedback.tone]}`}
        >
          {feedback.text}
        </div>
      )}
    </Card>
  );
}
