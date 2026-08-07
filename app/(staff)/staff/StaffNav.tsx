"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { isAdminRole, isSuperAdminRole } from "@/lib/roles";

const ADMIN_SUBTABS = [
  { id: "cohorts",    label: "Cohorts" },
  { id: "staff",      label: "Staff" },
  { id: "patients",   label: "Patients" },
  { id: "resources",  label: "Resources" },
  { id: "plans",      label: "Plans",      superAdminOnly: true },
  { id: "templates",  label: "Templates",  superAdminOnly: true },
  { id: "automation", label: "Automation", superAdminOnly: true },
  { id: "referrals",  label: "Referrals",  superAdminOnly: true },
  { id: "settings",   label: "Settings",   superAdminOnly: true },
];

const STAFF_NAV = [
  { href: "/staff",                 label: "Dashboard",     exact: true },
  { href: "/staff/prescriptions",   label: "Prescriptions" },
  { href: "/staff/consults",        label: "Consults" },
  { href: "/staff/escalations",     label: "Escalations" },
  { href: "/staff/announcements",   label: "Announcements" },
  { href: "/staff/referrals",       label: "Referrals" },
  { href: "/staff/weekly-review",   label: "Weekly Review", roles: ["doctor", "admin", "super_admin"] },
];

export function StaffNav({ role }: { role: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "cohorts";
  const onAdmin = pathname.startsWith("/staff/admin");

  const linkCls = (active: boolean) =>
    `block rounded-[10px] px-3 py-2 font-body text-[13px] font-medium transition-colors ${
      active ? "bg-primary font-semibold text-white" : "text-ink-soft hover:bg-paper hover:text-ink"
    }`;

  if (isAdminRole(role)) {
    const isSuper = isSuperAdminRole(role);
    const subtabs = ADMIN_SUBTABS.filter((sub) => isSuper || !sub.superAdminOnly);
    return (
      <nav className="flex flex-col gap-0.5 overflow-y-auto px-3 py-2">
        <Link href="/staff/performance" className={linkCls(pathname.startsWith("/staff/performance"))}>
          Performance
        </Link>
        {isSuper && (
          <Link href="/staff/payouts" className={linkCls(pathname.startsWith("/staff/payouts"))}>
            Payouts
          </Link>
        )}
        <Link href="/staff/announcements" className={linkCls(pathname.startsWith("/staff/announcements"))}>
          Announcements
        </Link>

        {onAdmin ? (
          <>
            <div className="px-3 py-2 font-body text-[13px] font-semibold text-ink">
              Admin
            </div>
            <div className="ml-2 flex flex-col gap-0.5 border-l border-line pl-2">
              {subtabs.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/staff/admin?tab=${sub.id}`}
                  className={linkCls(activeTab === sub.id)}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <Link href="/staff/admin" className={linkCls(false)}>
            Admin
          </Link>
        )}
      </nav>
    );
  }

  const items = STAFF_NAV.filter((item) => {
    if (item.href === "/staff/prescriptions") return ["doctor", "nutritionist", "coach"].includes(role);
    if ((item as { roles?: string[] }).roles) return (item as { roles?: string[] }).roles!.includes(role);
    return true;
  });

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {items.map((item) => {
        const active = (item as { exact?: boolean }).exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={linkCls(active)}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
