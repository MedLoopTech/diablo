import { getTranslations } from "next-intl/server";
import { getPodDoctorName } from "@/lib/data";
import { LogForm } from "./LogForm";
import { MealCard } from "./MealCard";

export default async function LogPage() {
  const t = await getTranslations("log");
  const doctorName = await getPodDoctorName();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("title")}
      </h1>

      <LogForm doctorName={doctorName} />

      <MealCard />
    </div>
  );
}
