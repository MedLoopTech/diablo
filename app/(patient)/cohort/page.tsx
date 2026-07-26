import { getTranslations } from "next-intl/server";
import { Card, Eyebrow, Pill } from "@/components/ui";
import { getCohortSummary, getLeaderboard, getGroupChallenge, getFeed } from "@/lib/cohort";
import { CohortFeed } from "./CohortFeed";

export const metadata = {
  title: "Community",
  description: "Your cohort leaderboard, group challenge, and shared feed.",
};

export default async function CohortPage() {
  const t = await getTranslations("cohort");
  const summary = await getCohortSummary();

  if (!summary.cohortId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">{t("title")}</h1>
        <Card>
          <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">{t("emptyBody")}</p>
        </Card>
      </div>
    );
  }

  const [leaderboard, challenge, feed] = await Promise.all([
    getLeaderboard(),
    getGroupChallenge(),
    getFeed(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow className="text-primary">
          {summary.name ?? "Your cohort"} · {summary.memberCount} members
        </Eyebrow>
        <h1 className="mt-0.5 font-display text-2xl font-semibold text-ink">This week</h1>
      </div>

      {challenge && (
        <Card className="bg-gradient-to-br from-mint to-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-body text-[14px] font-bold text-ink">Cohort momentum 🏔️</div>
              <div className="mt-0.5 font-body text-[12px] text-ink-soft">
                {challenge.total} of {challenge.goal} points together this week
              </div>
            </div>
            <div className="font-display text-[26px] font-semibold text-primary-deep">{challenge.pct}%</div>
          </div>
          <div className="mt-3 h-2.5 rounded-full border border-line bg-white">
            <div className="h-full rounded-full bg-primary" style={{ width: `${challenge.pct}%` }} />
          </div>
        </Card>
      )}

      <div>
        <Eyebrow>Leaderboard</Eyebrow>
        <div className="mt-2 flex flex-col gap-2">
          {leaderboard.map((row, i) => (
            <Card
              key={row.patient_id}
              className={`px-3.5 py-2.5 ${row.you ? "border border-[#F1DDB4] bg-marigold-soft" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-[22px] font-display text-[18px] font-semibold ${i === 0 ? "text-marigold" : "text-ink-soft"}`}>
                  {i + 1}
                </span>
                <span className={`flex-1 font-body text-[14px] text-ink ${row.you ? "font-bold" : "font-semibold"}`}>
                  {row.you ? "You" : row.full_name ?? "Member"}
                </span>
                <span className="font-body text-[11.5px] text-ink-soft">🔥 {row.streak}d</span>
                <span className="font-body text-[13px] font-bold text-primary-deep">{row.points}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Eyebrow>Cohort feed</Eyebrow>
          <Pill className="bg-mint text-primary-deep">live</Pill>
        </div>
        <CohortFeed posts={feed} cohortId={summary.cohortId} />
      </div>
    </div>
  );
}
