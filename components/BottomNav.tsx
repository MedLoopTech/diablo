"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const TABS = [
  { href: "/today", key: "today", icon: "☀" },
  { href: "/log", key: "log", icon: "＋" },
  { href: "/care", key: "care", icon: "♥" },
  { href: "/progress", key: "progress", icon: "↗" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-[78px] w-full max-w-md border-t border-line bg-card px-2 pb-[18px] pt-2">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center gap-[3px]"
          >
            <div
              className={`flex h-[34px] w-[34px] items-center justify-center rounded-xl text-[15px] ${
                active ? "bg-primary-deep text-white" : "text-ink-soft"
              }`}
            >
              {tab.icon}
            </div>
            <span
              className={`font-body text-[10px] ${
                active ? "font-bold text-primary-deep" : "font-medium text-ink-soft"
              }`}
            >
              {t(tab.key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
