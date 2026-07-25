import { getTranslations } from "next-intl/server";
import { Card, Eyebrow } from "@/components/ui";
import { JourneyPath, FastingTrend } from "@/components/JourneyPath";
import { getProgressData } from "@/lib/progress";

export default async function ProgressPage() {
  const t = await getTranslations("progress");
  const d = await getProgressData();

  const weightDelta =
    d.weightKg != null && d.baselineWeightKg != null
      ? Math.round((d.weightKg - d.baselineWeightKg) * 10) / 10
      : null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">{t("title")}</h1>

      <Card>
        <Eyebrow>Your 90-day path</Eyebrow>
        <div className="mt-2.5">
          <JourneyPath day={d.cohortDay} />
        </div>
      </Card>

      <div className="flex gap-3">
        <Card className="flex-1">
          <Eyebrow>HbA1c</Eyebrow>
          <div className="mt-1.5 font-display text-[30px] font-semibold text-ink">
            {d.estHba1c ?? "—"}
            <span className="text-[14px] text-ink-soft">%</span>
          </div>
          <div className="mt-0.5 font-body text-[11.5px] text-primary-deep">
            {d.estHba1c != null ? "est." : "log readings to estimate"}
            {d.baselineHba1c != null && ` · was ${d.baselineHba1c}% at start`}
          </div>
        </Card>
        <Card className="flex-1">
          <Eyebrow>Weight</Eyebrow>
          <div className="mt-1.5 font-display text-[30px] font-semibold text-ink">
            {weightDelta != null ? (weightDelta <= 0 ? weightDelta : `+${weightDelta}`) : "—"}
            <span className="text-[14px] text-ink-soft">kg</span>
          </div>
          <div className="mt-0.5 font-body text-[11.5px] text-primary-deep">
            {d.baselineWeightKg != null && d.weightKg != null
              ? `${d.baselineWeightKg} → ${d.weightKg} kg`
              : "no weigh-ins yet"}
          </div>
        </Card>
      </div>

      <Card>
        <Eyebrow>Fasting glucose · 30 days</Eyebrow>
        {d.fastingTrend.length >= 2 ? (
          <>
            <FastingTrend points={d.fastingTrend} />
            <div className="font-body text-[12.5px] leading-relaxed text-ink-soft">
              {d.avgFasting7d != null && `7-day average fasting: ${d.avgFasting7d} mg/dL. `}
              {d.timeInRangePct != null && `${d.timeInRangePct}% of readings in range.`}
            </div>
          </>
        ) : (
          <p className="mt-2 font-body text-[12.5px] text-ink-soft">
            Log a few fasting readings and your trend will appear here.
          </p>
        )}
      </Card>

      <Card className="border border-[#F1DDB4] bg-marigold-soft">
        <p className="font-body text-[13px] leading-relaxed text-ink">
          <span className="font-bold">On track for remission criteria.</span> If HbA1c
          holds below 6.5% without glucose-lowering meds for 3 months post-challenge,
          that&apos;s clinical remission.
        </p>
      </Card>
    </div>
  );
}
