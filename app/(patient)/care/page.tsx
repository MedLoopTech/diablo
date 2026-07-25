import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui";

export default async function CarePage() {
  const t = await getTranslations("care");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("title")}
      </h1>
      <Card>
        <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">
          {t("emptyBody")}
        </p>
      </Card>
      <div className="rounded-card bg-primary-deep p-4 font-body text-[13px] leading-relaxed text-[#DCEDE4]">
        <span className="font-bold text-white">
          {t("medicationSafety").split(".")[0]}.
        </span>{" "}
        {t("medicationSafety").split(".").slice(1).join(".").trim()}
      </div>
    </div>
  );
}
