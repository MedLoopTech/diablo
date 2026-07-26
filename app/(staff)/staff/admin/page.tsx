import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { getAdminOverview } from "@/lib/admin";
import { planFeatures, type Plan } from "@/lib/plan";
import { AdminPanels } from "./AdminPanels";

const PLANS: Plan[] = ["basic", "plus", "premium"];

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return (
      <div className="py-16 text-center">
        <div className="font-display text-xl font-semibold text-ink">Admins only</div>
        <p className="mt-2 font-body text-[13px] text-ink-soft">This area is restricted to administrators.</p>
        <Link href="/staff" className="mt-4 inline-block font-body text-[13px] font-bold text-primary-deep">← Back to dashboard</Link>
      </div>
    );
  }

  const overview = await getAdminOverview();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          {overview.cohorts.length} cohorts · {overview.staff.length} staff · {overview.patients.length} patients
        </p>
      </div>

      <AdminPanels overview={overview} />

      <section>
        <h2 className="eyebrow mb-3">Plans &amp; packages</h2>
        <p className="mb-3 font-body text-[12.5px] text-ink-soft">
          Feature gating is centralized in <code className="rounded bg-mint px-1">lib/plan.ts</code>. Enrollment/payment
          will set a patient&apos;s plan; these flags then drive behavior (e.g. whether a glucometer photo is required).
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const f = planFeatures(plan);
            return (
              <div key={plan} className="rounded-card border border-line bg-card p-4">
                <div className="font-body text-[14px] font-bold capitalize text-ink">{plan}</div>
                <ul className="mt-2 flex flex-col gap-1 font-body text-[12.5px] text-ink-soft">
                  <li>{f.glucometerPhotoRequired ? "✓" : "—"} Glucometer photo required</li>
                  <li>{f.aiMealAnalysis ? "✓" : "—"} AI meal analysis</li>
                  <li>{f.aiCoach ? "✓" : "—"} AI coach</li>
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
