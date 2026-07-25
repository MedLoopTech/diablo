import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { getOpenEscalations, getFlaggedReadings } from "@/lib/staff";
import { EscalationQueue } from "./EscalationQueue";

export default async function StaffHome() {
  const t = await getTranslations("staff");
  const profile = await getCurrentProfile();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const [escalations, flagged] = await Promise.all([
    getOpenEscalations(),
    getFlaggedReadings(),
  ]);
  const urgentCount = escalations.filter(
    (e) => e.kind === "glucose_urgent" || e.kind === "patient_flagged"
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {t("welcome", { name: firstName })}
        </h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          {escalations.length} open · {urgentCount} urgent · {flagged.length} flagged readings
        </p>
      </div>

      <section>
        <h2 className="eyebrow mb-3">Escalation queue</h2>
        <EscalationQueue escalations={escalations} />
      </section>

      <section>
        <h2 className="eyebrow mb-3">Flagged readings</h2>
        {flagged.length === 0 ? (
          <div className="rounded-card border border-line bg-card p-6 text-center font-body text-[13px] text-ink-soft">
            No flagged readings.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full min-w-[520px] border-collapse font-body text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-ink-soft">
                  <th className="p-3 font-semibold">Patient</th>
                  <th className="p-3 font-semibold">Value</th>
                  <th className="p-3 font-semibold">Context</th>
                  <th className="p-3 font-semibold">Flag</th>
                  <th className="p-3 font-semibold">When (PKT)</th>
                </tr>
              </thead>
              <tbody>
                {flagged.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="p-3">
                      <Link href={`/staff/patients/${r.patient_id}`} className="font-semibold text-ink hover:underline">
                        {r.patient_name ?? "Patient"}
                      </Link>
                    </td>
                    <td className="p-3 font-semibold text-ink">{r.value_mgdl}</td>
                    <td className="p-3 text-ink-soft">{r.context}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.flag === "urgent" ? "bg-coral text-white" : "bg-mint text-primary-deep"}`}>
                        {r.flag}
                      </span>
                    </td>
                    <td className="p-3 text-ink-soft">
                      {new Date(r.taken_at).toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
