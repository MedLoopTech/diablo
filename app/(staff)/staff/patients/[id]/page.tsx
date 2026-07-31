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
import { MedicalHistoryEditor } from "./MedicalHistoryEditor";
import { StaffReplyBox } from "./StaffReplyBox";
import { PatientGlucoseChart } from "@/components/PatientGlucoseChart";
import { GlucoseReviewButton } from "./GlucoseReviewButton";

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

async function getPatientChat(patientId: string) {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("chat_messages")
    .select("id, sender, body, created_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(30);
  return (data ?? []).reverse();
}

async function getGlucoseReviewData(patientId: string) {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("glucose_readings")
    .select("id, doctor_note, reviewed_at")
    .eq("patient_id", patientId)
    .neq("flag", "none");
  return new Map((data ?? []).map((r) => [r.id as string, { note: (r.doctor_note as string | null) ?? null, reviewedAt: (r.reviewed_at as string | null) ?? null }]));
}

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [p, viewer] = await Promise.all([getPatientDetail(params.id), getCurrentProfile()]);
  if (!p) notFound();
  const [evidence, chatMessages, glucoseReviewMap] = await Promise.all([
    getTaskEvidence(params.id),
    getPatientChat(params.id),
    getGlucoseReviewData(params.id),
  ]);
  const role = viewer?.role ?? "";
  const canEditMeds = role === "doctor" || role === "admin";
  const canEditMeals = role === "nutritionist" || role === "admin";
  const canEditMovement = role === "coach" || role === "admin";
  const canEditMedHistory = role === "doctor" || role === "admin";
  const canSeeMeds = role !== "coach"; // coach sees allergies only, not pre-existing meds

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

      {/* Medical History */}
      {canEditMedHistory ? (
        <MedicalHistoryEditor patientId={p.id} history={p.medicalHistory} />
      ) : (
        <div className="rounded-card border border-line bg-card p-4">
          <h3 className="eyebrow mb-3">Medical history</h3>
          {!p.medicalHistory ? (
            <p className="font-body text-[13px] text-ink-soft">No medical history recorded yet.</p>
          ) : (
            <dl className="flex flex-col gap-2 font-body text-[13px]">
              {p.medicalHistory.diabetes_type && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink-soft w-28 flex-shrink-0">Type:</dt>
                  <dd className="text-ink capitalize">{p.medicalHistory.diabetes_type.replace("type", "Type ")}</dd>
                </div>
              )}
              {p.medicalHistory.diagnosis_year && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink-soft w-28 flex-shrink-0">Diagnosed:</dt>
                  <dd className="text-ink">{p.medicalHistory.diagnosis_year}</dd>
                </div>
              )}
              {p.medicalHistory.allergies.length > 0 && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink-soft w-28 flex-shrink-0">Allergies:</dt>
                  <dd className="flex flex-wrap gap-1">
                    {p.medicalHistory.allergies.map((a) => (
                      <span key={a} className="rounded-full bg-red-50 px-2 py-0.5 text-[11.5px] font-semibold text-red-600">{a}</span>
                    ))}
                  </dd>
                </div>
              )}
              {p.medicalHistory.comorbidities.length > 0 && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink-soft w-28 flex-shrink-0">Conditions:</dt>
                  <dd className="text-ink">{p.medicalHistory.comorbidities.join(", ")}</dd>
                </div>
              )}
              {canSeeMeds && p.medicalHistory.pre_existing_meds.length > 0 && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink-soft w-28 flex-shrink-0">Prior meds:</dt>
                  <dd className="flex flex-col gap-0.5">
                    {p.medicalHistory.pre_existing_meds.map((m, i) => (
                      <span key={i} className="text-ink">{m.name}{m.dose ? ` — ${m.dose}` : ""}{m.frequency ? ` (${m.frequency})` : ""}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
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
                  {canEditMeds && <th className="p-3 font-semibold">Review</th>}
                </tr>
              </thead>
              <tbody>
                {p.readings
                  .filter((r) => r.flag !== "none")
                  .map((r) => {
                    const rev = glucoseReviewMap.get(r.id);
                    return (
                    <tr key={r.id} className="border-b border-line last:border-0">
                      <td className="p-3 font-semibold text-ink">{r.value_mgdl}</td>
                      <td className="p-3 text-ink-soft">{r.context}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.flag === "urgent" ? "bg-coral text-white" : "bg-mint text-primary-deep"}`}>
                          {r.flag}
                        </span>
                      </td>
                      <td className="p-3 text-ink-soft">{pkt(r.taken_at)}</td>
                      {canEditMeds && (
                        <td className="p-3">
                          <GlucoseReviewButton
                            readingId={r.id}
                            existingNote={rev?.note}
                            reviewedAt={rev?.reviewedAt}
                          />
                        </td>
                      )}
                    </tr>
                    );
                  })}
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

      <section>
        <h2 className="eyebrow mb-3">Recent chat messages</h2>
        {chatMessages.length === 0 ? (
          <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
            No messages yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-card border border-line bg-card p-4">
            {chatMessages.map((m) => {
              const isPatient = m.sender === "patient";
              return (
                <div key={m.id} className={`flex ${isPatient ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-[12px] px-3 py-2 font-body text-[13px] ${isPatient ? "bg-paper text-ink" : "bg-primary text-white"}`}>
                    {!isPatient && (
                      <div className="mb-0.5 text-[11px] font-semibold capitalize opacity-80">{m.sender}</div>
                    )}
                    <div>{m.body as string}</div>
                    <div className={`mt-0.5 text-[10.5px] ${isPatient ? "text-ink-soft" : "opacity-70"}`}>
                      {pkt(m.created_at as string)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <StaffReplyBox patientId={p.id} />
    </div>
  );
}
