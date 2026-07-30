import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/profile";
import { getNotifications } from "@/lib/notifications";
import { SignOutButton } from "@/components/SignOutButton";
import { NotificationBell } from "@/components/NotificationBell";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("staff");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const { items, unread } = await getNotifications();

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl font-semibold text-ink">
              Loop<span className="text-marigold">/90</span>
            </span>
            <span className="eyebrow">{t("title")}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/staff" className="font-body text-[12.5px] font-semibold text-ink-soft hover:text-ink">
              Queue
            </a>
            <a href="/staff/consults" className="font-body text-[12.5px] font-semibold text-ink-soft hover:text-ink">
              Consults
            </a>
            {profile?.role === "admin" && (
              <a href="/staff/admin" className="font-body text-[12.5px] font-semibold text-ink-soft hover:text-ink">
                Admin
              </a>
            )}
            {profile && (
              <span className="font-body text-[12.5px] text-ink-soft">
                {t("roleLabel", { role: profile.role })}
              </span>
            )}
            <NotificationBell items={items} unread={unread} tone="light" />
            <SignOutButton label={tc("signOut")} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
