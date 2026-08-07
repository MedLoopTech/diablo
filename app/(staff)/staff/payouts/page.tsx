export const dynamic = "force-dynamic";

import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { isSuperAdminRole } from "@/lib/roles";
import type { ReferralRow } from "@/lib/admin";
import { PayoutsPanel } from "./PayoutsPanel";

export default async function PayoutsPage() {
  const profile = await getCurrentProfile();
  if (!isSuperAdminRole(profile?.role)) {
    return (
      <div className="py-16 text-center">
        <div className="font-display text-xl font-semibold text-ink">Super admins only</div>
        <p className="mt-2 font-body text-[13px] text-ink-soft">Referral payouts move real money — restricted to super admins.</p>
        <Link href="/staff" className="mt-4 inline-block font-body text-[13px] font-bold text-primary-deep">← Back to dashboard</Link>
      </div>
    );
  }

  const supabase = createServerSupabase();

  const [{ data: refRows }, { data: cfg }, { data: currencyCfg }, { data: codeRows }] = await Promise.all([
    supabase
      .from("referrals")
      .select("id, code, referrer_id, patient_id, enrolled_at, converted_at, payout_pkr, status, paid_at")
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("automation_config")
      .select("value")
      .eq("key", "referral_payout_pkr")
      .maybeSingle(),
    supabase
      .from("automation_config")
      .select("value")
      .eq("key", "platform_currency")
      .maybeSingle(),
    supabase.from("referral_codes").select("code, reward_type"),
  ]);

  const rewardTypeByCode = new Map((codeRows ?? []).map((c) => [c.code as string, (c.reward_type as string) ?? "cash"]));

  // Resolve names for referrers and patients
  const seen = new Set<string>();
  const allIds: string[] = [];
  for (const r of refRows ?? []) {
    if (r.referrer_id && !seen.has(r.referrer_id as string)) { seen.add(r.referrer_id as string); allIds.push(r.referrer_id as string); }
    if (r.patient_id && !seen.has(r.patient_id as string)) { seen.add(r.patient_id as string); allIds.push(r.patient_id as string); }
  }
  const { data: profiles } = allIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", allIds)
    : { data: [] };

  const nameOf = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));

  const referrals: ReferralRow[] = (refRows ?? []).map((r) => ({
    id: r.id as string,
    code: r.code as string,
    referrer_name: r.referrer_id ? (nameOf.get(r.referrer_id as string) ?? null) : null,
    patient_name: r.patient_id ? (nameOf.get(r.patient_id as string) ?? null) : null,
    enrolled_at: (r.enrolled_at as string) ?? null,
    converted_at: (r.converted_at as string) ?? null,
    payout_pkr: (r.payout_pkr as number) ?? 2000,
    reward_type: (rewardTypeByCode.get(r.code as string) as ReferralRow["reward_type"]) ?? "cash",
    status: r.status as ReferralRow["status"],
    paid_at: (r.paid_at as string) ?? null,
  }));

  const payoutPkr = cfg ? parseInt(cfg.value as string, 10) || 2000 : 2000;
  const currency = (currencyCfg?.value as string) || "PKR";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Payout management</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          Referral partner payouts — mark weekly transfers as paid every Friday.
        </p>
      </div>
      <PayoutsPanel referrals={referrals} payoutPkr={payoutPkr} currency={currency} />
    </div>
  );
}
