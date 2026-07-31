import { getWeeklyReviewData } from "@/lib/staff";
import { WeeklyReviewForm } from "./WeeklyReviewForm";

export const dynamic = "force-dynamic";

function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default async function WeeklyReviewPage() {
  // Use today in PKT (UTC+5) to find the correct Monday
  const nowPKT = new Date(Date.now() + 5 * 60 * 60 * 1000);
  const todayStr = nowPKT.toISOString().slice(0, 10);
  const weekStart = getMondayOfWeek(todayStr);

  const patients = await getWeeklyReviewData(weekStart);
  const doneCount = patients.filter((p) => p.existingReview !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Weekly Review</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          Week of {weekStart} · {doneCount}/{patients.length} signed off
        </p>
      </div>

      {patients.length === 0 ? (
        <div className="rounded-card border border-line bg-card p-6 font-body text-[13px] text-ink-soft">
          No patients in your pods yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {patients.map((p) => (
            <WeeklyReviewForm key={p.id} patient={p} weekStart={weekStart} />
          ))}
        </div>
      )}
    </div>
  );
}
