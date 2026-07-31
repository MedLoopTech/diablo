import { getOpenEscalations } from "@/lib/staff";
import { EscalationQueue } from "../EscalationQueue";

export const dynamic = "force-dynamic";

export default async function EscalationsPage() {
  const escalations = await getOpenEscalations();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Escalations</h1>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          {escalations.length} open · ordered by severity
        </p>
      </div>
      <EscalationQueue escalations={escalations} />
    </div>
  );
}
