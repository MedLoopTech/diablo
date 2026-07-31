export const dynamic = "force-dynamic";

import { getStaffPerformance } from "@/lib/admin";

const ROLE_LABEL: Record<string, string> = { doctor: "Doctor", nutritionist: "Nutritionist", coach: "Coach" };

const TH = "px-4 py-2.5 text-left font-body text-[11px] uppercase tracking-wider text-ink-soft";
const TD = "px-4 py-3 font-body text-[13px] text-ink align-middle";

export default async function PerformancePage() {
  const { rows, totalPatients } = await getStaffPerformance();

  const totals = rows.reduce(
    (acc, r) => ({
      consults: acc.consults + r.consultsCompleted,
      referrals: acc.referrals + r.referralCount,
      pending: acc.pending + r.pendingPkr,
    }),
    { consults: 0, referrals: 0, pending: 0 }
  );

  const byRole = ["doctor", "nutritionist", "coach"].map((role) => ({
    role,
    label: ROLE_LABEL[role],
    rows: rows.filter((r) => r.role === role),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Staff performance</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          {rows.length} care pod members across all cohorts.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total patients", value: totalPatients },
          { label: "Consults completed", value: totals.consults },
          { label: "Referrals made", value: totals.referrals },
          { label: "Pending payouts", value: `PKR ${totals.pending.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-card border border-line bg-card p-4">
            <div className="eyebrow">{label}</div>
            <div className="mt-1 font-display text-[24px] font-semibold text-ink">{value}</div>
          </div>
        ))}
      </div>

      {/* Per-role tables */}
      {byRole.map(({ role, label, rows: group }) => (
        <section key={role}>
          <h2 className="eyebrow mb-3">{label}s</h2>
          <div className="overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full min-w-[560px] border-collapse">
              <thead className="border-b border-line bg-paper">
                <tr>
                  <th className={TH}>Name</th>
                  <th className={TH}>Patients</th>
                  <th className={TH}>Consults done</th>
                  <th className={TH}>Upcoming</th>
                  <th className={TH}>Referrals</th>
                  <th className={TH}>Pending payout</th>
                  <th className={TH}>Paid (all time)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {group.map((r) => (
                  <tr key={r.id} className="hover:bg-paper/60">
                    <td className={TD}>
                      <span className="font-semibold">{r.name ?? "—"}</span>
                    </td>
                    <td className={TD}>
                      <span className="font-semibold text-primary-deep">{r.patientCount}</span>
                    </td>
                    <td className={TD}>{r.consultsCompleted}</td>
                    <td className={TD}>
                      {r.consultsUpcoming > 0
                        ? <span className="font-semibold text-amber-600">{r.consultsUpcoming}</span>
                        : <span className="text-ink-soft">—</span>}
                    </td>
                    <td className={TD}>{r.referralCount > 0 ? r.referralCount : <span className="text-ink-soft">—</span>}</td>
                    <td className={TD}>
                      {r.pendingPkr > 0
                        ? <span className="font-semibold text-amber-600">PKR {r.pendingPkr.toLocaleString()}</span>
                        : <span className="text-ink-soft">—</span>}
                    </td>
                    <td className={TD}>
                      {r.paidPkr > 0
                        ? <span className="text-primary-deep">PKR {r.paidPkr.toLocaleString()}</span>
                        : <span className="text-ink-soft">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {rows.length === 0 && (
        <div className="rounded-card border border-line bg-card p-6 font-body text-[13px] text-ink-soft">
          No staff members found. Invite staff from the Admin panel.
        </div>
      )}
    </div>
  );
}
