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
    <div className="flex min-h-dvh bg-paper">
      {/* Sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-line bg-card">
        <div className="px-5 pb-4 pt-5">
          <span className="font-display text-xl font-semibold text-ink">
            Loop<span className="text-marigold">/90</span>
          </span>
          <div className="mt-0.5 font-body text-[11px] uppercase tracking-wider text-ink-soft">
            Care Portal
          </div>
        </div>

        <StaffNav role={profile?.role ?? ""} />

        {/* User identity at bottom of sidebar */}
        <div className="mt-auto border-t border-line px-5 py-4">
          <div className="font-body text-[13px] font-semibold text-ink">
            {profile?.full_name ?? "—"}
          </div>
          <div className="mt-0.5 font-body text-[11px] capitalize text-ink-soft">
            {profile?.role ?? ""}
          </div>
        </div>
      </aside>

      {/* Right column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Slim top bar — only actions, no nav */}
        <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-line bg-card px-6">
          {/* Mobile logo (sidebar hidden on small screens) */}
          <span className="font-display text-[15px] font-semibold text-ink md:hidden">
            Loop<span className="text-marigold">/90</span>
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell items={items} unread={unread} tone="light" />
            <SignOutButton label="Sign out" />
          </div>
        </header>

        <main className="flex-1 overflow-auto px-6 py-7 md:px-10 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
