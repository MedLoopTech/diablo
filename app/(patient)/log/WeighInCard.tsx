"use client";

import { useState, useTransition } from "react";
import { Card, Eyebrow } from "@/components/ui";
import { logWeight } from "../actions";

export function WeighInCard() {
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    const n = Number(val);
    if (!val || !Number.isFinite(n)) return;
    setMsg(null);
    startTransition(async () => {
      const res = await logWeight(n);
      setMsg(res.ok ? { ok: true, text: "Weigh-in saved." } : { ok: false, text: res.error ?? "Failed." });
      if (res.ok) setVal("");
    });
  };

  return (
    <Card>
      <Eyebrow>Weight</Eyebrow>
      <div className="mt-2.5 flex items-center gap-2">
        <input
          value={val}
          onChange={(e) => { setVal(e.target.value.replace(/[^\d.]/g, "").slice(0, 5)); setMsg(null); }}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="81.4"
          inputMode="decimal"
          aria-label="Weight in kilograms"
          className="w-[110px] rounded-[14px] border-none bg-paper px-3.5 py-2 font-display text-[28px] font-semibold text-ink outline-none"
        />
        <span className="font-body text-[12px] text-ink-soft">kg</span>
        <div className="flex-1" />
        <button
          onClick={save}
          disabled={pending || !val}
          className="rounded-full bg-primary px-[18px] py-2.5 font-body text-[13px] font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Log weight"}
        </button>
      </div>
      <p className="mt-2 font-body text-[11.5px] text-ink-soft">
        Weigh yourself at the same time each week — first thing in the morning is most consistent.
      </p>
      {msg && (
        <div className={`mt-2 rounded-[12px] px-3 py-2 font-body text-[12.5px] ${msg.ok ? "bg-mint text-primary-deep" : "bg-coral-soft text-coral"}`}>
          {msg.text}
        </div>
      )}
    </Card>
  );
}
