"use client";

import { useState, useTransition } from "react";
import { setConsultMeetUrl } from "./actions";

export function MeetUrlForm({ windowId, currentUrl }: { windowId: string; currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      const r = await setConsultMeetUrl(windowId, url);
      setMsg(r.ok ? "Saved." : r.error ?? "Failed.");
    });

  return (
    <div className="mt-2 flex items-center gap-2 border-t border-line pt-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Meet link (https://meet.google.com/…)"
        className="flex-1 rounded-[8px] border border-line bg-paper px-2.5 py-1.5 font-body text-[12px] text-ink outline-none"
      />
      <button
        onClick={save}
        disabled={pending}
        className="rounded-full bg-primary px-3 py-1.5 font-body text-[11.5px] font-bold text-white disabled:opacity-50"
      >
        {pending ? "…" : "Set link"}
      </button>
      {msg && <span className="font-body text-[11.5px] text-primary-deep">{msg}</span>}
    </div>
  );
}
