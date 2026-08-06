import { getMyReferralCode, type ReferralFunnelRow } from "@/lib/staff";
import { ReferralShareButton } from "@/components/ReferralShareButton";
import { ReferralFollowUpButton } from "@/components/ReferralFollowUpButton";

export const dynamic = "force-dynamic";

export const metadata = { title: "Referrals" };

const STATUS_LABEL: Record<ReferralFunnelRow["status"], { label: string; cls: string }> = {
  referred: { label: "Awaiting conversion", cls: "bg-sky/60 text-primary-deep" },
  converted: { label: "Converted · owed", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", cls: "bg-mint text-primary-deep" },
};

function Row({ r }: { r: ReferralFunnelRow }) {
  const status = STATUS_LABEL[r.status];
  const date = r.status === "referred" ? r.referredAt : r.convertedAt;
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-card px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="font-body text-[13.5px] font-semibold text-ink">{r.name ?? "Unnamed patient"}</div>
        <div className="font-body text-[11.5px] text-ink-soft">
          {date ? new Date(date).toLocaleDateString("en-PK") : "—"}
          {r.status !== "referred" && ` · PKR ${r.payoutPkr.toLocaleString()}`}
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${status.cls}`}>
        {status.label}
      </span>
      {r.status === "referred" && (
        <div className="shrink-0">
          <ReferralFollowUpButton name={r.name} phone={r.phone} />
        </div>
      )}
    </div>
  );
}

export default async function ReferralsPage() {
  const myCode = await getMyReferralCode();

  if (!myCode) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Referrals</h1>
        <div className="rounded-card border border-line bg-card p-5">
          <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">
            You don&apos;t have a referral code yet — ask your admin to create one for you in
            Admin → Referrals.
          </p>
        </div>
      </div>
    );
  }

  const referred = myCode.rows.filter((r) => r.status === "referred");
  const converted = myCode.rows.filter((r) => r.status === "converted");
  const paid = myCode.rows.filter((r) => r.status === "paid");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Referrals</h1>
      <p className="mb-6 font-body text-[13px] text-ink-soft">
        Every patient you&apos;ve referred, wherever they are in the funnel — follow up on the
        ones stuck at &quot;awaiting conversion&quot; to actually get paid for them.
      </p>

      <div className="mb-6 rounded-card border border-line bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-body text-[11px] uppercase tracking-wider text-ink-soft">Your code</div>
            <div className="mt-1 font-mono text-[22px] font-bold tracking-widest text-primary">{myCode.code}</div>
          </div>
          <ReferralShareButton code={myCode.code} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <div>
            <div className="font-display text-[22px] font-semibold text-primary-deep">{referred.length}</div>
            <div className="font-body text-[11.5px] text-ink-soft">Awaiting conversion</div>
          </div>
          <div>
            <div className="font-display text-[22px] font-semibold text-amber-600">PKR {myCode.pending_pkr.toLocaleString()}</div>
            <div className="font-body text-[11.5px] text-ink-soft">Owed · {converted.length} converted</div>
          </div>
          <div>
            <div className="font-display text-[22px] font-semibold text-primary-deep">PKR {myCode.paid_pkr.toLocaleString()}</div>
            <div className="font-body text-[11.5px] text-ink-soft">Paid · {paid.length} referrals</div>
          </div>
        </div>
      </div>

      {myCode.rows.length === 0 ? (
        <div className="rounded-card border border-line bg-card p-5 font-body text-[13.5px] text-ink-soft">
          No referrals yet — share your code above to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {referred.length > 0 && (
            <section>
              <h2 className="eyebrow mb-2">Awaiting conversion — follow up</h2>
              <div className="flex flex-col gap-2">
                {referred.map((r) => <Row key={r.patientId} r={r} />)}
              </div>
            </section>
          )}
          {converted.length > 0 && (
            <section>
              <h2 className="eyebrow mb-2">Converted, awaiting payout</h2>
              <div className="flex flex-col gap-2">
                {converted.map((r) => <Row key={r.patientId} r={r} />)}
              </div>
            </section>
          )}
          {paid.length > 0 && (
            <section>
              <h2 className="eyebrow mb-2">Paid</h2>
              <div className="flex flex-col gap-2">
                {paid.map((r) => <Row key={r.patientId} r={r} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
