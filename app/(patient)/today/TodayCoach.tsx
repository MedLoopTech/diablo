"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CoachSheet } from "@/components/CoachSheet";

/** The marigold nudge card (from the prototype) that opens the coach sheet. */
export function TodayCoach({ nudge }: { nudge: string }) {
  const t = useTranslations("today");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-card border border-[#F1DDB4] bg-marigold-soft p-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-xl bg-marigold text-[16px] text-white">
            ✦
          </div>
          <div>
            <div className="font-body text-[13.5px] leading-relaxed text-ink">
              {nudge}
            </div>
            <div className="mt-1.5 font-body text-[12px] font-bold text-primary-deep">
              {t("askCoach")}
            </div>
          </div>
        </div>
      </button>

      <CoachSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
