import { getTranslations } from "next-intl/server";
import { getPodDoctorName } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMyPlanFeatures } from "@/lib/plan";
import { Disclaimer } from "@/components/Disclaimer";
import { LogForm } from "./LogForm";
import { MealCard } from "./MealCard";
import { WeighInCard } from "./WeighInCard";
import { CgmCard } from "./CgmCard";

export const metadata = {
  title: "Log",
  description: "Log your glucose, meals, and weight.",
};

export default async function LogPage() {
  const t = await getTranslations("log");
  const supabase = createServerSupabase();

  const [doctorName, { data: cgmConn }, { features }] = await Promise.all([
    getPodDoctorName(),
    supabase
      .from("cgm_connections")
      .select("last_synced_at, error_message")
      .eq("active", true)
      .maybeSingle(),
    getMyPlanFeatures(),
  ]);

  const cgmStatus = cgmConn
    ? { connected: true as const, lastSyncedAt: cgmConn.last_synced_at, errorMessage: cgmConn.error_message }
    : { connected: false as const };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("title")}
      </h1>

      <LogForm doctorName={doctorName} />

      <WeighInCard />

      <MealCard />

      <CgmCard cgmEnabled={features.cgmSync} status={cgmStatus} />

      <Disclaimer />
    </div>
  );
}
