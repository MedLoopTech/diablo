"use client";

import { useLocale } from "next-intl";

export function LocaleToggle() {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  const switchTo = (next: string) => {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  return (
    <button
      onClick={() => switchTo(isUrdu ? "en" : "ur")}
      aria-label={isUrdu ? "Switch to English" : "اردو میں تبدیل کریں"}
      className="flex h-[28px] items-center rounded-full border border-line bg-card px-3 font-body text-[11px] font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
    >
      {isUrdu ? "EN" : "اردو"}
    </button>
  );
}
