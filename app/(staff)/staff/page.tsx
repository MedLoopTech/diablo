export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { getOpenEscalations, getFlaggedReadings, getStaffAnalytics, getCoachAnalytics, getMyReferralCode } from "@/lib/staff";
import { EscalationQueue } from "./EscalationQueue";
import { CohortTrendChart } from "@/components/CohortTrendChart";
import { FlaggedByPatient } from "@/components/FlaggedByPatient";
import { ReferralShareButton } from "@/components/ReferralShareButton";

function Kpi({ label, value, sub, tone = "ink" }: { label: string; value: string; sub?: string; tone?: "ink" | "coral" | "primary" }) {
  const color = tone === "coral" ? "text-coral" : tone === "primary" ? "text-primary-deep" : "text-ink";
  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="eyebrow">{label}</div>
      <div className={`mt-1 font-display text-[26px] font-semibold ${color}`}>{value}</div>
      {sub && <div className="mt-0.5 font-body text-[11.5px] text-ink-soft">{sub}</div>}
    </div>
  );
}

async function CoachDashboard({ firstName }: { firstName: string }) {
  const a = await getCoachAnalytics();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome, {firstName}</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          {a.patientCount} patients · movement adherence {a.movementAdherencePct != null ? `${a.movementAdherencePct}%` : "—"} this week
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Patients" value={String(a.patientCount)} sub="in your pods" />
        <Kpi label="Movement adherence" value={a.movementAdherencePct != null ? `${a.movementAdherencePct}%` : "—"} sub="tasks done · 7d" tone="primary" />
        <Kpi label="Active streakers" value={String(a.patients.filter((p) => p.streak >= 3).length)} sub="3+ day streak" tone="primary" />
      </div>

      <section>
        <h2 className="eyebrow mb-3">Patient movement this week</h2>
        <div className="flex flex-col gap-2">
          {a.patients.length === 0 ? (
            <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No patients in your pods yet.</div>
          ) : (
            a.patients.map((p) => (
              <Link
                key={p.id}
                href={`/staff/patients/${p.id}`}
                className="flex items-center justify-between rounded-card border border-line bg-card p-3 hover:border-primary"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-body text-[14px] font-bold text-ink">{p.name ?? "Patient"}</div>
                  <div className="font-body text-[11.5px] text-ink-soft">
                    {p.movementDone}/{p.movementTotal} sessions · streak {p.streak}d
                  </div>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  {/* Progress bar */}
                  <div className="h-2 w-20 rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${p.movementPct}%` }}
                    />
                  </div>
                  <span className="font-body text-[12px] font-semibold text-ink w-9 text-right">{p.movementPct}%</span>
                  <div className={`h-2.5 w-2.5 rounded-full ${p.movementPct >= 80 ? "bg-primary" : p.movementPct >= 50 ? "bg-marigold" : "bg-coral"}`} />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default async function StaffHome() {
  const t = await getTranslations("staff");
  const profile = await getCurrentProfile();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  if (profile?.role === "coach") {
    return <CoachDashboard firstName={firstName} />;
  }

  const [a, escalations, flagged, myCode] = await Promise.all([
    getStaffAnalytics(),
    getOpenEscalations(),
    getFlaggedReadings(),
    getMyReferralCode(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{t("welcome", { name: firstName })}</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          {a.patientCount} patients · {a.openEscalations} open ({a.urgentCount} urgent) · {a.timeInRangePct ?? "—"}% cohort time-in-range
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Urgent now" value={String(a.urgentCount)} sub="need action" tone={a.urgentCount > 0 ? "coral" : "ink"} />
        <Kpi label="Open items" value={String(a.openEscalations)} sub="escalations" />
        <Kpi label="Avg fasting" value={a.avgFasting != null ? `${a.avgFasting}` : "—"} sub="mg/dL · 30d" tone="primary" />
        <Kpi label="Est. cohort HbA1c" value={a.estCohortHba1c != null ? `${a.estCohortHba1c}%` : "—"} sub="from mean glucose" tone="primary" />
        <Kpi label="Adherence" value={a.adherencePct != null ? `${a.adherencePct}%` : "—"} sub="tasks done · 7d" />
      </div>

      {/* Cohort trend */}
      <section>
        <h2 className="eyebrow mb-3">Cohort fasting glucose · 30 days</h2>
        <div className="rounded-card border border-line bg-card p-4">
          <CohortTrendChart data={a.cohortTrend} />
        </div>
      </section>

      {/* At-risk + action queue side by side on wide screens */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="eyebrow mb-3">Patients to watch</h2>
          <div className="flex flex-col gap-2">
            {a.atRisk.length === 0 ? (
              <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No data.</div>
            ) : (
              a.atRisk.map((p) => (
                <Link
                  key={p.id}
                  href={`/staff/patients/${p.id}`}
                  className="flex items-center justify-between rounded-card border border-line bg-card p-3 hover:border-primary"
                >
                  <div>
                    <div className="font-body text-[14px] font-bold text-ink">{p.name ?? "Patient"}</div>
                    <div className="font-body text-[11.5px] text-ink-soft">avg {p.avg} mg/dL · {p.flags} flags · last {p.lastValue ?? "—"}</div>
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full ${p.flags >= 3 ? "bg-coral" : p.flags > 0 ? "bg-marigold" : "bg-primary"}`} />
                </Link>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="eyebrow">Action queue</h2>
            {escalations.length > 8 && (
              <Link href="/staff/escalations" className="font-body text-[12px] text-primary hover:underline">
                View all {escalations.length} →
              </Link>
            )}
          </div>
          <EscalationQueue escalations={escalations.slice(0, 8)} />
        </section>
      </div>

      {/* Flagged readings — grouped by patient, sorted by urgency */}
      <section>
        <h2 className="eyebrow mb-3">Flagged readings by patient</h2>
        <FlaggedByPatient flagged={flagged} />
      </section>

      {/* Referral code widget — only shown if admin has assigned a code */}
      {myCode && (
        <section>
          <h2 className="eyebrow mb-3">Your referral code</h2>
          <div className="rounded-card border border-line bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-body text-[11px] uppercase tracking-wider text-ink-soft">Share this code with patients</div>
                <div className="mt-1 font-mono text-[22px] font-bold tracking-widest text-primary">{myCode.code}</div>
                <div className="mt-1.5 font-body text-[12px] text-ink-soft">
                  {myCode.referral_count} patient{myCode.referral_count !== 1 ? "s" : ""} referred ·{" "}
                  {myCode.pending_pkr > 0
                    ? <span className="font-semibold text-amber-600">PKR {myCode.pending_pkr.toLocaleString()} pending</span>
                    : "no pending payout"}{" "}
                  · PKR {myCode.paid_pkr.toLocaleString()} paid
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 text-[12px] text-ink-soft">
                <div className="font-semibold text-ink">Earn PKR 2,000 per patient</div>
                <ReferralShareButton code={myCode.code} />
                <div>Payouts every Friday.</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
