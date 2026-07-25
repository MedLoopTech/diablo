import { useTranslations } from "next-intl";

/**
 * Persistent medical disclaimer — SPEC safety rule 5: all medical content
 * shows this component.
 */
export function Disclaimer() {
  const t = useTranslations("common");
  return (
    <div className="rounded-card border-none bg-primary-deep p-4 font-body text-[13px] leading-relaxed text-[#DCEDE4]">
      {t("disclaimer")}
    </div>
  );
}
