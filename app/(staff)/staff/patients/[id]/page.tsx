import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientDetail } from "@/lib/staff";
import { getCurrentProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase, PHOTO_BUCKET } from "@/lib/supabase/admin";
import { karachiToday } from "@/lib/time";
import { MedicationEditor } from "./MedicationEditor";
import { MealPlanEditor } from "./MealPlanEditor";
import { MovementPlanEditor } from "./MovementPlanEditor";
import { StaffReplyBox } from "./StaffReplyBox";
import { PatientGlucoseChart } from "@/components/PatientGlucoseChart";

function pkt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function getTaskEvidence(patientId: string) {
  // Fetch the last 7 days of tasks that have photo evidence.
  const supabase = createServerSupabase();
  const today = karachiToday();
  const sevenDaysAgo = new Date(new Date(today).getTime() - 6 * 86400000)
    .toISOString()
    .slice(0, 10);
  const { data } = await supabase
    .from("tasks")
    .select("id, for_date, kind, title, evidence_url, evidence_at, done_at")
    .eq("patient_id", patientId)
    .not("evidence_url", "is", null)
    .gte("for_date", sevenDaysAgo)
    .order("evidence_at", { ascending: false })
    .limit(20);
  if (!data?.length) return [];

  // Generate short-lived signed URLs so staff can view the thumbnails.
  const admin = createAdminSupabase();
  return Promise.all(
    data.map(async (t) => {
      const { data: signed } = await admin.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(t.evidence_url!, 3600);
      return { ...t, signedUrl: signed?.signedUrl ?? null };
    })
  );
}

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [p, viewer] = await Promise.all([getPatientDetail(params.id), getCurrentProfile()]);
  if (!p) notFound();
  const evidence = await getTaskEvidence(params.id);
  const role = viewer?.role ?? "";
  const canEditMeds = role === "doctor" || role === "admin";
  const canEditMeals = role === "nutritionist" || role === "admin";
  const canEditMovement = role === "coach" || role === "admin";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/staff" className="font-body text-[12.5px] text-ink-soft hover:underline">
          ← Back to queue
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          {p.name ?? "Patient"}
        </h1>
      </div>

      {/* Medication: editor for doctors/admin, read-only summary otherwise. */}
      {canEditMeds ? (
        <MedicationEditor patientId={p.id} plan={p.currentPlan} />
      ) : (
        <div className="rounded-card border border-line bg-card p-4">
          <h3 className="eyebrow mb-2">Medication plan</h3>
          {p.currentPlan?.medications?.length ? (
            <ul className="flex flex-col gap-1 font-body text-[13px] text-ink">
              {p.currentPlan.medications.map((m, i) => (
                <li key={i}>{m.name} · {m.dose} · {m.schedule}</li>
              ))}
            </ul>
          ) : (
            <p className="font-body text-[13px] text-ink-soft">No medication plan.</p>
          )}
        </div>
      )}

      {/* Meal plan: editor for nutritionist/admin, read-only summary otherwise. */}
      {canEditMeals ? (
        <MealPlanEditor patientId={p.id} plan={p.currentMealPlan} />
      ) : (
        <div className="rounded-card border border-line bg-card p-4">
          <h3 className="eyebrow mb-2">Meal plan</h3>
          {p.currentMealPlan?.meals?.length ? (
            <ul className="flex flex-col gap-1 font-body text-[13px] text-ink">
              {p.currentMealPlan.meals.map((m, i) => (
                <li key={i}><span className="capitalize font-semibold">{m.meal}:</span> {m.description}{m.carb_target_g ? ` (~${m.carb_target_g}g)` : ""}</li>
              ))}
            </ul>
          ) : (
            <p className="font-body text-[13px] text-ink-soft">No meal plan yet.</p>
          )}
        </div>
      )}

      {/* Movement plan: editor for coach/admin, read-only summary otherwise. */}
      {canEditMovement ? (
        <MovementPlanEditor patientId={p.id} plan={p.currentMovementPlan} />
      ) : (
        <div className="rounded-card border border-line bg-card p-4">
          <h3 className="eyebrow mb-2">Movement plan</h3>
          {p.currentMovementPlan?.exercises?.length ? (
            <ul className="flex flex-col gap-1 font-body text-[13px] text-ink">
              {p.currentMovementPlan.exercises.map((ex, i) => (
                <li key={i}>
                  <span className="font-semibold">{ex.name}</span>
                  <span className="ml-1 text-ink-soft">
                    {ex.duration_min ? `${ex.duration_min} min` : ""}
                    {ex.sets && ex.reps ? ` · ${ex.sets}×${ex.reps}` : ex.sets ? ` · ${ex.sets} sets` : ""}
                    {ex.notes ? ` — ${ex.notes}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body text-[13px] text-ink-soft">No movement plan yet.</p>
          )}
        </div>
      )}

      <section>
        <h2 className="eyebrow mb-3">Glucose readings</h2>
        <div className="rounded-card border border-line bg-card p-4">
          <PatientGlucoseChart readings={p.readings} />
        </div>
        {/* Flagged readings only — compact, most recent first */}
        {p.readings.some((r) => r.flag !== "none") && (
          <div className="mt-3 overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full min-w-[380px] border-collapse font-body text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-ink-soft">
                  <th className="p-3 font-semibold">Value</th>
                  <th className="p-3 font-semibold">Context</th>
                  <th className="p-3 font-semibold">Flag</th>
                  <th className="p-3 font-semibold">When (PKT)</th>
                </tr>
              </thead>
              <tbody>
                {p.readings
                  .filter((r) => r.flag !== "none")
                  .map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-0">
                      <td className="p-3 font-semibold text-ink">{r.value_mgdl}</td>
                      <td className="p-3 text-ink-soft">{r.context}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.flag === "urgent" ? "bg-coral text-white" : "bg-mint text-primary-deep"}`}>
                          {r.flag}
                        </span>
                      </td>
                      <td className="p-3 text-ink-soft">{pkt(r.taken_at)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="eyebrow mb-3">Booked consults</h2>
        {p.bookings.length === 0 ? (
          <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
            No bookings.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {p.bookings.map((b) => {
              const snap = b.context_snapshot as { readings?: unknown[]; meals?: unknown[] } | null;
              return (
                <div key={b.id} className="rounded-card border border-line bg-card p-4 font-body text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{b.slot_time}</span>
                    <span className="text-ink-soft">{b.status}</span>
                  </div>
                  {b.reason && <div className="mt-1 text-ink-soft">{b.reason}</div>}
                  {snap && (
                    <div className="mt-2 text-[12px] text-primary-deep">
                      📎 Attached: {snap.readings?.length ?? 0} readings, {snap.meals?.length ?? 0} meals
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="eyebrow mb-3">Task evidence (last 7 days)</h2>
        {evidence.length === 0 ? (
          <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
            No photo evidence submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {evidence.map((e) => (
              <div key={e.id} className="overflow-hidden rounded-card border border-line bg-card">
                {e.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.signedUrl}
                    alt={e.title}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-card text-[28px]">📷</div>
                )}
                <div className="px-2 py-1.5">
                  <div className="font-body text-[12px] font-semibold text-ink">{e.title}</div>
                  <div className="font-body text-[10.5px] text-ink-soft">
                    {e.for_date} · {e.evidence_at ? pkt(e.evidence_at) : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="eyebrow mb-3">Escalations</h2>
        <div className="flex flex-col gap-2">
          {p.escalations.length === 0 ? (
            <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
              None.
            </div>
          ) : (
            p.escalations.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-card border border-line bg-card p-3 font-body text-[13px]">
                <span className="text-ink">{e.kind}</span>
                <span className="text-ink-soft">{e.status} · {pkt(e.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <StaffReplyBox patientId={p.id} />
    </div>
  );
}
