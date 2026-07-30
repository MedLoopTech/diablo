import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, Eyebrow, Pill } from "@/components/ui";
import { getCarePod, getOpenSlots, getMyMealPlan, getMyBookings, podEmoji, type PodMember } from "@/lib/care";
import { getCohortSummary, getLeaderboard, getGroupChallenge, getFeed } from "@/lib/cohort";
import { Disclaimer } from "@/components/Disclaimer";
import { CareBooking } from "./CareBooking";
import { CohortFeed } from "../cohort/CohortFeed";

export const metadata = {
  title: "Care",
  description: "Your care pod, appointments, meal plan, and cohort community.",
};

const ROLE_LABEL: Record<PodMember["role"], string> = {
  doctor: "Endocrinologist / GP",
  nutritionist: "Clinical nutritionist",
  coach: "Yoga & movement coach",
};

export default async function CarePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const t = await getTranslations("care");
  const isCommunity = searchParams.tab === "community";

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switcher */}
      <div className="flex gap-2">
        <Link
          href="/care"
          className={`flex-1 rounded-full py-2 text-center font-body text-[13px] font-semibold transition-colors ${
            !isCommunity
              ? "bg-primary-deep text-white"
              : "border border-line bg-card text-ink-soft"
          }`}
        >
          Care pod
        </Link>
        <Link
          href="/care?tab=community"
          className={`flex-1 rounded-full py-2 text-center font-body text-[13px] font-semibold transition-colors ${
            isCommunity
              ? "bg-primary-deep text-white"
              : "border border-line bg-card text-ink-soft"
          }`}
        >
          Community
        </Link>
      </div>

      {isCommunity ? <CommunityTab /> : <CarePodTab t={t} />}
    </div>
  );
}

async function CarePodTab({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const [pod, slots, mealPlan, myBookings] = await Promise.all([
    getCarePod(),
    getOpenSlots(),
    getMyMealPlan(),
    getMyBookings(),
  ]);

  return (
    <>
      {pod.length === 0 ? (
        <Card>
          <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">
            {t("emptyBody")}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {pod.map((m) => (
            <Card key={m.role} className="px-3.5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-mint text-[20px]">
                  {podEmoji(m.role)}
                </div>
                <div className="flex-1">
                  <div className="font-body text-[14px] font-bold text-ink">
                    {m.name ?? "To be assigned"}
                  </div>
                  <div className="font-body text-[11.5px] text-ink-soft">
                    {ROLE_LABEL[m.role]}
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {mealPlan && mealPlan.meals.length > 0 && (
        <Card>
          <Eyebrow>Your meal plan · from your nutritionist</Eyebrow>
          <div className="mt-2 flex flex-col gap-1.5">
            {mealPlan.meals.map((m, i) => (
              <div key={i} className="font-body text-[13px] text-ink">
                <span className="font-semibold capitalize">{m.meal}:</span> {m.description}
                {m.carb_target_g ? <span className="text-ink-soft"> · ~{m.carb_target_g}g carbs</span> : null}
              </div>
            ))}
          </div>
          {mealPlan.notes && (
            <p className="mt-2 font-body text-[12px] leading-relaxed text-ink-soft">{mealPlan.notes}</p>
          )}
        </Card>
      )}

      {pod.length > 0 && <CareBooking slots={slots} />}

      {myBookings.length > 0 && (
        <section>
          <Eyebrow className="mb-2">Your bookings</Eyebrow>
          <div className="flex flex-col gap-2">
            {myBookings.map((b) => (
              <Card key={b.id} className="px-3.5 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-body text-[13.5px] font-bold text-ink">
                      {b.date} · {b.slot_time.slice(0, 5)}
                    </div>
                    <div className="font-body text-[12px] text-ink-soft">
                      {b.staff_name ?? "Staff"} · {b.staff_role ?? ""}
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide ${
                    b.status === "booked"
                      ? "bg-mint text-primary-deep"
                      : "border border-line text-ink-soft"
                  }`}>
                    {b.status}
                  </span>
                </div>
                {b.meet_url && b.status === "booked" && (
                  <a
                    href={b.meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-body text-[12.5px] font-bold text-white w-fit"
                  >
                    📹 Join Google Meet
                  </a>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      <Disclaimer />
    </>
  );
}

async function CommunityTab() {
  const summary = await getCohortSummary();

  if (!summary.cohortId) {
    return (
      <Card>
        <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">
          Leaderboard, group challenge, and the cohort feed open once your cohort starts.
        </p>
      </Card>
    );
  }

  const [leaderboard, challenge, feed] = await Promise.all([
    getLeaderboard(),
    getGroupChallenge(),
    getFeed(),
  ]);

  return (
    <>
      <Eyebrow className="text-primary">
        {summary.name ?? "Your cohort"} · {summary.memberCount} members
      </Eyebrow>

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
    </>
  );
}
