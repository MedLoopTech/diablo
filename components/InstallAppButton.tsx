"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own flag — not in the standard lib.dom types.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Chrome/Edge/Android fire beforeinstallprompt when install criteria are
 * met (manifest + icons + a registered service worker); we capture it and
 * replay it on tap instead of the browser's own mini-infobar. iOS Safari
 * never fires this event at all — there's no programmatic install there,
 * so we show instructions for the manual Share → Add to Home Screen flow.
 */
export function InstallAppButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandalone()) return; // already installed — nothing to offer

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (isIos()) {
      setHidden(false);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;

  const handleClick = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") setHidden(true);
      setInstallEvent(null);
      return;
    }
    // iOS: no programmatic prompt exists — show the manual steps instead.
    setShowIosHelp(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Install Loop/90 as an app"
        title="Install Loop/90 as an app"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-[15px] text-ink-soft hover:text-ink"
      >
        <span aria-hidden="true">⬇</span>
      </button>

      {showIosHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(12,51,43,0.4)] sm:items-center"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-[24px] bg-paper p-5 sm:rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-body text-[14px] font-bold text-ink">Add Loop/90 to your Home Screen</div>
            <ol className="mt-3 flex flex-col gap-2 font-body text-[13px] leading-relaxed text-ink-soft">
              <li>1. Tap the Share button <span aria-hidden="true">⬆</span> in Safari&apos;s toolbar.</li>
              <li>2. Scroll down and tap <span className="font-semibold text-ink">Add to Home Screen</span>.</li>
              <li>3. Tap <span className="font-semibold text-ink">Add</span> — Loop/90 opens like any other app, full-screen.</li>
            </ol>
            <button
              onClick={() => setShowIosHelp(false)}
              className="mt-4 w-full rounded-full bg-primary px-4 py-2 font-body text-[13px] font-bold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
