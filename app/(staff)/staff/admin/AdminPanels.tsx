"use client";

import { useState, useTransition } from "react";
import type { AdminOverview, AdminCohort, Person } from "@/lib/admin";
import { createCohort, assignPod, enrollPatient, setCohortStatus } from "./actions";

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

  const savePod = () =>
    start(async () => {
      const r = await assignPod(c.id, doc || null, nut || null, coa || null);
      setMsg(r.ok ? "Pod saved." : r.error ?? "Failed.");
    });
  const enroll = () =>
    start(async () => {
      if (!enrollId) return;
      const r = await enrollPatient(c.id, enrollId);
      setMsg(r.ok ? "Enrolled." : r.error ?? "Failed.");
      if (r.ok) setEnrollId("");
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
      {msg && <p className="mt-2 font-body text-[12px] text-primary-deep">{msg}</p>}
    </div>
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
