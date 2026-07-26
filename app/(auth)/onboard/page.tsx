"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "./actions";

export default function OnboardPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    if (!name.trim()) { setError("Your name is required."); return; }
    start(async () => {
      const r = await completeOnboarding(name, phone);
      if (r && !r.ok) setError(r.error ?? "Something went wrong.");
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-2 font-display text-[13px] font-semibold uppercase tracking-widest text-primary">
          Sehat/90
        </div>
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink">
          Welcome — let's get you set up
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
              onChange={(e) => { setName(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
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
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="+92 300 1234567"
              className="rounded-[12px] border border-line bg-card px-4 py-3.5 font-body text-[15px] font-normal text-ink outline-none focus:border-primary"
            />
          </label>

          {error && (
            <p className="rounded-[10px] bg-red-50 px-3 py-2 font-body text-[12.5px] text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={pending || !name.trim()}
            className="mt-2 rounded-full bg-primary py-4 font-body text-[15px] font-bold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Continue →"}
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
