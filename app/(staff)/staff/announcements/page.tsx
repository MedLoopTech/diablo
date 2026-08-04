import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { getStaffCohorts, getCohortAnnouncements } from "@/lib/announcements";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: { cohort?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const cohorts = await getStaffCohorts();
  if (cohorts.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Announcements</h1>
        <Card>
          <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">
            You&apos;re not assigned to a care pod yet, so there&apos;s no cohort to post to.
          </p>
        </Card>
      </div>
    );
  }

  const activeCohortId = cohorts.some((c) => c.id === searchParams.cohort)
    ? (searchParams.cohort as string)
    : cohorts[0].id;

  const announcements = await getCohortAnnouncements(activeCohortId);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Announcements</h1>
      <p className="mb-6 font-body text-sm text-ink-soft">
        Post a workshop, group walk, or schedule change to your cohort. These appear on the Today
        screen of everyone in it, below their tasks — they are not medical advice, and can&apos;t
        promise outcomes.
      </p>

      {cohorts.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {cohorts.map((c) => (
            <Link
              key={c.id}
              href={`/staff/announcements?cohort=${c.id}`}
              className={`rounded-full px-3.5 py-1.5 font-body text-[13px] font-semibold transition-colors ${
                c.id === activeCohortId
                  ? "bg-primary-deep text-white"
                  : "border border-line bg-card text-ink-soft"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <AnnouncementEditor cohortId={activeCohortId} announcements={announcements} />
    </div>
  );
}
