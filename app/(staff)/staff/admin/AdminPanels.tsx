"use client";

import { useState, useTransition } from "react";
import type { AdminOverview, AdminCohort, Person, AppointmentStat, ReferralCodeRow, ReferralRow } from "@/lib/admin";
import type { AutomationConfigRow } from "@/lib/automation";
import type { PlanFlag } from "@/lib/plan";
import { RESOURCE_LABELS, type ResourceType } from "@/lib/resources-shared";
import { createCohort, assignPod, enrollPatient, setCohortStatus, createResource, toggleResource, inviteStaff, updatePersonName, setPatientPlan, togglePlanFeature, setTemplatePhotoMode, saveAutomationConfig, createReferralCode, toggleReferralCode, markReferralsPaid, saveReferralCodePayment } from "./actions";

// ─── Shared ──────────────────────────────────────────────────────────────────

const field = "rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none";

// ─── Cohorts tab ─────────────────────────────────────────────────────────────

function StaffSelect({ people, role, defaultLabel }: { people: Person[]; role: string; defaultLabel: string }) {
  const opts = people.filter((p) => p.role === role || p.role === "admin");
  return (
    <>
      <option value="">{defaultLabel}</option>
      {opts.map((p) => (
        <option key={p.id} value={p.id}>{p.name ?? p.id.slice(0, 8)}</option>
      ))}
    </>
  );
}

function CohortCard({ c, staff, patients }: { c: AdminCohort; staff: Person[]; patients: Person[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState(c.status);
  const [doc, setDoc] = useState("");
  const [nut, setNut] = useState("");
  const [coa, setCoa] = useState("");
  const [enrollId, setEnrollId] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [weight, setWeight] = useState("");
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [targetNotes, setTargetNotes] = useState("");

  const savePod = () =>
    start(async () => {
      const r = await assignPod(c.id, doc || null, nut || null, coa || null);
      setMsg(r.ok ? "Pod saved." : r.error ?? "Failed.");
    });
  const enroll = () =>
    start(async () => {
      if (!enrollId) return;
      const r = await enrollPatient(
        c.id, enrollId,
        hba1c ? parseFloat(hba1c) : null,
        weight ? parseFloat(weight) : null,
        fastingGlucose ? parseInt(fastingGlucose, 10) : null,
        targetNotes || null
      );
      setMsg(r.ok ? "Enrolled." : r.error ?? "Failed.");
      if (r.ok) { setEnrollId(""); setHba1c(""); setWeight(""); setFastingGlucose(""); setTargetNotes(""); }
    });

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-body text-[15px] font-bold text-ink">{c.name}</div>
          <div className="font-body text-[11.5px] text-ink-soft">
            starts {c.start_date} · {c.memberCount} members · pod: {c.doctor ?? "—"} / {c.nutritionist ?? "—"} / {c.coach ?? "—"}
          </div>
        </div>
        <select
          value={localStatus}
          onChange={(e) => {
            const v = e.target.value as "enrolling" | "active" | "completed";
            setLocalStatus(v);
            start(() => setCohortStatus(c.id, v).then(() => {}));
          }}
          className={field}
        >
          <option value="enrolling">enrolling</option>
          <option value="active">active</option>
          <option value="completed">completed</option>
        </select>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <select value={doc} onChange={(e) => setDoc(e.target.value)} className={field}><StaffSelect people={staff} role="doctor" defaultLabel="Doctor…" /></select>
        <select value={nut} onChange={(e) => setNut(e.target.value)} className={field}><StaffSelect people={staff} role="nutritionist" defaultLabel="Nutritionist…" /></select>
        <select value={coa} onChange={(e) => setCoa(e.target.value)} className={field}><StaffSelect people={staff} role="coach" defaultLabel="Coach…" /></select>
        <button onClick={savePod} disabled={pending} className="rounded-full bg-primary px-4 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50">Save pod</button>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <select value={enrollId} onChange={(e) => setEnrollId(e.target.value)} className={field}>
          <option value="">Enroll a patient…</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name ?? p.id.slice(0, 8)}</option>)}
        </select>
        <button onClick={enroll} disabled={pending || !enrollId} className="rounded-full border border-line bg-paper px-4 py-2 font-body text-[13px] font-bold text-ink disabled:opacity-50">Enroll</button>
      </div>
      {enrollId && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Baseline HbA1c % (optional)
            <input type="number" step="0.1" value={hba1c} onChange={(e) => setHba1c(e.target.value)} placeholder="e.g. 8.2" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Baseline weight kg (optional)
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 82.5" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Baseline fasting glucose mg/dL (optional)
            <input type="number" step="1" value={fastingGlucose} onChange={(e) => setFastingGlucose(e.target.value)} placeholder="e.g. 145" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Target notes (optional)
            <input type="text" value={targetNotes} onChange={(e) => setTargetNotes(e.target.value)} placeholder="e.g. aim HbA1c < 6.5% by day 90" className={field} />
          </label>
        </div>
      )}
      {msg && <p className="mt-2 font-body text-[12px] text-primary-deep">{msg}</p>}
    </div>
  );
}

function AppointmentStats({ stats }: { stats: AppointmentStat[] }) {
  if (!stats.length) return null;
  return (
    <section>
      <h2 className="eyebrow mb-3">Appointments by care role</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.role} className="rounded-card border border-line bg-card p-4">
            <div className="font-body text-[11px] uppercase tracking-wider text-primary-deep">{s.label}</div>
            <div className="mt-1 font-display text-[28px] font-bold text-ink">{s.total}</div>
            <div className="mt-1 flex gap-3 font-body text-[12px] text-ink-soft">
              <span>{s.upcoming} upcoming</span>
              <span>{s.completed} completed</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CohortsTab({ overview }: { overview: AdminOverview }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const make = () =>
    startT(async () => {
      const r = await createCohort(name, startDate);
      setMsg(r.ok ? "Cohort created." : r.error ?? "Failed.");
      if (r.ok) { setName(""); setStartDate(""); }
    });

  return (
    <>
      <section>
        <h2 className="eyebrow mb-3">Create cohort</h2>
        <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-card p-4">
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Monsoon cohort" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Start date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
          </label>
          <button onClick={make} disabled={pending || !name || !startDate} className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50">Create</button>
          {msg && <span className="font-body text-[12.5px] text-primary-deep">{msg}</span>}
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-3">Cohorts & enrollment</h2>
        <div className="flex flex-col gap-3">
          {overview.cohorts.length === 0 ? (
            <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No cohorts yet.</div>
          ) : (
            overview.cohorts.map((c) => <CohortCard key={c.id} c={c} staff={overview.staff} patients={overview.patients} />)
          )}
        </div>
      </section>

      <AppointmentStats stats={overview.appointmentStats} />
    </>
  );
}

// ─── Staff tab ────────────────────────────────────────────────────────────────

const STAFF_ROLES = ["doctor", "nutritionist", "coach"];

function InviteForm() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("doctor");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const send = () =>
    start(async () => {
      const r = await inviteStaff(email, role, name, phone);
      setMsg(r.ok ? `Invite sent to ${email}.` : r.error ?? "Failed.");
      if (r.ok) { setEmail(""); setName(""); setPhone(""); }
    });

  return (
    <section>
      <h2 className="eyebrow mb-3">Invite staff member</h2>
      <div className="rounded-card border border-line bg-card p-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Zainab Ali" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="zainab@clinic.pk" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Phone (optional)
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 …" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Role
            <select value={role} onChange={(e) => setRole(e.target.value)} className={field}>
              {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={send} disabled={pending || !email.trim() || !name.trim()} className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50">
            Send invite
          </button>
          {msg && <span className="font-body text-[12.5px] text-primary-deep">{msg}</span>}
        </div>
        <p className="mt-2 font-body text-[11.5px] text-ink-soft">
          Staff receive a magic-link email. Their role is pre-assigned and they set a name on first login.
        </p>
      </div>
    </section>
  );
}

function PeopleList({ people, showPlan }: { people: Person[]; showPlan?: boolean }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [names, setNames] = useState<Record<string, string>>(
    Object.fromEntries(people.map((p) => [p.id, p.name ?? ""]))
  );

  const save = (id: string) =>
    start(async () => {
      await updatePersonName(id, draftName);
      setNames((prev) => ({ ...prev, [id]: draftName }));
      setEditing(null);
    });

  return (
    <div className="flex flex-col gap-1.5">
      {people.length === 0 && (
        <div className="rounded-card border border-line bg-card p-3 font-body text-[13px] text-ink-soft">None yet.</div>
      )}
      {people.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3 rounded-card border border-line bg-card px-3.5 py-2.5">
          {editing === p.id ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save(p.id)}
                className="flex-1 rounded-[8px] border border-line bg-paper px-2 py-1 font-body text-[13px] text-ink outline-none"
                autoFocus
              />
              <button onClick={() => save(p.id)} disabled={pending} className="rounded-full bg-primary px-3 py-1 font-body text-[12px] font-bold text-white disabled:opacity-50">Save</button>
              <button onClick={() => setEditing(null)} className="font-body text-[12px] text-ink-soft">Cancel</button>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <span className="font-body text-[13.5px] font-semibold text-ink">{names[p.id] || "(no name)"}</span>
                <span className="ml-2 font-body text-[11px] text-ink-soft">{p.role}</span>
              </div>
              <div className="flex items-center gap-2">
                {showPlan && (
                  <select
                    defaultValue={p.plan ?? "basic"}
                    onChange={(e) => start(() => setPatientPlan(p.id, e.target.value as "basic" | "plus" | "premium").then(() => {}))}
                    disabled={pending}
                    className="rounded-[8px] border border-line bg-paper px-2 py-1 font-body text-[12px] text-ink outline-none"
                  >
                    <option value="basic">Basic</option>
                    <option value="plus">Plus</option>
                    <option value="premium">Premium</option>
                  </select>
                )}
                <button onClick={() => { setEditing(p.id); setDraftName(p.name ?? ""); }} className="font-body text-[12px] text-ink-soft hover:text-ink">Edit</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function StaffTab({ overview }: { overview: AdminOverview }) {
  return (
    <>
      <InviteForm />
      <section>
        <h2 className="eyebrow mb-3">Staff ({overview.staff.length})</h2>
        <PeopleList people={overview.staff} />
      </section>
    </>
  );
}

// ─── Patients tab ─────────────────────────────────────────────────────────────

function PatientsTab({ overview }: { overview: AdminOverview }) {
  return (
    <section>
      <h2 className="eyebrow mb-3">Patients ({overview.patients.length})</h2>
      <PeopleList people={overview.patients} showPlan />
    </section>
  );
}

// ─── Plans tab ────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = { basic: "Basic", plus: "Plus", premium: "Premium" };
const PLANS = ["basic", "plus", "premium"] as const;

function PlanFeaturesTable({ flags }: { flags: PlanFlag[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const features = Array.from(
    new Map(flags.map((f) => [f.feature_key, { key: f.feature_key, label: f.label }])).values()
  ).sort((a, b) => {
    const aOrd = flags.find((f) => f.feature_key === a.key)?.sort_order ?? 99;
    const bOrd = flags.find((f) => f.feature_key === b.key)?.sort_order ?? 99;
    return aOrd - bOrd;
  });

  const stateMap = new Map(flags.map((f) => [`${f.plan}:${f.feature_key}`, f.enabled]));
  const [local, setLocal] = useState<Map<string, boolean>>(new Map(stateMap));

  const toggle = (plan: string, key: string, enabled: boolean) => {
    setLocal((prev) => new Map(prev).set(`${plan}:${key}`, enabled));
    start(async () => {
      const r = await togglePlanFeature(plan, key, enabled);
      setMsg(r.ok ? null : r.error ?? "Failed.");
    });
  };

  return (
    <section>
      <h2 className="eyebrow mb-3">Feature flags</h2>
      <div className="rounded-card border border-line bg-card p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse font-body text-[13px]">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="p-2.5 font-semibold text-ink">Feature</th>
                {PLANS.map((p) => (
                  <th key={p} className="p-2.5 text-center font-semibold text-ink">{PLAN_LABELS[p]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feat) => (
                <tr key={feat.key} className="border-b border-line last:border-0">
                  <td className="p-2.5 text-ink">{feat.label}</td>
                  {PLANS.map((plan) => {
                    const enabled = local.get(`${plan}:${feat.key}`) ?? false;
                    return (
                      <td key={plan} className="p-2.5 text-center">
                        <button
                          onClick={() => toggle(plan, feat.key, !enabled)}
                          disabled={pending}
                          className={`h-5 w-9 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-line"} disabled:opacity-60`}
                        >
                          <span className={`block h-4 w-4 mx-0.5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg && <p className="mt-2 font-body text-[12px] text-red-500">{msg}</p>}
        <p className="mt-3 font-body text-[11.5px] text-ink-soft">
          Changes take effect immediately — patients see updated features on their next page load.
        </p>
      </div>
    </section>
  );
}

const PLAN_FEATURES: Record<string, { glucometerPhotoRequired: boolean; aiMealAnalysis: boolean; aiCoach: boolean }> = {
  basic:   { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true },
  plus:    { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true },
  premium: { glucometerPhotoRequired: false, aiMealAnalysis: true, aiCoach: true },
};

function PlansTab({ flags }: { flags: PlanFlag[] }) {
  return (
    <>
      <PlanFeaturesTable flags={flags} />

      <section>
        <h2 className="eyebrow mb-3">Plan overview</h2>
        <p className="mb-3 font-body text-[12.5px] text-ink-soft">
          Feature gating lives in <code className="rounded bg-mint px-1">lib/plan.ts</code>. Enrollment sets a patient&apos;s plan; these flags then drive behavior.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const f = PLAN_FEATURES[plan];
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
    </>
  );
}

// ─── Resources tab ────────────────────────────────────────────────────────────

const RESOURCE_TYPES: ResourceType[] = ["book", "research", "video", "exercise_plan", "article", "recipe"];

function ResourcesTab({ resources }: { resources: AdminOverview["resources"] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [items, setItems] = useState(resources);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ResourceType>("article");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");

  const add = () =>
    start(async () => {
      const r = await createResource({ title, type, description, url, tags });
      setMsg(r.ok ? "Resource added." : r.error ?? "Failed.");
      if (r.ok) { setTitle(""); setDescription(""); setUrl(""); setTags(""); }
    });

  const toggle = (id: string, currentActive: boolean) =>
    start(async () => {
      await toggleResource(id, !currentActive);
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !currentActive } : r));
    });

  return (
    <>
      <section>
        <h2 className="eyebrow mb-3">Add resource</h2>
        <div className="rounded-card border border-line bg-card p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft sm:col-span-2">Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Life Without Diabetes" className={field} />
            </label>
            <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Type
              <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className={field}>
                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{RESOURCE_LABELS[t]}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">URL (optional)
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={field} />
            </label>
            <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft sm:col-span-2">Description
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One-line description" className={field} />
            </label>
            <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft sm:col-span-2">Tags (comma-separated)
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="nutrition, glucose, exercise" className={field} />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={add} disabled={pending || !title} className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50">Add resource</button>
            {msg && <span className="font-body text-[12.5px] text-primary-deep">{msg}</span>}
          </div>
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-3">Library ({items.length})</h2>
        {items.length > 0 && (
          <div className="flex flex-col gap-2">
            {items.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-card border border-line bg-card px-4 py-2.5">
                <div>
                  <span className="font-body text-[11px] uppercase tracking-wider text-primary-deep">{RESOURCE_LABELS[r.type as ResourceType]}</span>
                  <div className="font-body text-[13px] font-bold text-ink">{r.title}</div>
                </div>
                <button
                  onClick={() => toggle(r.id, r.is_active)}
                  disabled={pending}
                  className={`rounded-full px-3 py-1 font-body text-[12px] font-semibold ${r.is_active ? "border border-line text-ink-soft" : "bg-primary-deep text-white"}`}
                >
                  {r.is_active ? "Hide" : "Show"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ─── Templates tab ────────────────────────────────────────────────────────────

const PHOTO_MODE_LABELS = { off: "Off", optional: "Optional", required: "Required" } as const;
const PHOTO_MODES = ["off", "optional", "required"] as const;

function TemplateRow({
  tpl,
  pending,
  onSave,
}: {
  tpl: AdminOverview["templates"][number];
  pending: boolean;
  onSave: (id: string, mode: "off" | "optional" | "required", bonus: number) => void;
}) {
  const [mode, setMode] = useState(tpl.photo_mode);
  const [bonus, setBonus] = useState(String(tpl.photo_points_bonus));

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    onSave(tpl.id, newMode, Math.max(0, Number(bonus) || 0));
  };

  const handleBonusBlur = () => {
    const b = Math.max(0, Number(bonus) || 0);
    if (b !== tpl.photo_points_bonus) onSave(tpl.id, mode, b);
  };

  return (
    <tr className="border-b border-line last:border-0">
      <td className="p-3 text-ink-soft">{tpl.phase}</td>
      <td className="p-3 text-ink-soft">{tpl.kind}</td>
      <td className="p-3 font-semibold text-ink">{tpl.title}</td>
      <td className="p-3">
        <select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as typeof mode)}
          disabled={pending}
          className="rounded-[8px] border border-line bg-paper px-2 py-1 font-body text-[12px] text-ink outline-none disabled:opacity-50"
        >
          {PHOTO_MODES.map((m) => (
            <option key={m} value={m}>{PHOTO_MODE_LABELS[m]}</option>
          ))}
        </select>
      </td>
      <td className="p-3">
        <input
          type="number" min={0} max={50} value={bonus}
          onChange={(e) => setBonus(e.target.value)}
          onBlur={handleBonusBlur}
          disabled={mode === "required" || pending}
          className="w-16 rounded-[8px] border border-line bg-paper px-2 py-1 font-body text-[12px] text-ink outline-none disabled:opacity-40"
        />
      </td>
    </tr>
  );
}

function TemplatesTab({ templates }: { templates: AdminOverview["templates"] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const save = (id: string, mode: "off" | "optional" | "required", bonus: number) =>
    start(async () => {
      const r = await setTemplatePhotoMode(id, mode, bonus);
      setMsg(r.ok ? "Saved." : r.error ?? "Failed.");
      setTimeout(() => setMsg(null), 2000);
    });

  return (
    <section>
      <h2 className="eyebrow mb-1">Photo evidence</h2>
      <p className="mb-3 font-body text-[11.5px] text-ink-soft">
        <strong>Required</strong> — patient must submit a photo to complete the task.&nbsp;
        <strong>Optional</strong> — checkbox still works; camera earns bonus points.&nbsp;
        <strong>Off</strong> — no photo feature.
      </p>
      <div className="overflow-x-auto rounded-card border border-line bg-card">
        <table className="w-full min-w-[620px] border-collapse font-body text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="p-3 font-semibold">Ph</th>
              <th className="p-3 font-semibold">Kind</th>
              <th className="p-3 font-semibold">Title</th>
              <th className="p-3 font-semibold">Photo mode</th>
              <th className="p-3 font-semibold">Bonus pts</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <TemplateRow key={tpl.id} tpl={tpl} pending={pending} onSave={save} />
            ))}
          </tbody>
        </table>
      </div>
      {msg && <p className="mt-2 font-body text-[12px] text-primary-deep">{msg}</p>}
    </section>
  );
}

// ─── Automation tab ───────────────────────────────────────────────────────────

const GROUP_LABELS: Record<string, string> = {
  messages: "Message Templates",
  destinations: "Notification Destinations",
  thresholds: "Thresholds",
  general: "General Settings",
};

function ConfigRow({ row }: { row: AutomationConfigRow }) {
  const [val, setVal] = useState(row.value);
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const dirty = val !== row.value;

  const isMessage = row.group_name === "messages";
  const isThreshold = row.group_name === "thresholds";

  const save = () =>
    startT(async () => {
      const r = await saveAutomationConfig(row.key, val);
      setMsg(r.ok ? "Saved." : r.error ?? "Failed.");
    });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-[12px] font-semibold text-ink">{row.label}</span>
        {msg && <span className="font-body text-[11px] text-primary-deep">{msg}</span>}
      </div>
      {row.description && (
        <p className="font-body text-[11px] text-ink-soft">{row.description}</p>
      )}
      {isMessage ? (
        <textarea
          value={val}
          onChange={(e) => { setVal(e.target.value); setMsg(null); }}
          rows={4}
          className={`${field} resize-y w-full`}
        />
      ) : (
        <input
          type={isThreshold ? "number" : "text"}
          value={val}
          onChange={(e) => { setVal(e.target.value); setMsg(null); }}
          className={`${field} w-full`}
        />
      )}
      <button
        onClick={save}
        disabled={pending || !dirty}
        className="self-start rounded-full bg-primary px-4 py-1.5 font-body text-[12px] font-bold text-white disabled:opacity-40"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function AutomationTab({ rows }: { rows: AutomationConfigRow[] }) {
  // Referral payout amount is shown in the Referrals tab — exclude from here
  const filteredRows = rows.filter((r) => r.key !== "referral_payout_pkr");

  if (filteredRows.length === 0) {
    return (
      <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
        Run migration 25 to enable automation configuration.
      </div>
    );
  }

  const byGroup = filteredRows.reduce<Record<string, AutomationConfigRow[]>>((acc, r) => {
    (acc[r.group_name] ??= []).push(r);
    return acc;
  }, {});

  const groupOrder = ["messages", "destinations", "thresholds", "general"];
  const groups = groupOrder.filter((g) => byGroup[g] && byGroup[g].length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group}>
          <h2 className="eyebrow mb-3">{GROUP_LABELS[group] ?? group}</h2>
          <div className="rounded-card border border-line bg-card p-4">
            <div className="flex flex-col gap-5">
              {byGroup[group].map((row) => (
                <ConfigRow key={row.key} row={row} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Referrals tab ───────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { value: "jazzcash",      label: "JazzCash" },
  { value: "easypaisa",     label: "Easypaisa" },
  { value: "bank_transfer", label: "Bank transfer (IBAN)" },
  { value: "other",         label: "Other" },
];

function NewCodeForm({ staff }: { staff: Person[] }) {
  const [pending, startT] = useTransition();
  const [referrerId, setReferrerId] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerContact, setPartnerContact] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const submit = () =>
    startT(async () => {
      const r = await createReferralCode(
        referrerId || null,
        partnerName.trim() || null,
        partnerContact.trim() || null,
        notes.trim() || null,
        null, null, null,
      );
      if (r.ok) {
        setResult(`Code created: ${r.code} — add payment info in the table below.`);
        setReferrerId(""); setPartnerName(""); setPartnerContact(""); setNotes("");
      } else {
        setResult(r.error ?? "Failed.");
      }
    });

  const L = "font-body text-[11px] font-semibold uppercase tracking-wider text-ink-soft";

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <h3 className="mb-3 font-body text-[13px] font-semibold text-ink">Create referral code</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={L}>Assign to staff member</label>
          <select value={referrerId} onChange={(e) => setReferrerId(e.target.value)} className={`${field} w-full`}>
            <option value="">— External partner —</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name ?? s.id} ({s.role})</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={L}>Partner name (for code prefix)</label>
          <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Dr. Ahmed / Clinic name" className={`${field} w-full`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={L}>Contact (WhatsApp / phone)</label>
          <input type="text" value={partnerContact} onChange={(e) => setPartnerContact(e.target.value)} placeholder="+92 300 …" className={`${field} w-full`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={L}>Notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Clinic location, specialty…" className={`${field} w-full`} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={submit} disabled={pending} className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50">
          {pending ? "Creating…" : "Generate code"}
        </button>
        {result && <span className={`font-body text-[12.5px] ${result.startsWith("Code") ? "text-primary-deep font-semibold" : "text-red-600"}`}>{result}</span>}
      </div>
    </div>
  );
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  bank_transfer: "Bank transfer",
  other: "Other",
};

function InlinePaymentEdit({ rc }: { rc: ReferralCodeRow }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState(rc.payment_method ?? "");
  const [title, setTitle] = useState(rc.account_title ?? "");
  const [number, setNumber] = useState(rc.account_number ?? "");
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const save = () =>
    startT(async () => {
      const r = await saveReferralCodePayment(rc.id, method || null, title.trim() || null, number.trim() || null);
      if (r.ok) { setMsg("Saved."); setOpen(false); }
      else setMsg(r.error ?? "Failed.");
    });

  if (!open) {
    if (!rc.payment_method) {
      return (
        <button onClick={() => setOpen(true)} className="font-body text-[12px] text-primary underline">
          Add payment info
        </button>
      );
    }
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-body text-[12px] font-semibold text-ink">
          {PAYMENT_METHOD_LABEL[rc.payment_method] ?? rc.payment_method}
        </span>
        {rc.account_title && <span className="font-body text-[11px] text-ink-soft">{rc.account_title}</span>}
        {rc.account_number && <span className="font-mono text-[11px] text-primary-deep">{rc.account_number}</span>}
        <button onClick={() => setOpen(true)} className="self-start font-body text-[11px] text-primary underline">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <select value={method} onChange={(e) => setMethod(e.target.value)} className={`${field} w-full text-[12px]`}>
        <option value="">— Method —</option>
        {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Account holder name"
        className={`${field} w-full text-[12px]`}
      />
      <input
        type="text"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder={method === "bank_transfer" ? "IBAN (PK36SCBL…)" : "Mobile number (03XX…)"}
        className={`${field} w-full text-[12px]`}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-primary px-3 py-1 font-body text-[11px] font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button onClick={() => { setOpen(false); setMsg(null); }} className="font-body text-[11px] text-ink-soft underline">
          Cancel
        </button>
        {msg && <span className="font-body text-[11px] text-red-600">{msg}</span>}
      </div>
    </div>
  );
}

function ReferralCodesTable({ codes }: { codes: ReferralCodeRow[] }) {
  const [pending, startT] = useTransition();
  const [items, setItems] = useState(codes);

  if (!items.length) {
    return <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No codes yet. Create one above.</div>;
  }

  const pendingTotal = items.reduce((s, c) => s + c.pending_pkr, 0);

  return (
    <div>
      {pendingTotal > 0 && (
        <div className="mb-3 rounded-[10px] bg-amber-50 border border-amber-200 px-4 py-2.5 font-body text-[13px] text-amber-800">
          PKR {pendingTotal.toLocaleString()} pending across all partners this cycle.
        </div>
      )}
      <div className="overflow-x-auto rounded-card border border-line bg-card">
        <table className="w-full min-w-[820px] border-collapse">
          <thead className="border-b border-line bg-paper">
            <tr>
              {["Code", "Partner", "Payment info", "Referrals", "Pending", "Paid", "Status"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-body text-[11px] uppercase tracking-wider text-ink-soft">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((rc) => (
              <tr key={rc.id} className="hover:bg-paper/60">
                <td className="px-4 py-3 font-body text-[13px]">
                  <span className="rounded-full bg-mint px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary-deep">{rc.code}</span>
                </td>
                <td className="px-4 py-3 font-body text-[13px] text-ink">
                  <div className="font-semibold">{rc.referrer_name ?? rc.partner_name ?? "—"}</div>
                  {rc.partner_contact && <div className="text-[11px] text-ink-soft">{rc.partner_contact}</div>}
                  {rc.notes && <div className="text-[11px] text-ink-soft">{rc.notes}</div>}
                </td>
                <td className="px-4 py-3"><InlinePaymentEdit rc={rc} /></td>
                <td className="px-4 py-3 font-body text-[13px] text-ink font-semibold">{rc.referral_count}</td>
                <td className="px-4 py-3 font-body text-[13px]">
                  {rc.pending_count > 0
                    ? <span className="font-semibold text-amber-600">PKR {rc.pending_pkr.toLocaleString()} ({rc.pending_count})</span>
                    : <span className="text-ink-soft">—</span>}
                </td>
                <td className="px-4 py-3 font-body text-[13px] text-primary-deep">
                  {rc.paid_count > 0 ? `PKR ${rc.paid_pkr.toLocaleString()} (${rc.paid_count})` : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => startT(async () => {
                      await toggleReferralCode(rc.id, !rc.is_active);
                      setItems((prev) => prev.map((c) => c.id === rc.id ? { ...c, is_active: !rc.is_active } : c));
                    })}
                    disabled={pending}
                    className={`rounded-full px-3 py-1 font-body text-[11px] font-semibold ${rc.is_active ? "bg-mint text-primary-deep" : "bg-line text-ink-soft"}`}
                  >
                    {rc.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReferralPayoutsTable({ referrals }: { referrals: ReferralRow[] }) {
  const [items, setItems] = useState(referrals);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const pendingRows = items.filter((r) => r.payout_status === "pending");
  const paidRows = items.filter((r) => r.payout_status === "paid");

  const toggleAll = () =>
    setSelected(selected.size === pendingRows.length ? new Set() : new Set(pendingRows.map((r) => r.id)));

  const markPaid = () =>
    startT(async () => {
      const ids = Array.from(selected);
      const r = await markReferralsPaid(ids);
      setMsg(r.ok ? `Marked ${selected.size} paid.` : r.error ?? "Failed.");
      if (r.ok) {
        const now = new Date().toISOString();
        setItems((prev) => prev.map((row) => selected.has(row.id) ? { ...row, payout_status: "paid" as const, paid_at: now } : row));
      }
      setSelected(new Set());
    });

  return (
    <div className="flex flex-col gap-3">
      {pendingRows.length > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="font-body text-[12px] text-primary underline">
            {selected.size === pendingRows.length ? "Deselect all" : "Select all pending"}
          </button>
          <button
            onClick={markPaid}
            disabled={pending || selected.size === 0}
            className="rounded-full bg-primary px-4 py-1.5 font-body text-[12px] font-bold text-white disabled:opacity-40"
          >
            {pending ? "Marking…" : `Mark ${selected.size} paid`}
          </button>
          {msg && <span className="font-body text-[12px] text-primary-deep">{msg}</span>}
        </div>
      )}
      <div className="overflow-x-auto rounded-card border border-line bg-card">
        <table className="w-full min-w-[600px] border-collapse">
          <thead className="border-b border-line bg-paper">
            <tr>
              <th className="w-10 px-4 py-2.5" />
              {["Code", "Referrer", "Patient", "Enrolled", "Amount", "Status"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-body text-[11px] uppercase tracking-wider text-ink-soft">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((r) => (
              <tr key={r.id} className={`hover:bg-paper/60 ${selected.has(r.id) ? "bg-mint/30" : ""}`}>
                <td className="px-4 py-3">
                  {r.payout_status === "pending" && (
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        e.target.checked ? next.add(r.id) : next.delete(r.id);
                        setSelected(next);
                      }}
                      className="h-4 w-4 rounded border-line accent-primary"
                    />
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] font-bold text-primary-deep">{r.code}</td>
                <td className="px-4 py-3 font-body text-[13px] text-ink">{r.referrer_name ?? "—"}</td>
                <td className="px-4 py-3 font-body text-[13px] text-ink">{r.patient_name ?? "—"}</td>
                <td className="px-4 py-3 font-body text-[12px] text-ink-soft">
                  {r.enrolled_at ? new Date(r.enrolled_at).toLocaleDateString("en-PK") : "—"}
                </td>
                <td className="px-4 py-3 font-body text-[13px] font-semibold text-ink">PKR {r.payout_pkr.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {r.payout_status === "paid"
                    ? <span className="rounded-full bg-mint px-2 py-0.5 font-body text-[11px] font-semibold text-primary-deep">Paid {r.paid_at ? new Date(r.paid_at).toLocaleDateString("en-PK") : ""}</span>
                    : <span className="rounded-full bg-amber-100 px-2 py-0.5 font-body text-[11px] font-semibold text-amber-700">Pending</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paidRows.length > 0 && pendingRows.length > 0 && (
        <p className="font-body text-[11px] text-ink-soft">{paidRows.length} paid rows shown below pending.</p>
      )}
    </div>
  );
}

function ReferralsTab({
  codes,
  referrals,
  staff,
  payoutConfig,
}: {
  codes: ReferralCodeRow[];
  referrals: ReferralRow[];
  staff: Person[];
  payoutConfig?: AutomationConfigRow;
}) {
  const totalPending = codes.reduce((s, c) => s + c.pending_pkr, 0);
  const totalPaid = codes.reduce((s, c) => s + c.paid_pkr, 0);
  const payoutPkr = payoutConfig ? parseInt(payoutConfig.value, 10) || 2000 : 2000;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-card border border-line bg-card p-4 text-center">
          <div className="font-display text-2xl font-semibold text-ink">{codes.length}</div>
          <div className="mt-0.5 font-body text-[12px] text-ink-soft">Referral codes</div>
        </div>
        <div className="rounded-card border border-line bg-card p-4 text-center">
          <div className="font-display text-2xl font-semibold text-ink">{referrals.length}</div>
          <div className="mt-0.5 font-body text-[12px] text-ink-soft">Total referrals</div>
        </div>
        <div className="rounded-card border border-line bg-card p-4 text-center">
          <div className="font-display text-2xl font-semibold text-amber-600">PKR {totalPending.toLocaleString()}</div>
          <div className="mt-0.5 font-body text-[12px] text-ink-soft">Pending payouts</div>
        </div>
        <div className="rounded-card border border-line bg-card p-4 text-center">
          <div className="font-display text-2xl font-semibold text-primary-deep">PKR {totalPaid.toLocaleString()}</div>
          <div className="mt-0.5 font-body text-[12px] text-ink-soft">Paid out (all time)</div>
        </div>
      </div>

      <section>
        <h2 className="eyebrow mb-3">Payout settings</h2>
        <div className="rounded-card border border-line bg-card p-4">
          {payoutConfig ? (
            <ConfigRow row={payoutConfig} />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-body text-[13px] font-semibold text-ink">Payout per patient</div>
                <div className="mt-0.5 font-body text-[12px] text-ink-soft">Amount paid to a referring partner per enrolled patient.</div>
              </div>
              <div className="font-display text-[22px] font-semibold text-primary-deep">
                PKR {payoutPkr.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-3">Referral codes</h2>
        <div className="flex flex-col gap-3">
          <NewCodeForm staff={staff} />
          <ReferralCodesTable codes={codes} />
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-3">Payout ledger</h2>
        {referrals.length === 0
          ? <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No referrals recorded yet.</div>
          : <ReferralPayoutsTable referrals={referrals} />}
      </section>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export type Tab = "cohorts" | "staff" | "patients" | "plans" | "resources" | "templates" | "automation" | "referrals";

export function AdminPanels({ overview, tab }: { overview: AdminOverview; tab: Tab }) {
  const payoutConfig = overview.automationConfig.find((r) => r.key === "referral_payout_pkr");

  return (
    <div className="flex flex-col gap-6">
      {tab === "cohorts"    && <CohortsTab overview={overview} />}
      {tab === "staff"      && <StaffTab overview={overview} />}
      {tab === "patients"   && <PatientsTab overview={overview} />}
      {tab === "plans"      && <PlansTab flags={overview.planFlags} />}
      {tab === "resources"  && <ResourcesTab resources={overview.resources} />}
      {tab === "templates"  && <TemplatesTab templates={overview.templates} />}
      {tab === "automation" && <AutomationTab rows={overview.automationConfig} />}
      {tab === "referrals"  && (
        <ReferralsTab
          codes={overview.referralCodes}
          referrals={overview.referrals}
          staff={overview.staff}
          payoutConfig={payoutConfig}
        />
      )}
    </div>
  );
}
