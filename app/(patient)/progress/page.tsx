export const dynamic = "force-dynamic";

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, Eyebrow } from "@/components/ui";
import { JourneyPath, FastingTrend } from "@/components/JourneyPath";
import { getProgressData } from "@/lib/progress";
import { getResources } from "@/lib/resources";
import { RESOURCE_LABELS, RESOURCE_EMOJI, type ResourceType } from "@/lib/resources-shared";

export const metadata = {
  title: "Progress",
  description: "Your 90-day journey path, estimated HbA1c, glucose trends, and resource library.",
};

const RESOURCE_TYPES: { key: ResourceType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "book", label: "Books" },
  { key: "research", label: "Research" },
  { key: "video", label: "Videos" },
  { key: "exercise_plan", label: "Exercise" },
  { key: "article", label: "Articles" },
  { key: "recipe", label: "Recipes" },
];

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const t = await getTranslations("progress");
  const activeType = (searchParams.type as ResourceType | undefined) ?? undefined;
  const [d, resources] = await Promise.all([getProgressData(), getResources(activeType)]);

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

      {/* Resource library */}
      <div>
        <Eyebrow className="mb-3">Resource library</Eyebrow>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {RESOURCE_TYPES.map((rt) => {
            const active = (rt.key === "all" && !activeType) || rt.key === activeType;
            return (
              <Link
                key={rt.key}
                href={rt.key === "all" ? "/progress" : `/progress?type=${rt.key}`}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 font-body text-[12.5px] font-semibold transition-colors ${
                  active
                    ? "bg-primary-deep text-white"
                    : "border border-line bg-card text-ink-soft"
                }`}
              >
                {rt.label}
              </Link>
            );
          })}
        </div>

        {resources.length === 0 ? (
          <Card className="mt-3">
            <p className="font-body text-[13.5px] text-ink-soft">
              No resources in this category yet — check back soon.
            </p>
          </Card>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {resources.map((r) => (
              <Card key={r.id} className="px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-mint text-[18px]">
                    {RESOURCE_EMOJI[r.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-[10.5px] font-semibold uppercase tracking-wider text-primary-deep">
                      {RESOURCE_LABELS[r.type]}
                    </div>
                    <div className="font-body text-[14px] font-bold text-ink leading-snug mt-0.5">
                      {r.title}
                    </div>
                    {r.description && (
                      <p className="mt-1 font-body text-[12.5px] leading-relaxed text-ink-soft">
                        {r.description}
                      </p>
                    )}
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-body text-[12.5px] font-bold text-primary-deep underline-offset-2 hover:underline"
                      >
                        Open →
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
