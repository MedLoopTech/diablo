"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toPlainText } from "@/lib/chat-text";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { VoicePlayer } from "@/components/VoicePlayer";

type Sender = "patient" | "ai" | "doctor" | "nutritionist" | "coach";
type Msg = {
  id?: string;
  ai: boolean;
  text: string;
  escalated?: boolean;
  sender?: Sender;
  ts?: string;
  audioUrl?: string | null;
};

const SENDER_LABEL: Record<Sender, string> = {
  patient: "You",
  ai: "AI coach",
  doctor: "Doctor",
  nutritionist: "Nutritionist",
  coach: "Fitness coach",
};

function dateSep(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium" });
}

export function CoachSheet({ open, onClose, seed }: { open: boolean; onClose: () => void; seed?: string }) {
  const t = useTranslations("coach");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  // Load chat history on first open.
  const loadHistory = useCallback(async () => {
    if (historyLoaded) return;
    try {
      const res = await fetch("/api/ai/chat/history");
      const data = await res.json() as {
        messages: { id: string; sender: Sender; body: string; audio_path?: string | null; signedAudioUrl?: string | null; created_at: string }[];
      };
      const history: Msg[] = (data.messages ?? []).map((m) => ({
        id: m.id,
        ai: m.sender !== "patient",
        text: m.body,
        sender: m.sender,
        ts: m.created_at,
        audioUrl: m.audio_path ? m.signedAudioUrl ?? null : undefined,
      }));
      setMsgs(history.length ? history : [{ ai: true, text: t("intro") }]);
    } catch {
      setMsgs([{ ai: true, text: t("intro") }]);
    }
    setHistoryLoaded(true);
  }, [historyLoaded, t]);

  useEffect(() => {
    if (open) loadHistory();
  }, [open, loadHistory]);

  useEffect(() => {
    if (open && seed && !seeded.current && historyLoaded) {
      seeded.current = true;
      setInput(seed);
    }
  }, [open, seed, historyLoaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMsgs((m) => [...m, { ai: false, text, sender: "patient", ts: new Date().toISOString() }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("request failed");

      const isStream = res.headers.get("content-type")?.startsWith("text/plain");

      if (isStream && res.body) {
        // Add an empty AI bubble and fill it as chunks arrive.
        const tempId = `stream-${Date.now()}`;
        setMsgs((m) => [...m, { id: tempId, ai: true, text: "", sender: "ai", ts: new Date().toISOString() }]);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setMsgs((m) => m.map((msg) => msg.id === tempId ? { ...msg, text: full } : msg));
        }
      } else {
        const data = await res.json() as { reply?: string; escalated?: boolean };
        setMsgs((m) => [
          ...m,
          { ai: true, text: data.reply ?? t("error"), escalated: Boolean(data.escalated), sender: "ai", ts: new Date().toISOString() },
        ]);
      }
    } catch {
      setMsgs((m) => [...m, { ai: true, text: t("error"), sender: "ai" }]);
    } finally {
      setBusy(false);
    }
  };

  const onVoiceSent = (result: { reply?: string; escalated?: boolean; error?: string }) => {
    if (result.error) return; // recorder already shows the error inline
    // No local echo of the recording itself — it has no signed URL until the
    // next history reload. Just the confirmation, same as a routed text reply.
    setMsgs((m) => [
      ...m,
      {
        ai: true,
        text: result.reply ?? t("error"),
        escalated: Boolean(result.escalated),
        sender: "ai",
        ts: new Date().toISOString(),
      },
    ]);
  };

  if (!open) return null;

  // Build display list with date separators.
  const displayed: Array<Msg | { type: "sep"; label: string }> = [];
  let lastDate = "";
  for (const m of msgs) {
    if (m.ts) {
      const d = dateSep(m.ts);
      if (d !== lastDate) {
        displayed.push({ type: "sep", label: d });
        lastDate = d;
      }
    }
    displayed.push(m);
  }

  return (
    <div
      className="fixed inset-0 z-30 mx-auto flex max-w-md items-end bg-[rgba(12,51,43,0.4)]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[82%] w-full flex-col rounded-t-[28px] bg-paper p-[18px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-marigold text-white">✦</div>
            <div>
              <div className="font-body text-[14px] font-bold text-ink">{t("title")}</div>
              <div className="font-body text-[10.5px] text-ink-soft">{t("notDoctor")}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-card text-[14px] text-ink-soft">✕</button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {displayed.map((item, i) => {
            if ("type" in item) {
              return (
                <div key={`sep-${i}`} className="my-1 flex items-center gap-2">
                  <div className="flex-1 border-t border-line" />
                  <span className="font-body text-[10px] text-ink-soft">{item.label}</span>
                  <div className="flex-1 border-t border-line" />
                </div>
              );
            }
            const m = item as Msg;
            const isStaff = m.sender && m.sender !== "patient" && m.sender !== "ai";
            return (
              <div key={m.id ?? i} className="flex flex-col gap-0.5">
                {isStaff && (
                  <div className="self-start font-body text-[10px] font-semibold text-primary-deep ml-1">
                    {SENDER_LABEL[m.sender!]}
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-[13px] py-2.5 font-body text-[13px] leading-snug ${
                    m.ai
                      ? isStaff
                        ? "self-start border border-primary bg-mint text-ink"
                        : m.escalated
                          ? "self-start border border-[#F1DDB4] bg-marigold-soft text-ink"
                          : "self-start border border-line bg-card text-ink"
                      : "self-end bg-primary text-white"
                  }`}
                >
                  {m.audioUrl !== undefined ? (
                    <VoicePlayer url={m.audioUrl} light={!m.ai} />
                  ) : (
                    <span className="whitespace-pre-wrap">{toPlainText(m.text)}</span>
                  )}
                </div>
                {m.escalated && (
                  <div className="ml-1 mt-0.5 font-body text-[10.5px] text-ink-soft">
                    Flagged for your doctor · usually within 4 hours
                  </div>
                )}
              </div>
            );
          })}
          {busy && (
            <div className="self-start rounded-2xl border border-line bg-card px-[13px] py-2.5 font-body text-[13px] text-ink-soft">
              {t("thinking")}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <VoiceRecorder onSent={onVoiceSent} disabled={busy} />
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
