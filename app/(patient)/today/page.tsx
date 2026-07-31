import { getTranslations } from "next-intl/server";
import { Card, Eyebrow, Pill } from "@/components/ui";
import { GlucoseDial, type DialReading } from "@/components/GlucoseDial";
import { getCurrentProfile } from "@/lib/profile";
import {
  getTodaysReadings,
  getTodaysTasks,
  getPointsAndStreak,
  getMyMovementPlan,
} from "@/lib/data";
import { getMyMealPlan } from "@/lib/care";
import type { PatientMealPlan } from "@/lib/care";
import { CONTEXT_LABEL } from "@/lib/glucose";
import { THRESHOLDS } from "@/lib/thresholds";
import { dialFraction } from "@/lib/time";
import { Disclaimer } from "@/components/Disclaimer";
import { TaskList } from "./TaskList";
import { TodayCoach } from "./TodayCoach";

export const metadata = {
  title: "Today",
  description: "Your daily glucose horizon, tasks, and care pod nudge.",
};

export default async function TodayPage({
  searchParams,
}: {
  searchParams: { denied?: string };
}) {
  const t = await getTranslations("today");
  const te = await getTranslations("errors");

  const [profile, readings, tasks, stats, movementPlan, mealPlan] = await Promise.all([
    getCurrentProfile(),
    getTodaysReadings(),
    getTodaysTasks(),
    getPointsAndStreak(),
    getMyMovementPlan(),
    getMyMealPlan(),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "friend";
  const dialReadings: DialReading[] = readings.map((r) => ({
    frac: dialFraction(r.taken_at),
    value: r.value_mgdl,
    label: CONTEXT_LABEL[r.context],
  }));

  const inRange = readings.filter((r) => r.value_mgdl < 180).length;
  const inRangePct =
    readings.length > 0 ? Math.round((inRange / readings.length) * 100) : null;

  const latest = readings[readings.length - 1];
  const urgentReading = readings.find((r) => r.value_mgdl >= THRESHOLDS.URGENT_HIGH || r.value_mgdl <= THRESHOLDS.URGENT_LOW);
  const nudge =
    latest && latest.value_mgdl >= 180
      ? t("nudgeHigh", { value: latest.value_mgdl })
      : t("nudgeDefault");

  return (
    <div className="flex flex-col gap-4">
      {searchParams.denied && (
        <div className="rounded-[12px] bg-coral-soft px-3 py-2 font-body text-[12.5px] text-coral">
          {te("notAuthorized")}
        </div>
      )}

      {urgentReading && (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3">
          <div className="font-body text-[13.5px] font-bold text-red-700">
            {urgentReading.value_mgdl >= 250
              ? `⚠️ High glucose: ${urgentReading.value_mgdl} mg/dL — your doctor has been notified.`
              : `⚠️ Low glucose: ${urgentReading.value_mgdl} mg/dL — your doctor has been notified.`}
          </div>
          <p className="mt-0.5 font-body text-[12.5px] text-red-600">
            {urgentReading.value_mgdl >= 250
              ? "Avoid sugary foods. Rest, hydrate, and check in again in 30 min."
              : "Have fast-acting sugar (juice, glucose tablets) immediately. Sit down and rest."}
          </p>
        </div>
      )}

      <div>
        <Eyebrow className="text-primary">
          {t("dayOf", { day: stats.cohortDay })} · 🔥 {stats.streak} ·{" "}
          {stats.points} pts
        </Eyebrow>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight text-ink">
          {t("greeting", { name: firstName })}
        </h1>
      </div>

      <Card className="pb-2">
        <div className="flex items-center justify-between">
          <Eyebrow>{t("glucoseHorizon")}</Eyebrow>
          {inRangePct !== null && (
            <Pill className="bg-mint text-primary-deep">
              {inRangePct}% in range
            </Pill>
          )}
        </div>
        <div className="mt-2">
          <GlucoseDial readings={dialReadings} />
        </div>
      </Card>

      <TodayCoach nudge={nudge} />

      {tasks.length > 0 ? (
        <TaskList tasks={tasks} mealPlan={mealPlan} movementPlan={movementPlan} />
      ) : stats.cohortDay <= 1 && stats.points === 0 ? (
        <Card>
          <p className="font-body text-[13px] font-semibold text-ink">
            Not yet enrolled in a cohort
          </p>
          <p className="mt-1 font-body text-[12.5px] leading-relaxed text-ink-soft">
            Your admin will add you to a cohort and care pod. Check back soon — your 90-day journey starts the moment you&apos;re enrolled.
          </p>
        </Card>
      ) : (
        <Card>
          <p className="font-body text-[13px] text-ink-soft">{t("emptyBody")}</p>
        </Card>
      )}


      <Disclaimer />
    </div>
  );
}
