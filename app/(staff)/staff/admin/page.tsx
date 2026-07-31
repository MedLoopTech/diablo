import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { getAdminOverview } from "@/lib/admin";
import { AdminPanels, type Tab } from "./AdminPanels";

const VALID_TABS: Tab[] = ["cohorts", "staff", "patients", "plans", "resources", "templates", "automation", "referrals"];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
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

  const tab: Tab = VALID_TABS.includes(searchParams.tab as Tab)
    ? (searchParams.tab as Tab)
    : "cohorts";

  const overview = await getAdminOverview();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          {overview.cohorts.length} cohorts · {overview.staff.length} staff · {overview.patients.length} patients
        </p>
      </div>
      <AdminPanels overview={overview} tab={tab} />
    </div>
  );
}
