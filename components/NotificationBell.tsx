"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Notification } from "@/lib/notifications";
import { markAllRead } from "@/app/notifications-actions";

export function NotificationBell({
  items,
  unread,
  tone = "dark",
}: {
  items: Notification[];
  unread: number;
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      startTransition(async () => {
        await markAllRead();
        router.refresh();
      });
    }
  };

  const go = (link: string | null) => {
    setOpen(false);
    if (link) router.push(link);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label={`Notifications (${unread} unread)`}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full ${tone === "dark" ? "text-ink" : "bg-card text-ink"}`}
      >
        <span className="text-[17px]">🔔</span>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral px-1 font-body text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 max-w-[86vw] overflow-hidden rounded-card border border-line bg-card shadow-lg">
            <div className="border-b border-line px-4 py-2.5 font-body text-[12px] font-bold uppercase tracking-wide text-ink-soft">
              Notifications
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-center font-body text-[13px] text-ink-soft">
                  Nothing yet.
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => go(n.link)}
                    className={`flex w-full flex-col items-start gap-0.5 border-b border-line px-4 py-3 text-left last:border-0 ${n.read_at ? "" : "bg-mint/40"}`}
                  >
                    <span className="font-body text-[13px] font-bold text-ink">{n.title}</span>
                    {n.body && <span className="font-body text-[12px] text-ink-soft">{n.body}</span>}
                    <span className="font-body text-[10.5px] text-ink-soft">
                      {new Date(n.created_at).toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
