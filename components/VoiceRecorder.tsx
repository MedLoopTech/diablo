"use client";

import { useRef, useState } from "react";
import { MAX_RECORDING_SECONDS } from "@/lib/voice-notes-shared";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

function pickMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}

type SendResult = { reply?: string; escalated?: boolean; error?: string };

/**
 * Records from the mic and uploads straight to /api/voice-note — the audio
 * bytes never touch AI-adjacent code; the route that receives them doesn't
 * import the AI provider or triage module at all.
 */
export function VoiceRecorder({
  onSent,
  disabled,
}: {
  onSent: (result: SendResult) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = async () => {
    setError("");
    const mimeType = pickMimeType();
    if (!mimeType) {
      setError("Voice notes are not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => upload(mimeType);
      recorderRef.current = recorder;

      recorder.start();
      setRecording(true);

      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setSeconds(elapsed);
        if (elapsed >= MAX_RECORDING_SECONDS) recorder.stop();
      }, 1000);
    } catch {
      setError("Could not access the microphone. Check your browser permissions.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const upload = async (mimeType: string) => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
    setSeconds(0);

    const blob = new Blob(chunksRef.current, { type: mimeType });
    if (blob.size < 800) return; // accidental tap

    setBusy(true);
    try {
      const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
      const form = new FormData();
      form.set("file", blob, `voice.${ext}`);
      const res = await fetch("/api/voice-note", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not send that voice message. Please try again.");
        onSent({ error: body.error });
      } else {
        onSent({ reply: body.reply, escalated: body.escalated });
      }
    } catch {
      setError("Could not send that voice message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <button
          type="button"
          onClick={start}
          disabled={disabled || busy}
          aria-label="Record a voice message"
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-line bg-card text-[16px] disabled:opacity-50"
        >
          🎤
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          aria-label="Stop recording and send"
          className="flex h-[42px] shrink-0 items-center gap-2 rounded-full bg-coral px-3 font-body text-[13px] font-semibold text-white"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          {MAX_RECORDING_SECONDS - seconds}s
        </button>
      )}
      {error && <p className="font-body text-[11px] text-red">{error}</p>}
    </div>
  );
}
