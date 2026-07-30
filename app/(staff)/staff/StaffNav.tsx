"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; roles?: string[] };

const NAV: NavItem[] = [
  { href: "/staff",         label: "Dashboard" },
  { href: "/staff/consults", label: "Consults"  },
  { href: "/staff/admin",   label: "Admin",    roles: ["admin"] },
];

export function StaffNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {items.map((item) => {
        const active =
          item.href === "/staff"
            ? pathname === "/staff"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-[10px] px-3 py-2 font-body text-[13px] font-medium transition-colors ${
              active
                ? "bg-primary font-semibold text-white"
                : "text-ink-soft hover:bg-paper hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
