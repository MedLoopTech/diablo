import { getTranslations } from "next-intl/server";
import { Card, Eyebrow, Pill } from "@/components/ui";
import { getPodDoctorName } from "@/lib/data";
import { LogForm } from "./LogForm";

export default async function LogPage() {
  const t = await getTranslations("log");
  const doctorName = await getPodDoctorName();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("title")}
      </h1>

      <LogForm doctorName={doctorName} />

      <Card>
        <div className="flex items-center justify-between">
          <Eyebrow>Meal · photo</Eyebrow>
          <Pill className="bg-marigold-soft text-[#9A6A14]">Phase 2</Pill>
        </div>
        <p className="mt-2 font-body text-[12.5px] leading-relaxed text-ink-soft">
          {t("mealSoon")}
        </p>
      </Card>
    </div>
  );
}
