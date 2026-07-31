export const dynamic = "force-dynamic";

import { getCurrentProfile } from "@/lib/profile";
import {
  getDoctorPrescriptionOutcomes,
  getNutritionistPlanOutcomes,
  getCoachPlanOutcomes,
  type DoctorPatientRow,
  type NutritionistPatientRow,
  type CoachPatientOutcomeRow,
} from "@/lib/staff";
import Link from "next/link";

// ─── helpers ─────────────────────────────────────────────────────────────────

function badge(label: string, color: string) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 font-body text-[11px] font-semibold ${color}`}>
      {label}
    </span>
  );
}

function glucoseChip(val: number | null, low: number, high: number) {
  if (val == null) return <span className="text-ink-soft">—</span>;
  const color =
    val <= low ? "bg-mint text-primary-deep" : val <= high ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700";
  return badge(`${val} mg/dL`, color);
}

function trendChip(pct: number | null) {
  if (pct == null) return <span className="text-ink-soft">—</span>;
  const arrow = pct < 0 ? "↓" : pct > 0 ? "↑" : "→";
  const color =
    pct < -5 ? "text-primary-deep" : pct > 5 ? "text-red-600" : "text-amber-600";
  return (
    <span className={`font-body text-[13px] font-semibold ${color}`}>
      {arrow} {Math.abs(pct)}%
    </span>
  );
}

function adherenceBar(pct: number | null) {
  if (pct == null) return <span className="text-ink-soft">—</span>;
  const color = pct >= 80 ? "bg-primary" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-paper">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-body text-[12px] text-ink-soft">{pct}%</span>
    </div>
  );
}

function weightChip(kg: number | null) {
  if (kg == null) return <span className="text-ink-soft">—</span>;
  const color = kg < -0.3 ? "text-primary-deep" : kg > 0.3 ? "text-red-600" : "text-amber-600";
  const sign = kg > 0 ? "+" : "";
  return <span className={`font-body text-[13px] font-semibold ${color}`}>{sign}{kg} kg</span>;
}

const TH = "px-4 py-2.5 text-left font-body text-[11px] uppercase tracking-wider text-ink-soft";
const TD = "px-4 py-3 font-body text-[13px] text-ink align-top";

// ─── Doctor view ─────────────────────────────────────────────────────────────

function DoctorView({ rows }: { rows: DoctorPatientRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Medication outcomes</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          Active prescriptions with 30-day fasting glucose trend.
        </p>
      </div>

      {!rows.length ? (
        <Empty text="No patients assigned to you yet." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-card">
          <table className="w-full min-w-[700px] border-collapse">
            <thead className="border-b border-line bg-paper">
              <tr>
                <th className={TH}>Patient</th>
                <th className={TH}>Medications</th>
                <th className={TH}>Avg fasting · 30d</th>
                <th className={TH}>Trend</th>
                <th className={TH}>Est. HbA1c</th>
                <th className={TH}>Flags</th>
                <th className={TH}>Escalations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-paper/60">
                  <td className={TD}>
                    <Link
                      href={`/staff/patients/${r.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {r.name ?? "—"}
                    </Link>
                  </td>
                  <td className={TD}>
                    {r.plan?.medications?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {r.plan.medications.slice(0, 3).map((m, i) => (
                          <span key={i} className="rounded-full bg-mint px-2 py-0.5 font-body text-[11px] font-semibold text-primary-deep">
                            {m.name} {m.dose}
                          </span>
                        ))}
                        {r.plan.medications.length > 3 && (
                          <span className="font-body text-[11px] text-ink-soft">
                            +{r.plan.medications.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-ink-soft">No plan</span>
                    )}
                  </td>
                  <td className={TD}>{glucoseChip(r.avgFasting30d, 100, 130)}</td>
                  <td className={TD}>{trendChip(r.fastingTrendPct)}</td>
                  <td className={TD}>
                    {r.estHba1c != null ? (
                      <span className={r.estHba1c < 6.5 ? "text-primary-deep font-semibold" : r.estHba1c < 7.5 ? "text-amber-600 font-semibold" : "text-red-600 font-semibold"}>
                        {r.estHba1c}%
                      </span>
                    ) : (
                      <span className="text-ink-soft">—</span>
                    )}
                  </td>
                  <td className={TD}>
                    {r.flags30d > 0
                      ? badge(`${r.flags30d}`, "bg-amber-100 text-amber-800")
                      : <span className="text-ink-soft">0</span>}
                  </td>
                  <td className={TD}>
                    {r.openEscalations > 0
                      ? badge(`${r.openEscalations} open`, "bg-red-100 text-red-700")
                      : <span className="text-ink-soft">None</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Nutritionist view ────────────────────────────────────────────────────────

function NutritionistView({ rows }: { rows: NutritionistPatientRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Meal plan outcomes</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          Active meal plans with post-meal glucose, weight, and adherence.
        </p>
      </div>

      {!rows.length ? (
        <Empty text="No patients assigned to you yet." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-card">
          <table className="w-full min-w-[680px] border-collapse">
            <thead className="border-b border-line bg-paper">
              <tr>
                <th className={TH}>Patient</th>
                <th className={TH}>Meal plan</th>
                <th className={TH}>Avg post-meal · 30d</th>
                <th className={TH}>Weight Δ · 30d</th>
                <th className={TH}>Meal adherence · 7d</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-paper/60">
                  <td className={TD}>
                    <Link
                      href={`/staff/patients/${r.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {r.name ?? "—"}
                    </Link>
                  </td>
                  <td className={TD}>
                    {r.plan ? (
                      <div>
                        <div className="font-semibold text-ink">
                          {r.plan.meals.length} meal{r.plan.meals.length !== 1 ? "s" : ""} prescribed
                        </div>
                        <div className="text-[11px] text-ink-soft">
                          from {r.plan.effective_from.slice(0, 10)}
                        </div>
                        {r.plan.notes && (
                          <div className="mt-0.5 text-[11px] text-ink-soft italic">{r.plan.notes}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-ink-soft">No plan</span>
                    )}
                  </td>
                  <td className={TD}>{glucoseChip(r.avgPostMeal30d, 140, 180)}</td>
                  <td className={TD}>{weightChip(r.weightChange30d)}</td>
                  <td className={TD}>{adherenceBar(r.mealAdherence7d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Coach view ───────────────────────────────────────────────────────────────

function CoachView({ rows }: { rows: CoachPatientOutcomeRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Movement plan outcomes</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          Active movement plans with 7-day session adherence, streak, and points.
        </p>
      </div>

      {!rows.length ? (
        <Empty text="No patients assigned to you yet." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-card">
          <table className="w-full min-w-[680px] border-collapse">
            <thead className="border-b border-line bg-paper">
              <tr>
                <th className={TH}>Patient</th>
                <th className={TH}>Movement plan</th>
                <th className={TH}>Sessions · 7d</th>
                <th className={TH}>Adherence</th>
                <th className={TH}>Streak</th>
                <th className={TH}>Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-paper/60">
                  <td className={TD}>
                    <Link
                      href={`/staff/patients/${r.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {r.name ?? "—"}
                    </Link>
                  </td>
                  <td className={TD}>
                    {r.plan?.exercises?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {r.plan.exercises.slice(0, 3).map((e, i) => (
                          <span key={i} className="rounded-full bg-paper px-2 py-0.5 font-body text-[11px] font-medium text-ink-soft border border-line">
                            {e.name}
                          </span>
                        ))}
                        {r.plan.exercises.length > 3 && (
                          <span className="font-body text-[11px] text-ink-soft">
                            +{r.plan.exercises.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-ink-soft">No plan</span>
                    )}
                  </td>
                  <td className={TD}>
                    <span className="font-semibold">{r.movementDone7d}</span>
                    <span className="text-ink-soft"> / {r.movementTotal7d}</span>
                  </td>
                  <td className={TD}>{adherenceBar(r.movementTotal7d ? r.movementPct7d : null)}</td>
                  <td className={TD}>
                    <span className={`font-semibold ${r.streak >= 7 ? "text-primary-deep" : r.streak >= 3 ? "text-amber-600" : "text-ink"}`}>
                      {r.streak}d
                    </span>
                  </td>
                  <td className={TD}>
                    <span className="font-semibold text-marigold">{r.points.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-6 font-body text-[13px] text-ink-soft">
      {text}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PrescriptionsPage() {
  const profile = await getCurrentProfile();
  const role = profile?.role ?? "";

  if (role === "doctor") {
    const rows = await getDoctorPrescriptionOutcomes();
    return <DoctorView rows={rows} />;
  }
  if (role === "nutritionist") {
    const rows = await getNutritionistPlanOutcomes();
    return <NutritionistView rows={rows} />;
  }
  if (role === "coach") {
    const rows = await getCoachPlanOutcomes();
    return <CoachView rows={rows} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">Prescriptions & outcomes</h1>
      <div className="rounded-card border border-line bg-card p-6 font-body text-[13px] text-ink-soft">
        This page is available to doctors, nutritionists, and coaches.
      </div>
    </div>
  );
}
