"use client";

import { useState, useTransition } from "react";
import { markReferralsPaid } from "@/app/(staff)/staff/admin/actions";
import type { ReferralRow } from "@/lib/admin";

export function PayoutsPanel({
  referrals,
  payoutPkr,
}: {
  referrals: ReferralRow[];
  payoutPkr: number;
}) {
  const [items, setItems] = useState(referrals);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const referredRows = items.filter((r) => r.status === "referred");
  const convertedRows = items.filter((r) => r.status === "converted");
  const paidRows = items.filter((r) => r.status === "paid");

  const pendingTotal = convertedRows.reduce((s, r) => s + r.payout_pkr, 0);
  const paidTotal = paidRows.reduce((s, r) => s + r.payout_pkr, 0);

  const toggleAll = () =>
    setSelected(
      selected.size === convertedRows.length
        ? new Set()
        : new Set(convertedRows.map((r) => r.id))
    );

  const markPaid = () =>
    startT(async () => {
      const ids = Array.from(selected);
      const r = await markReferralsPaid(ids);
      if (r.ok) {
        const now = new Date().toISOString();
        setItems((prev) => prev.map((row) => selected.has(row.id) ? { ...row, status: "paid" as const, paid_at: now } : row));
        const notes = r.fulfillments?.map((f) => f.note).join(" · ");
        setMsg(notes ? `Marked ${selected.size} paid — ${notes}` : `Marked ${selected.size} referral${selected.size !== 1 ? "s" : ""} as paid.`);
      } else {
        setMsg(r.error ?? "Failed.");
      }
      setSelected(new Set());
    });

  const TH = "px-4 py-2.5 text-left font-body text-[11px] uppercase tracking-wider text-ink-soft";
  const TD = "px-4 py-3 font-body text-[13px] text-ink align-middle";

  return (
    <div className="flex flex-col gap-8">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-card border border-line bg-card p-4">
          <div className="eyebrow">Total referrals</div>
          <div className="mt-1 font-display text-[24px] font-semibold text-ink">{items.length}</div>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <div className="eyebrow">Awaiting conversion</div>
          <div className="mt-1 font-display text-[24px] font-semibold text-primary-deep">{referredRows.length}</div>
          <div className="mt-0.5 font-body text-[11.5px] text-ink-soft">signed up, not enrolled</div>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <div className="eyebrow">Ready to pay</div>
          <div className="mt-1 font-display text-[24px] font-semibold text-amber-600">{convertedRows.length}</div>
          <div className="mt-0.5 font-body text-[11.5px] text-ink-soft">PKR {pendingTotal.toLocaleString()}</div>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <div className="eyebrow">Payout per patient</div>
          <div className="mt-1 font-display text-[24px] font-semibold text-primary-deep">PKR {payoutPkr.toLocaleString()}</div>
          <div className="mt-0.5 font-body text-[11px] text-ink-soft">
            Change in Admin → Automation
          </div>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <div className="eyebrow">Paid (all time)</div>
          <div className="mt-1 font-display text-[24px] font-semibold text-primary-deep">PKR {paidTotal.toLocaleString()}</div>
          <div className="mt-0.5 font-body text-[11.5px] text-ink-soft">{paidRows.length} referrals</div>
        </div>
      </div>

      {/* Awaiting conversion — follow-up list, nothing owed yet */}
      <section>
        <h2 className="eyebrow mb-3">Awaiting conversion</h2>
        {referredRows.length === 0 ? (
          <div className="rounded-card border border-line bg-card p-5 font-body text-[13px] text-ink-soft">
            Nothing waiting — every referral has either converted or hasn&apos;t signed up yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full min-w-[480px] border-collapse">
              <thead className="border-b border-line bg-paper">
                <tr>
                  <th className={TH}>Code</th>
                  <th className={TH}>Referrer</th>
                  <th className={TH}>Patient</th>
                  <th className={TH}>Signed up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {referredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-paper/60">
                    <td className={TD}>
                      <span className="rounded-full bg-sky/60 px-2 py-0.5 font-mono text-[11px] font-bold text-primary-deep">
                        {r.code}
                      </span>
                    </td>
                    <td className={TD}>{r.referrer_name ?? "—"}</td>
                    <td className={TD}>{r.patient_name ?? "—"}</td>
                    <td className={TD + " text-ink-soft"}>
                      {r.enrolled_at ? new Date(r.enrolled_at).toLocaleDateString("en-PK") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 font-body text-[11.5px] text-ink-soft">
          Follow up to get these enrolled in a cohort — no payout is owed until then.
        </p>
      </section>

      {/* Ready to pay — converted, not yet paid */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="eyebrow">Ready to pay</h2>
          {convertedRows.length > 0 && (
            <div className="flex items-center gap-3">
              <button onClick={toggleAll} className="font-body text-[12px] text-primary underline">
                {selected.size === convertedRows.length ? "Deselect all" : "Select all"}
              </button>
              <button
                onClick={markPaid}
                disabled={pending || selected.size === 0}
                className="rounded-full bg-primary px-4 py-1.5 font-body text-[12px] font-bold text-white disabled:opacity-40"
              >
                {pending ? "Processing…" : `Mark ${selected.size || ""} paid`}
              </button>
              {msg && <span className="font-body text-[12px] text-primary-deep">{msg}</span>}
            </div>
          )}
        </div>

        {convertedRows.length === 0 ? (
          <div className="rounded-card border border-line bg-card p-5 font-body text-[13px] text-ink-soft">
            No payouts ready. All converted referrals are settled.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full min-w-[580px] border-collapse">
              <thead className="border-b border-line bg-paper">
                <tr>
                  <th className="w-10 px-4 py-2.5" />
                  <th className={TH}>Code</th>
                  <th className={TH}>Referrer</th>
                  <th className={TH}>Patient</th>
                  <th className={TH}>Converted</th>
                  <th className={TH}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {convertedRows.map((r) => (
                  <tr key={r.id} className={`hover:bg-paper/60 ${selected.has(r.id) ? "bg-mint/30" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          e.target.checked ? next.add(r.id) : next.delete(r.id);
                          setSelected(next);
                        }}
                        className="h-4 w-4 accent-primary"
                      />
                    </td>
                    <td className={TD}>
                      <span className="rounded-full bg-mint px-2 py-0.5 font-mono text-[11px] font-bold text-primary-deep">
                        {r.code}
                      </span>
                    </td>
                    <td className={TD}>{r.referrer_name ?? "—"}</td>
                    <td className={TD}>{r.patient_name ?? "—"}</td>
                    <td className={TD + " text-ink-soft"}>
                      {r.converted_at ? new Date(r.converted_at).toLocaleDateString("en-PK") : "—"}
                    </td>
                    <td className={TD}>
                      <span className="font-semibold">PKR {r.payout_pkr.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Paid history */}
      {paidRows.length > 0 && (
        <section>
          <h2 className="eyebrow mb-3">Payment history</h2>
          <div className="overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full min-w-[580px] border-collapse">
              <thead className="border-b border-line bg-paper">
                <tr>
                  <th className={TH}>Code</th>
                  <th className={TH}>Referrer</th>
                  <th className={TH}>Patient</th>
                  <th className={TH}>Enrolled</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Paid on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paidRows.map((r) => (
                  <tr key={r.id} className="hover:bg-paper/60">
                    <td className={TD}>
                      <span className="font-mono text-[11px] font-bold text-ink-soft">{r.code}</span>
                    </td>
                    <td className={TD}>{r.referrer_name ?? "—"}</td>
                    <td className={TD}>{r.patient_name ?? "—"}</td>
                    <td className={TD + " text-ink-soft"}>
                      {r.enrolled_at ? new Date(r.enrolled_at).toLocaleDateString("en-PK") : "—"}
                    </td>
                    <td className={TD}>PKR {r.payout_pkr.toLocaleString()}</td>
                    <td className={TD}>
                      <span className="rounded-full bg-mint px-2 py-0.5 font-body text-[11px] font-semibold text-primary-deep">
                        {r.paid_at ? new Date(r.paid_at).toLocaleDateString("en-PK") : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
