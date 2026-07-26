"use client";

import { useState, useTransition } from "react";
import { replyToPatient } from "../../actions";

export function StaffReplyBox({ patientId }: { patientId: string }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const send = () =>
    start(async () => {
      const r = await replyToPatient(patientId, text);
      setMsg(r.ok ? "Sent. Patient will see it in their chat." : r.error ?? "Failed.");
      if (r.ok) setText("");
    });

  return (
    <section>
      <h2 className="eyebrow mb-3">Send message to patient</h2>
      <div className="rounded-card border border-line bg-card p-4 flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message appears in the patient's AI coach chat with your role label…"
          rows={3}
          className="rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={send}
            disabled={pending || !text.trim()}
            className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send message"}
          </button>
          {msg && <span className="font-body text-[12.5px] text-primary-deep">{msg}</span>}
        </div>
      </div>
    </section>
  );
}
