export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientDetail } from "@/lib/staff";
import { getCurrentProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase, PHOTO_BUCKET, VOICE_BUCKET } from "@/lib/supabase/admin";
import { VoicePlayer } from "@/components/VoicePlayer";
import { karachiToday } from "@/lib/time";
import { MedicationEditor } from "./MedicationEditor";
import { MealPlanEditor } from "./MealPlanEditor";
import { MovementPlanEditor } from "./MovementPlanEditor";
import { MedicalHistoryEditor } from "./MedicalHistoryEditor";
import { StaffReplyBox } from "./StaffReplyBox";
import { PatientGlucoseChart } from "@/components/PatientGlucoseChart";
import { GlucoseReviewButton } from "./GlucoseReviewButton";
import { toPlainText } from "@/lib/chat-text";
import { LabResults } from "./LabResults";
import { DocumentsPanel } from "./DocumentsPanel";
import { getPatientLabResults } from "@/lib/labs";
import { getPatientDocuments } from "@/lib/documents";

function pkt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function getTaskEvidence(patientId: string) {
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
    .select("id, sender, body, audio_path, created_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(30);
  const rows = (data ?? []).reverse();

  const withAudio = rows.filter((m) => m.audio_path);
  if (withAudio.length === 0) return rows.map((m) => ({ ...m, signedAudioUrl: null as string | null }));

  const admin = createAdminSupabase();
  const signedByPath = new Map<string, string | null>();
  await Promise.all(
    withAudio.map(async (m) => {
      const { data: signed } = await admin.storage.from(VOICE_BUCKET).createSignedUrl(m.audio_path!, 3600);
      signedByPath.set(m.audio_path!, signed?.signedUrl ?? null);
    })
  );
  return rows.map((m) => ({ ...m, signedAudioUrl: m.audio_path ? signedByPath.get(m.audio_path) ?? null : null }));
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

const ESCALATION_KIND: Record<string, { label: string; cls: string }> = {
  glucose_urgent:  { label: "Urgent · glucose",  cls: "bg-coral text-white" },
  patient_flagged: { label: "Urgent · flagged",  cls: "bg-coral text-white" },
  ai_routed:       { label: "AI routed",          cls: "bg-marigold-soft text-[#9A6A14]" },
  glucose_routine: { label: "Routine · glucose",  cls: "bg-mint text-primary-deep" },
};

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [p, viewer] = await Promise.all([getPatientDetail(params.id), getCurrentProfile()]);
  if (!p) notFound();
  const [evidence, chatMessages, glucoseReviewMap, labResults, documents] = await Promise.all([
    getTaskEvidence(params.id),
    getPatientChat(params.id),
    getGlucoseReviewData(params.id),
    getPatientLabResults(params.id),
    getPatientDocuments(params.id),
  ]);

  const role = viewer?.role ?? "";
  const canEditMeds     = role === "doctor"       || role === "admin";
  const canEditMeals    = role === "nutritionist"  || role === "admin";
  const canEditMovement = role === "coach"         || role === "admin";
  const canEditMedHistory = role === "doctor"      || role === "admin";
  const canSeeMeds = role !== "coach";
  const canEditLabs = role === "doctor" || role === "admin";

  const latestReading = p.readings[0] ?? null;
  const openEscalations = p.escalations.filter((e) => e.status !== "resolved");
  const flaggedReadings = p.readings.filter((r) => r.flag !== "none");
  const mh = p.medicalHistory;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <Link href="/staff" className="font-body text-[12.5px] text-ink-soft hover:underline">
          ← Back to queue
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{p.name ?? "Patient"}</h1>
            {mh && (
              <p className="mt-0.5 font-body text-[13px] text-ink-soft">
                {mh.diabetes_type ? mh.diabetes_type.replace("type", "Type ") : "Diabetes"}
                {mh.diagnosis_year ? ` · diagnosed ${mh.diagnosis_year}` : ""}
                {mh.comorbidities.length > 0 ? ` · ${mh.comorbidities.join(", ")}` : ""}
              </p>
            )}
          </div>
          {/* Key stat chips */}
          <div className="flex flex-wrap gap-2">
            {latestReading && (
              <div className={`rounded-[10px] px-3 py-2 font-body text-[12px] ${latestReading.flag === "urgent" ? "bg-coral/10 border border-coral/30" : latestReading.flag === "routine" ? "bg-mint border border-mint" : "border border-line bg-card"}`}>
                <div className="text-[10px] uppercase tracking-wider text-ink-soft">Last glucose</div>
                <div className={`font-semibold ${latestReading.flag === "urgent" ? "text-coral" : latestReading.flag === "routine" ? "text-primary-deep" : "text-ink"}`}>
                  {latestReading.value_mgdl} mg/dL
                </div>
              </div>
            )}
            {openEscalations.length > 0 && (
              <div className="rounded-[10px] border border-coral/30 bg-coral/10 px-3 py-2 font-body text-[12px]">
                <div className="text-[10px] uppercase tracking-wider text-ink-soft">Open escalations</div>
                <div className="font-semibold text-coral">{openEscalations.length}</div>
              </div>
            )}
            {mh?.allergies && mh.allergies.length > 0 && (
              <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 font-body text-[12px]">
                <div className="text-[10px] uppercase tracking-wider text-red-400">Allergies</div>
                <div className="font-semibold text-red-700">{mh.allergies.join(", ")}</div>
              </div>
            )}
            {p.readings.length === 0 && (
              <div className="rounded-[10px] border border-line bg-card px-3 py-2 font-body text-[12px]">
                <div className="text-[10px] uppercase tracking-wider text-ink-soft">Glucose</div>
                <div className="text-ink-soft">No readings yet</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">

        {/* ── Left: Clinical monitoring ──────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Glucose */}
          <section>
            <h2 className="eyebrow mb-3">Glucose readings</h2>
            <div className="rounded-card border border-line bg-card p-4">
              <PatientGlucoseChart readings={p.readings} />
            </div>

            {flaggedReadings.length > 0 && (
              <div className="mt-3 overflow-x-auto rounded-card border border-line bg-card">
                <table className="w-full min-w-[380px] border-collapse font-body text-[13px]">
                  <thead>
                    <tr className="border-b border-line text-left text-ink-soft">
                      <th className="px-4 py-2.5 font-semibold">Flag</th>
                      <th className="px-4 py-2.5 font-semibold">Value</th>
                      <th className="px-4 py-2.5 font-semibold">Context</th>
                      <th className="px-4 py-2.5 font-semibold">When (PKT)</th>
                      {canEditMeds && <th className="px-4 py-2.5 font-semibold">Review</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {flaggedReadings.map((r) => {
                      const rev = glucoseReviewMap.get(r.id);
                      return (
                        <tr key={r.id} className="border-b border-line last:border-0">
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.flag === "urgent" ? "bg-coral text-white" : "bg-mint text-primary-deep"}`}>
                              {r.flag}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-ink">{r.value_mgdl}</td>
                          <td className="px-4 py-3 text-ink-soft">{r.context}</td>
                          <td className="px-4 py-3 text-ink-soft">{pkt(r.taken_at)}</td>
                          {canEditMeds && (
                            <td className="px-4 py-3">
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

          <LabResults patientId={p.id} results={labResults} canEdit={canEditLabs} />

          <DocumentsPanel patientId={p.id} documents={documents} />

          {/* Escalations — open/acknowledged always visible; resolved collapsed */}
          <section>
            <h2 className="eyebrow mb-3">
              Escalations
              {openEscalations.length > 0 && (
                <span className="ml-2 rounded-full bg-coral px-1.5 py-0.5 font-body text-[10px] font-bold text-white">{openEscalations.length} open</span>
              )}
            </h2>
            {p.escalations.length === 0 ? (
              <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No escalations.</div>
            ) : (() => {
              const active = p.escalations.filter((e) => e.status !== "resolved");
              const resolved = p.escalations.filter((e) => e.status === "resolved");
              const renderRow = (e: typeof p.escalations[0]) => {
                const style = ESCALATION_KIND[e.kind] ?? { label: e.kind, cls: "bg-card text-ink" };
                return (
                  <div key={e.id} className="flex items-center gap-3 rounded-card border border-line bg-card px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 font-body text-[11px] font-bold ${style.cls}`}>{style.label}</span>
                    <span className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${e.status === "resolved" ? "bg-mint text-primary-deep" : e.status === "acknowledged" ? "bg-marigold-soft text-[#9A6A14]" : "bg-line text-ink-soft"}`}>
                      {e.status}
                    </span>
                    <span className="ml-auto font-body text-[11.5px] text-ink-soft">{pkt(e.created_at)}</span>
                  </div>
                );
              };
              return (
                <div className="flex flex-col gap-2">
                  {active.length === 0 && (
                    <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No open escalations.</div>
                  )}
                  {active.map(renderRow)}
                  {resolved.length > 0 && (
                    <details className="group">
                      <summary className="cursor-pointer list-none rounded-card border border-line bg-paper px-4 py-2.5 font-body text-[12px] text-ink-soft hover:text-ink">
                        <span className="group-open:hidden">{resolved.length} resolved — show</span>
                        <span className="hidden group-open:inline">Hide resolved</span>
                      </summary>
                      <div className="mt-2 flex flex-col gap-2">
                        {resolved.map(renderRow)}
                      </div>
                    </details>
                  )}
                </div>
              );
            })()}
          </section>

          {/* Chat */}
          <section>
            <h2 className="eyebrow mb-3">Chat ({chatMessages.length})</h2>
            {chatMessages.length === 0 ? (
              <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No messages yet.</div>
            ) : (
              <div className="flex flex-col gap-2 rounded-card border border-line bg-card p-4">
                {chatMessages.map((m) => {
                  const isPatient = m.sender === "patient";
                  return (
                    <div key={m.id} className={`flex ${isPatient ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-[12px] px-3 py-2 font-body text-[13px] ${isPatient ? "bg-paper text-ink" : "bg-primary text-white"}`}>
                        {!isPatient && (
                          <div className="mb-0.5 text-[10px] font-semibold capitalize opacity-80">{m.sender}</div>
                        )}
                        {m.audio_path ? (
                          <VoicePlayer url={m.signedAudioUrl} light={!isPatient} />
                        ) : (
                          <div className="whitespace-pre-wrap">{toPlainText(m.body as string)}</div>
                        )}
                        <div className={`mt-0.5 text-[10px] ${isPatient ? "text-ink-soft" : "opacity-70"}`}>
                          {pkt(m.created_at as string)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-3">
              <StaffReplyBox patientId={p.id} />
            </div>
          </section>

          {/* Task evidence */}
          {evidence.length > 0 && (
            <section>
              <h2 className="eyebrow mb-3">Task evidence (last 7 days)</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {evidence.map((e) => (
                  <div key={e.id} className="overflow-hidden rounded-card border border-line bg-card">
                    {e.signedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.signedUrl} alt={e.title} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="flex h-28 items-center justify-center bg-card text-[28px]">📷</div>
                    )}
                    <div className="px-2 py-1.5">
                      <div className="font-body text-[12px] font-semibold text-ink">{e.title}</div>
                      <div className="font-body text-[10.5px] text-ink-soft">{e.for_date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right: Care plans & context ───────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Medication */}
          {canEditMeds ? (
            <MedicationEditor patientId={p.id} plan={p.currentPlan} />
          ) : (
            <section>
              <h2 className="eyebrow mb-3">Medication plan</h2>
              <div className="rounded-card border border-line bg-card p-4">
                {p.currentPlan?.medications?.length ? (
                  <ul className="flex flex-col gap-1.5 font-body text-[13px] text-ink">
                    {p.currentPlan.medications.map((m, i) => (
                      <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold">{m.name}</span>
                        <span className="text-ink-soft">{m.dose} · {m.schedule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-body text-[13px] text-ink-soft">No medication plan.</p>
                )}
              </div>
            </section>
          )}

          {/* Meal plan */}
          {canEditMeals ? (
            <MealPlanEditor patientId={p.id} plan={p.currentMealPlan} />
          ) : (
            <section>
              <h2 className="eyebrow mb-3">Meal plan</h2>
              <div className="rounded-card border border-line bg-card p-4">
                {p.currentMealPlan?.meals?.length ? (
                  <ul className="flex flex-col gap-1.5 font-body text-[13px] text-ink">
                    {p.currentMealPlan.meals.map((m, i) => (
                      <li key={i}>
                        <span className="capitalize font-semibold">{m.meal}: </span>
                        <span className="text-ink-soft">{m.description}{m.carb_target_g ? ` (~${m.carb_target_g}g carbs)` : ""}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-body text-[13px] text-ink-soft">No meal plan yet.</p>
                )}
              </div>
            </section>
          )}

          {/* Movement plan */}
          {canEditMovement ? (
            <MovementPlanEditor patientId={p.id} plan={p.currentMovementPlan} />
          ) : (
            <section>
              <h2 className="eyebrow mb-3">Movement plan</h2>
              <div className="rounded-card border border-line bg-card p-4">
                {p.currentMovementPlan?.exercises?.length ? (
                  <ul className="flex flex-col gap-1.5 font-body text-[13px] text-ink">
                    {p.currentMovementPlan.exercises.map((ex, i) => (
                      <li key={i}>
                        <span className="font-semibold">{ex.name}</span>
                        <span className="ml-1.5 text-ink-soft">
                          {[
                            ex.duration_min ? `${ex.duration_min} min` : "",
                            ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.sets ? `${ex.sets} sets` : "",
                            ex.notes ?? "",
                          ].filter(Boolean).join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-body text-[13px] text-ink-soft">No movement plan yet.</p>
                )}
              </div>
            </section>
          )}

          {/* Medical history */}
          {canEditMedHistory ? (
            <MedicalHistoryEditor patientId={p.id} history={p.medicalHistory} />
          ) : (
            <section>
              <h2 className="eyebrow mb-3">Medical history</h2>
              <div className="rounded-card border border-line bg-card p-4">
                {!mh ? (
                  <p className="font-body text-[13px] text-ink-soft">No medical history recorded.</p>
                ) : (
                  <dl className="flex flex-col gap-2 font-body text-[13px]">
                    {mh.diabetes_type && (
                      <div className="flex gap-2">
                        <dt className="w-24 flex-shrink-0 font-semibold text-ink-soft">Type</dt>
                        <dd className="capitalize text-ink">{mh.diabetes_type.replace("type", "Type ")}</dd>
                      </div>
                    )}
                    {mh.diagnosis_year && (
                      <div className="flex gap-2">
                        <dt className="w-24 flex-shrink-0 font-semibold text-ink-soft">Diagnosed</dt>
                        <dd className="text-ink">{mh.diagnosis_year}</dd>
                      </div>
                    )}
                    {mh.allergies.length > 0 && (
                      <div className="flex gap-2">
                        <dt className="w-24 flex-shrink-0 font-semibold text-ink-soft">Allergies</dt>
                        <dd className="flex flex-wrap gap-1">
                          {mh.allergies.map((a) => (
                            <span key={a} className="rounded-full bg-red-50 px-2 py-0.5 text-[11.5px] font-semibold text-red-600">{a}</span>
                          ))}
                        </dd>
                      </div>
                    )}
                    {mh.comorbidities.length > 0 && (
                      <div className="flex gap-2">
                        <dt className="w-24 flex-shrink-0 font-semibold text-ink-soft">Conditions</dt>
                        <dd className="text-ink">{mh.comorbidities.join(", ")}</dd>
                      </div>
                    )}
                    {canSeeMeds && mh.pre_existing_meds.length > 0 && (
                      <div className="flex gap-2">
                        <dt className="w-24 flex-shrink-0 font-semibold text-ink-soft">Prior meds</dt>
                        <dd className="flex flex-col gap-0.5">
                          {mh.pre_existing_meds.map((m, i) => (
                            <span key={i} className="text-ink">{m.name}{m.dose ? ` — ${m.dose}` : ""}{m.frequency ? ` (${m.frequency})` : ""}</span>
                          ))}
                        </dd>
                      </div>
                    )}
                    {mh.notes && (
                      <div className="flex gap-2">
                        <dt className="w-24 flex-shrink-0 font-semibold text-ink-soft">Notes</dt>
                        <dd className="text-ink">{mh.notes}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </section>
          )}

          {/* Consult bookings */}
          <section>
            <h2 className="eyebrow mb-3">Booked consults</h2>
            {p.bookings.length === 0 ? (
              <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No bookings.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {p.bookings.map((b) => {
                  const snap = b.context_snapshot as { readings?: unknown[]; meals?: unknown[] } | null;
                  return (
                    <div key={b.id} className="rounded-card border border-line bg-card p-3.5 font-body text-[13px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-ink">{b.slot_time}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.status === "confirmed" ? "bg-mint text-primary-deep" : "bg-line text-ink-soft"}`}>
                          {b.status}
                        </span>
                      </div>
                      {b.reason && <div className="mt-1 text-ink-soft">{b.reason}</div>}
                      {snap && (
                        <div className="mt-1.5 font-body text-[11.5px] text-primary-deep">
                          Attached: {snap.readings?.length ?? 0} readings · {snap.meals?.length ?? 0} meals
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
