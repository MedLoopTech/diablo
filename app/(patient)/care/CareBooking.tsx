"use client";

import { useState, useTransition } from "react";
import { Card, Eyebrow, Pill } from "@/components/ui";
import type { ConsultSlot } from "@/lib/care";
import { bookSlot } from "./actions";

export function CareBooking({ slots }: { slots: ConsultSlot[] }) {
  const [booked, setBooked] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const book = (s: ConsultSlot) => {
    setError(null);
    startTransition(async () => {
      const res = await bookSlot(s.windowId, s.time, reason);
      if (!res.ok) {
        setError(res.error ?? "Could not book.");
        return;
      }
      setBooked(`${s.windowId}|${s.time}`);
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <Eyebrow>Consult windows</Eyebrow>
        <Pill className="bg-mint text-primary-deep">bookable</Pill>
      </div>
      <p className="mt-2 font-body text-[12.5px] leading-relaxed text-ink-soft">
        AI triage answers routine questions instantly — book a slot when it&apos;s
        medication, symptoms, or judgment.
      </p>

      {slots.length === 0 ? (
        <p className="mt-3 font-body text-[13px] text-ink-soft">
          No open slots right now. Your pod opens windows through the day.
        </p>
      ) : (
        <>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="mt-3 w-full rounded-[12px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {slots.map((s) => {
              const key = `${s.windowId}|${s.time}`;
              const isBooked = booked === key;
              return (
                <button
                  key={key}
                  onClick={() => book(s)}
                  disabled={pending || Boolean(booked)}
                  className={`rounded-full px-4 py-2 font-body text-[13px] font-bold disabled:opacity-50 ${
                    isBooked
                      ? "bg-primary text-white"
                      : "border border-line bg-paper text-ink"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && (
        <div className="mt-3 rounded-[12px] bg-coral-soft px-3 py-2 font-body text-[12.5px] text-coral">
          {error}
        </div>
      )}
      {booked && (
        <div className="mt-3 rounded-[12px] bg-mint px-3 py-2.5 font-body text-[12.5px] text-primary-deep">
          ✓ Booked. Your last 3 days of readings and meals are attached to the visit automatically.
        </div>
      )}
    </Card>
  );
}
