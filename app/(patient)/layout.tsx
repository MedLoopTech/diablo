import { BottomNav } from "@/components/BottomNav";
import { NotificationBell } from "@/components/NotificationBell";
import { PushSubscriber } from "@/components/PushSubscriber";
import { getNotifications } from "@/lib/notifications";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const notifications = await getNotifications();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-paper">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-paper/95 px-[18px] pb-2 pt-4 backdrop-blur-sm">
        <span className="font-display text-[15px] font-semibold text-primary-deep">
          Sehat/90
        </span>
        <NotificationBell
          items={notifications.items}
          unread={notifications.unread}
        />
      </header>
      <PushSubscriber />
      <main className="px-[18px] pb-[98px] pt-2">{children}</main>
      <BottomNav />
    </div>
  );
}
