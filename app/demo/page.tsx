// Demo portal switcher — restricted to @sehat90.app seed accounts only.
const ACCOUNTS = [
  { role: "Doctor", email: "demo.doctor@sehat90.app", name: "Dr. Ayesha Rahman", desc: "Escalation queue, flagged readings, patient timelines, medication editor, consults." },
  { role: "Nutritionist", email: "demo.nutritionist@sehat90.app", name: "Sana Iqbal", desc: "Staff dashboard scoped to the nutritionist." },
  { role: "Coach", email: "demo.coach@sehat90.app", name: "Faisal Khan", desc: "Staff dashboard scoped to the movement coach." },
  { role: "Admin", email: "demo.admin@sehat90.app", name: "Program Admin", desc: "Create cohorts, assign pods, enroll patients, view program templates & plans." },
  { role: "Patient (lead)", email: "demo.imran@sehat90.app", name: "Imran Ali", desc: "Full patient app: dial, tasks, coach, care, cohort, progress — 5 weeks of data." },
  { role: "Patient", email: "demo.nadia@sehat90.app", name: "Nadia Saeed", desc: "Another cohort member." },
];

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-2 font-display text-2xl font-semibold text-ink">
        Loop<span className="text-marigold">/90</span> demo
      </div>
      <p className="mb-6 font-body text-[13.5px] text-ink-soft">
        Click a role to sign in as that seeded account and tour their portal.
        Run <code className="rounded bg-mint px-1">node scripts/seed.mjs</code> first if these are empty.
      </p>

      <div className="flex flex-col gap-3">
        {ACCOUNTS.map((a) => (
          <a
            key={a.email}
            href={`/api/demo-login?email=${encodeURIComponent(a.email)}`}
            className="flex items-center justify-between rounded-card border border-line bg-card p-4 hover:border-primary"
          >
            <div>
              <div className="font-body text-[14px] font-bold text-ink">
                {a.role} · <span className="font-normal text-ink-soft">{a.name}</span>
              </div>
              <div className="mt-0.5 font-body text-[12px] text-ink-soft">{a.desc}</div>
            </div>
            <span className="rounded-full bg-primary px-4 py-2 font-body text-[13px] font-bold text-white">
              Enter →
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}
