"use client";

import { useState, useTransition } from "react";
import type { AdminOverview, AdminCohort, Person, AppointmentStat } from "@/lib/admin";
import type { AutomationConfigRow } from "@/lib/automation";
import type { PlanFlag } from "@/lib/plan";
import { RESOURCE_LABELS, type ResourceType } from "@/lib/resources-shared";
import { createCohort, assignPod, enrollPatient, setCohortStatus, createResource, toggleResource, inviteStaff, updatePersonName, setPatientPlan, togglePlanFeature, setTemplatePhotoMode, saveAutomationConfig } from "./actions";

const field = "rounded-[10px] border border-line bg-paper px-3 py-2 font-body text-[13px] text-ink outline-none";

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
        c.id,
        enrollId,
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
        <select value={c.status} onChange={(e) => start(() => setCohortStatus(c.id, e.target.value as "enrolling" | "active" | "completed").then(() => {}))} className={field}>
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

const STAFF_ROLES = ["doctor", "nutritionist", "coach"];

function InviteStaffPanel() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("doctor");
  const [name, setName] = useState("");

  const send = () =>
    start(async () => {
      const r = await inviteStaff(email, role, name);
      setMsg(r.ok ? `Invite sent to ${email}.` : r.error ?? "Failed.");
      if (r.ok) { setEmail(""); setName(""); }
    });

  return (
    <section>
      <h2 className="eyebrow mb-3">Invite staff member</h2>
      <div className="rounded-card border border-line bg-card p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Zainab Ali" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="zainab@clinic.pk" className={field} />
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

function PeoplePanel({ people, title, showPlan }: { people: Person[]; title: string; showPlan?: boolean }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const save = (id: string) =>
    start(async () => {
      await updatePersonName(id, draftName);
      setEditing(null);
    });

  return (
    <section>
      <h2 className="eyebrow mb-3">{title} ({people.length})</h2>
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
                  <span className="font-body text-[13.5px] font-semibold text-ink">{p.name ?? "(no name)"}</span>
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
    </section>
  );
}

const PLAN_LABELS: Record<string, string> = { basic: "Basic", plus: "Plus", premium: "Premium" };
const PLANS = ["basic", "plus", "premium"] as const;

function PlanFeaturesPanel({ flags }: { flags: PlanFlag[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  // Build feature list from flags (unique feature_keys, ordered by sort_order)
  const features = Array.from(
    new Map(flags.map((f) => [f.feature_key, { key: f.feature_key, label: f.label }])).values()
  ).sort((a, b) => {
    const aOrd = flags.find((f) => f.feature_key === a.key)?.sort_order ?? 99;
    const bOrd = flags.find((f) => f.feature_key === b.key)?.sort_order ?? 99;
    return aOrd - bOrd;
  });

  // Map plan+key → enabled
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
      <h2 className="eyebrow mb-3">Plan feature configuration</h2>
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

function AppointmentStatsPanel({ stats }: { stats: AppointmentStat[] }) {
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

const RESOURCE_TYPES: ResourceType[] = ["book", "research", "video", "exercise_plan", "article", "recipe"];

function ResourcesPanel({ resources }: { resources: AdminOverview["resources"] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
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

  return (
    <section>
      <h2 className="eyebrow mb-3">Resource library ({resources.length})</h2>
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

      {resources.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {resources.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-card border border-line bg-card px-4 py-2.5">
              <div>
                <span className="font-body text-[11px] uppercase tracking-wider text-primary-deep">{RESOURCE_LABELS[r.type as ResourceType]}</span>
                <div className="font-body text-[13px] font-bold text-ink">{r.title}</div>
              </div>
              <button
                onClick={() => start(() => toggleResource(r.id, !r.is_active).then(() => {}))}
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
  );
}

const PHOTO_MODE_LABELS = { off: "Off", optional: "Optional", required: "Required" } as const;
const PHOTO_MODES = ["off", "optional", "required"] as const;

function TaskTemplatesPanel({ templates }: { templates: AdminOverview["templates"] }) {
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
      <h2 className="eyebrow mb-1">Program templates — photo evidence</h2>
      <p className="mb-3 font-body text-[11.5px] text-ink-soft">
        <strong>Required</strong> — patient must submit a photo to complete the task.&nbsp;
        <strong>Optional</strong> — checkbox still works; camera earns bonus points.&nbsp;
        <strong>Off</strong> — no photo feature on this task.
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
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <TemplateRow
                key={tpl.id}
                tpl={tpl}
                pending={pending}
                onSave={save}
              />
            ))}
          </tbody>
        </table>
      </div>
      {msg && <p className="mt-2 font-body text-[12px] text-primary-deep">{msg}</p>}
    </section>
  );
}

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
  const dirty = mode !== tpl.photo_mode || Number(bonus) !== tpl.photo_points_bonus;

  return (
    <tr className="border-b border-line last:border-0">
      <td className="p-3 text-ink-soft">{tpl.phase}</td>
      <td className="p-3 text-ink-soft">{tpl.kind}</td>
      <td className="p-3 font-semibold text-ink">{tpl.title}</td>
      <td className="p-3">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as typeof mode)}
          className="rounded-[8px] border border-line bg-paper px-2 py-1 font-body text-[12px] text-ink outline-none"
        >
          {PHOTO_MODES.map((m) => (
            <option key={m} value={m}>{PHOTO_MODE_LABELS[m]}</option>
          ))}
        </select>
      </td>
      <td className="p-3">
        <input
          type="number"
          min={0}
          max={50}
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
          disabled={mode === "required"}
          className="w-16 rounded-[8px] border border-line bg-paper px-2 py-1 font-body text-[12px] text-ink outline-none disabled:opacity-40"
        />
      </td>
      <td className="p-3">
        {dirty && (
          <button
            onClick={() => onSave(tpl.id, mode, Math.max(0, Number(bonus) || 0))}
            disabled={pending}
            className="rounded-full bg-primary px-3 py-1 font-body text-[12px] font-bold text-white disabled:opacity-50"
          >
            Save
          </button>
        )}
      </td>
    </tr>
  );
}

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

const GROUP_LABELS: Record<string, string> = {
  messages: "Message Templates",
  destinations: "Notification Destinations",
  thresholds: "Thresholds",
  general: "General Settings",
};

function AutomationPanel({ rows }: { rows: AutomationConfigRow[] }) {
  if (rows.length === 0) return null;

  const byGroup = rows.reduce<Record<string, AutomationConfigRow[]>>((acc, r) => {
    (acc[r.group_name] ??= []).push(r);
    return acc;
  }, {});

  const groupOrder = ["messages", "destinations", "thresholds", "general"];
  const groups = groupOrder.filter((g) => byGroup[g]);

  return (
    <section>
      <h2 className="eyebrow mb-3">Automation Settings</h2>
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group} className="rounded-card border border-line bg-card p-4">
            <h3 className="font-body text-[13px] font-bold text-ink mb-4">{GROUP_LABELS[group] ?? group}</h3>
            <div className="flex flex-col gap-5">
              {byGroup[group].map((row) => (
                <ConfigRow key={row.key} row={row} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminPanels({ overview }: { overview: AdminOverview }) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const make = () =>
    startT(async () => {
      const r = await createCohort(name, start);
      setMsg(r.ok ? "Cohort created." : r.error ?? "Failed.");
      if (r.ok) { setName(""); setStart(""); }
    });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="eyebrow mb-3">Create cohort</h2>
        <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-card p-4">
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Monsoon cohort" className={field} />
          </label>
          <label className="flex flex-col gap-1 font-body text-[11px] text-ink-soft">Start date
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={field} />
          </label>
          <button onClick={make} disabled={pending || !name || !start} className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50">Create</button>
          {msg && <span className="font-body text-[12.5px] text-primary-deep">{msg}</span>}
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-3">Cohorts, pods & enrollment</h2>
        <div className="flex flex-col gap-3">
          {overview.cohorts.length === 0 ? (
            <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">No cohorts yet.</div>
          ) : (
            overview.cohorts.map((c) => <CohortCard key={c.id} c={c} staff={overview.staff} patients={overview.patients} />)
          )}
        </div>
      </section>

      <AppointmentStatsPanel stats={overview.appointmentStats} />

      <InviteStaffPanel />

      <PeoplePanel people={overview.staff} title="Staff" />

      <PeoplePanel people={overview.patients} title="Patients" showPlan />

      <PlanFeaturesPanel flags={overview.planFlags} />

      <ResourcesPanel resources={overview.resources} />

      <TaskTemplatesPanel templates={overview.templates} />

      <AutomationPanel rows={overview.automationConfig} />
    </div>
  );
}
