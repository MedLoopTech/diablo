"use client";

import { useState, useTransition } from "react";
import type { AdminOverview, AdminCohort, Person } from "@/lib/admin";
import { RESOURCE_LABELS, type ResourceType } from "@/lib/resources-shared";
import { createCohort, assignPod, enrollPatient, setCohortStatus, createResource, toggleResource, inviteStaff, updatePersonName } from "./actions";

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
        weight ? parseFloat(weight) : null
      );
      setMsg(r.ok ? "Enrolled." : r.error ?? "Failed.");
      if (r.ok) { setEnrollId(""); setHba1c(""); setWeight(""); }
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

function PeoplePanel({ people, title }: { people: Person[]; title: string }) {
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
          <div key={p.id} className="flex items-center justify-between rounded-card border border-line bg-card px-3.5 py-2.5">
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
                <div>
                  <span className="font-body text-[13.5px] font-semibold text-ink">{p.name ?? "(no name)"}</span>
                  <span className="ml-2 font-body text-[11px] text-ink-soft">{p.role}</span>
                </div>
                <button onClick={() => { setEditing(p.id); setDraftName(p.name ?? ""); }} className="font-body text-[12px] text-ink-soft hover:text-ink">Edit</button>
              </>
            )}
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

      <InviteStaffPanel />

      <PeoplePanel people={overview.staff} title="Staff" />

      <PeoplePanel people={overview.patients} title="Patients" />

      <ResourcesPanel resources={overview.resources} />

      <section>
        <h2 className="eyebrow mb-3">Program templates ({overview.templates.length})</h2>
        <div className="overflow-x-auto rounded-card border border-line bg-card">
          <table className="w-full min-w-[520px] border-collapse font-body text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-ink-soft">
                <th className="p-3 font-semibold">Phase</th><th className="p-3 font-semibold">Kind</th><th className="p-3 font-semibold">Title</th><th className="p-3 font-semibold">Subtitle</th>
              </tr>
            </thead>
            <tbody>
              {overview.templates.map((tpl) => (
                <tr key={tpl.id} className="border-b border-line last:border-0">
                  <td className="p-3 text-ink-soft">{tpl.phase}</td>
                  <td className="p-3 text-ink-soft">{tpl.kind}</td>
                  <td className="p-3 font-semibold text-ink">{tpl.title}</td>
                  <td className="p-3 text-ink-soft">{tpl.subtitle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
