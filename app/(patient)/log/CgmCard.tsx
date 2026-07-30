"use client";

import { useState, useTransition } from "react";
import { Card, Eyebrow } from "@/components/ui";

type Props = {
  cgmEnabled: boolean;
  status:
    | { connected: false }
    | { connected: true; lastSyncedAt: string | null; errorMessage: string | null };
};

export function CgmCard({ cgmEnabled, status }: Props) {
  const [view, setView] = useState<"idle" | "form" | "working">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // ── Locked: not in this patient's plan ──────────────────────────────────────
  if (!cgmEnabled) {
    return (
      <div className="relative overflow-hidden rounded-card border border-[#EFA63C]/30 bg-gradient-to-br from-[#FBEED6] to-[#FDF6EC] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-marigold/20 text-[20px]">
            📡
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-body text-[13.5px] font-bold text-ink">
                CGM Auto-Sync
              </span>
              <span className="rounded-full bg-marigold px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-white">
                Premium
              </span>
            </div>
            <p className="mt-0.5 font-body text-[12px] leading-relaxed text-ink-soft">
              Connect your Freestyle Libre and readings sync automatically — no
              manual entry needed.
            </p>
          </div>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-[15px]">
            🔒
          </div>
        </div>
        <p className="mt-3 font-body text-[11.5px] font-semibold text-[#9A6A14]">
          Upgrade to Premium to unlock CGM auto-sync.
        </p>
      </div>
    );
  }

  // ── Connected ───────────────────────────────────────────────────────────────
  if (status.connected) {
    const lastSync = status.lastSyncedAt
      ? new Date(status.lastSyncedAt).toLocaleString("en-US", {
          timeZone: "Asia/Karachi",
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Not yet synced";

    return (
      <div className="rounded-card border border-[#EFA63C]/40 bg-gradient-to-br from-[#FBEED6] to-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eyebrow>Freestyle Libre</Eyebrow>
            <span className="rounded-full bg-marigold px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-white">
              Premium
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span className="font-body text-[11px] font-semibold text-primary-deep">Live</span>
          </div>
        </div>
        <p className="mt-1.5 font-body text-[12.5px] text-ink-soft">
          Last sync: {lastSync}
        </p>
        {status.errorMessage && (
          <p className="mt-1 font-body text-[12px] text-red-500">{status.errorMessage}</p>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              setView("working");
              startTransition(async () => {
                await fetch("/api/cgm/sync", { method: "POST" });
                window.location.reload();
              });
            }}
            disabled={view === "working"}
            className="rounded-full bg-primary px-4 py-1.5 font-body text-[12.5px] font-bold text-white disabled:opacity-50"
          >
            {view === "working" ? "Syncing…" : "Sync now"}
          </button>
          <button
            onClick={() => {
              startTransition(async () => {
                await fetch("/api/cgm/disconnect", { method: "DELETE" });
                window.location.reload();
              });
            }}
            className="rounded-full border border-line px-4 py-1.5 font-body text-[12.5px] font-semibold text-ink-soft"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // ── Connect form ────────────────────────────────────────────────────────────
  if (view === "form" || view === "working") {
    const submit = () => {
      if (!email.trim() || !password) { setError("Email and password required."); return; }
      setError(null);
      setView("working");
      startTransition(async () => {
        const res = await fetch("/api/cgm/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Connection failed."); setView("form"); return; }
        window.location.reload();
      });
    };

    return (
      <div className="rounded-card border border-[#EFA63C]/40 bg-gradient-to-br from-[#FBEED6] to-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eyebrow>Connect Freestyle Libre</Eyebrow>
          <span className="rounded-full bg-marigold px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-white">
            Premium
          </span>
        </div>
        <p className="mb-3 font-body text-[12px] leading-relaxed text-ink-soft">
          Enter your <strong>LibreView</strong> account credentials. Readings sync
          automatically — no more manual entry.
        </p>
        <div className="flex flex-col gap-2.5">
          <input
            type="email"
            placeholder="LibreView email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="rounded-[10px] border border-[#EFA63C]/40 bg-white px-3.5 py-2.5 font-body text-[14px] text-ink outline-none focus:border-marigold"
          />
          <input
            type="password"
            placeholder="LibreView password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="rounded-[10px] border border-[#EFA63C]/40 bg-white px-3.5 py-2.5 font-body text-[14px] text-ink outline-none focus:border-marigold"
          />
          {error && <p className="font-body text-[12px] text-red-500">{error}</p>}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={submit}
            disabled={view === "working"}
            className="flex-1 rounded-full bg-primary py-2.5 font-body text-[13px] font-bold text-white disabled:opacity-50"
          >
            {view === "working" ? "Connecting…" : "Connect"}
          </button>
          <button
            onClick={() => setView("idle")}
            className="rounded-full border border-line px-4 py-2.5 font-body text-[13px] text-ink-soft"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Idle: enabled but not connected ─────────────────────────────────────────
  return (
    <div className="rounded-card border border-[#EFA63C]/40 bg-gradient-to-br from-[#FBEED6] to-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-marigold/20 text-[20px]">
          📡
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-body text-[13.5px] font-bold text-ink">
              Connect Freestyle Libre
            </span>
            <span className="rounded-full bg-marigold px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-white">
              Premium
            </span>
          </div>
          <span className="font-body text-[11.5px] text-ink-soft">
            Auto-sync CGM readings — no manual entry
          </span>
        </div>
        <button
          onClick={() => setView("form")}
          className="flex-shrink-0 rounded-full bg-primary px-3.5 py-1.5 font-body text-[12px] font-bold text-white"
        >
          Connect
        </button>
      </div>
    </div>
  );
}
