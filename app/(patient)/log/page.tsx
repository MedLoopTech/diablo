import { getTranslations } from "next-intl/server";
import { getPodDoctorName } from "@/lib/data";
import { Disclaimer } from "@/components/Disclaimer";
import { LogForm } from "./LogForm";
import { MealCard } from "./MealCard";
import { WeighInCard } from "./WeighInCard";

export const metadata = {
  title: "Log",
  description: "Log your glucose, meals, and weight.",
};

export default async function LogPage() {
  const t = await getTranslations("log");
  const doctorName = await getPodDoctorName();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("title")}
      </h1>

      <LogForm doctorName={doctorName} />

      <WeighInCard />

      <MealCard />

      <Disclaimer />
    </div>
  );
}
