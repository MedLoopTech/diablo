"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

type Msg = { ai: boolean; text: string; escalated?: boolean };

export function CoachSheet({
  open,
  onClose,
  seed,
}: {
  open: boolean;
  onClose: () => void;
  seed?: string;
}) {
  const t = useTranslations("coach");
  const [msgs, setMsgs] = useState<Msg[]>([{ ai: true, text: t("intro") }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (open && seed && !seeded.current) {
      seeded.current = true;
      setInput(seed);
    }
  }, [open, seed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMsgs((m) => [...m, { ai: false, text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          ai: true,
          text: data.reply ?? t("error"),
          escalated: Boolean(data.escalated),
        },
      ]);
    } catch {
      setMsgs((m) => [...m, { ai: true, text: t("error") }]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 mx-auto flex max-w-md items-end bg-[rgba(12,51,43,0.4)]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[82%] w-full flex-col rounded-t-[28px] bg-paper p-[18px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-marigold text-white">
              ✦
            </div>
            <div>
              <div className="font-body text-[14px] font-bold text-ink">
                {t("title")}
              </div>
              {/* Persistent "not a doctor" label — SPEC safety rule 5. */}
              <div className="font-body text-[10.5px] text-ink-soft">
                {t("notDoctor")}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-card text-[14px] text-ink-soft"
          >
            ✕
          </button>
        </div>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-[13px] py-2.5 font-body text-[13px] leading-snug ${
                m.ai
                  ? m.escalated
                    ? "self-start border border-[#F1DDB4] bg-marigold-soft text-ink"
                    : "self-start border border-line bg-card text-ink"
                  : "self-end bg-primary text-white"
              }`}
            >
              {m.text}
            </div>
          ))}
          {busy && (
            <div className="self-start rounded-2xl border border-line bg-card px-[13px] py-2.5 font-body text-[13px] text-ink-soft">
              {t("thinking")}
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t("placeholder")}
            className="flex-1 rounded-full border border-line bg-card px-4 py-[11px] font-body text-[13px] text-ink outline-none"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="rounded-full bg-primary px-[18px] font-body text-[13px] font-bold text-white disabled:opacity-50"
          >
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
