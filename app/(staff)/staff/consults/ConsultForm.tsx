"use client";

import { useState, useTransition } from "react";
import { createConsultWindow } from "./actions";

export function ConsultForm() {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("12:00");
  const [end, setEnd] = useState("13:00");
  const [mins, setMins] = useState(10);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!date) return;
    setMsg(null);
    startTransition(async () => {
      const res = await createConsultWindow(date, `${start}:00`, `${end}:00`, mins);
      setMsg(res.ok ? "Window opened." : res.error ?? "Failed.");
    });
  };

  const field = "rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none";

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <h3 className="eyebrow mb-3">Open a consult window</h3>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">
          Start
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">
          End
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">
          Slot (min)
          <input type="number" value={mins} min={5} step={5} onChange={(e) => setMins(Number(e.target.value))} className={`${field} w-20`} />
        </label>
        <button
          onClick={submit}
          disabled={pending || !date}
          className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50"
        >
          {pending ? "Opening…" : "Open window"}
        </button>
      </div>
      {msg && <p className="mt-2 font-body text-[12.5px] text-primary-deep">{msg}</p>}
    </div>
  );
}
