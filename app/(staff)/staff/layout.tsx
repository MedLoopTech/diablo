import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/profile";
import { getNotifications } from "@/lib/notifications";
import { SignOutButton } from "@/components/SignOutButton";
import { NotificationBell } from "@/components/NotificationBell";
import { StaffNav } from "./StaffNav";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const { items, unread } = await getNotifications();

  return (
    <div className="flex h-dvh overflow-hidden bg-paper">
      {/* Sidebar — full viewport height, never scrolls */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-line bg-card">
        <div className="shrink-0 px-5 pb-4 pt-5">
          <span className="font-display text-xl font-semibold text-ink">
            Loop<span className="text-marigold">/90</span>
          </span>
          <div className="mt-0.5 font-body text-[11px] uppercase tracking-wider text-ink-soft">
            Care Portal
          </div>
        </div>

        <Suspense fallback={null}>
          <StaffNav role={profile?.role ?? ""} />
        </Suspense>

        {/* User identity — pinned at bottom, always visible */}
        <div className="mt-auto shrink-0 border-t border-line px-5 py-4">
          <div className="font-body text-[13px] font-semibold text-ink">
            {profile?.full_name ?? "—"}
          </div>
          <div className="mt-0.5 font-body text-[11px] capitalize text-ink-soft">
            {profile?.role ?? ""}
          </div>
        </div>
      </aside>

      {/* Right column — header fixed, only main scrolls */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-line bg-card px-6">
          <span className="font-display text-[15px] font-semibold text-ink md:hidden">
            Loop<span className="text-marigold">/90</span>
          </span>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell items={items} unread={unread} tone="light" />
            <SignOutButton label="Sign out" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-7 md:px-10 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
