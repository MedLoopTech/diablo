import Link from "next/link";
import { ProfessionalLeadForm } from "@/components/marketing/ProfessionalLeadForm";
import { Reveal } from "@/components/marketing/Reveal";

// Referral payout is configurable per-deployment (automation_config
// `referral_payout_pkr`); this is the launch default, kept in sync manually
// because the page is public and shouldn't hit the DB on every render.
const REFERRAL_PAYOUT_PKR = 2000;

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-5xl px-5 py-20 sm:px-8 ${className}`}>
      {children}
    </section>
  );
}

function Eyebrow({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "marigold" | "onDark" }) {
  const color = tone === "marigold" ? "text-marigold" : tone === "onDark" ? "text-[#8FB0A3]" : "text-ink-soft";
  return <div className={`font-body text-[12px] font-bold uppercase tracking-[0.16em] ${color}`}>{children}</div>;
}

const ROLES = [
  {
    icon: "🩺",
    title: "Endocrinologists & GPs",
    tag: "Medical lead",
    body: "Review glucose trends, own every medication decision, handle escalations. The AI triages routine questions so you only see what needs a clinician.",
    commitment: "~30 min/day per cohort, in-app",
  },
  {
    icon: "🥗",
    title: "Clinical Nutritionists",
    tag: "Meal architect",
    body: "Build meal plans around roti, daal, and karahi — not quinoa. Review patient meal photos, run weekly group nutrition sessions.",
    commitment: "Remote, flexible hours",
  },
  {
    icon: "🧘",
    title: "Fitness & Movement Coaches",
    tag: "Activity lead",
    body: "Design home-based routines that need no gym or equipment. Run live sessions twice weekly, track step goals, keep the cohort moving.",
    commitment: "2 live sessions/week + async",
  },
];

const PROBLEMS = [
  ["⏱️", "Fifteen-minute consultations", "You barely have time to explain a diet change before the next patient walks in. Real lifestyle counselling takes hours, not minutes."],
  ["📉", "No visibility between visits", "Three to six months pass between appointments. Deteriorating patients don't call — they wait until it's bad, and you find out too late."],
  ["🔁", "Patients relapse anyway", "You write the perfect plan. They nod. Then they go home to the same kitchen and the same habits, with no follow-up system in place."],
];

const PLATFORM = [
  ["📱", "Patients do the logging", "Glucose, meals, weight, and steps come in daily. The AI pre-screens questions and routes anything clinical straight to you."],
  ["📊", "Trends, not guesswork", "Glucose trends, adherence, and risk flags are visualised per patient. You can see who needs attention in about ten seconds."],
  ["💳", "We handle the money", "Patient billing, collection, and support are ours. You don't chase fees, rent a clinic, or pay to acquire patients."],
  ["🔬", "Labs coordinated for you", "Day-0 and day-90 HbA1c tests are booked and tracked by our team, so you're reviewing real numbers, not patient recall."],
];

const PROMISES = [
  ["We never poach your patients", "Loop/90 patients are told explicitly that we're the lifestyle layer and you remain their doctor. Their relationship with their primary physician stays intact."],
  ["Clinical autonomy within protocol", "We provide the framework — HbA1c targets, meal macros, activity guidelines. Every clinical decision inside it is yours. The AI never suggests a medication change."],
  ["No cost to join, ever", "No signup fee, no subscription, no equipment to buy. If anyone asks you to pay to join a care network, that's not us."],
  ["Transparent payouts", "No points, no credits. A direct bank transfer for completed work, with the full breakdown visible in your dashboard."],
];

export function ProfessionalsLanding() {
  return (
    <div className="flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-line bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-display text-[22px] font-semibold text-primary-deep">
            Loop<span className="text-marigold">/90</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#roles" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">Roles</a>
            <a href="#how" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">How it works</a>
            <a href="#refer" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">Refer &amp; earn</a>
          </nav>
          <div className="flex items-center gap-5">
            <Link href="/" className="hidden font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink sm:block">
              For patients
            </Link>
            <a href="#apply" className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white">
              Apply to join
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-frame-dark">
        <div className="mx-auto grid max-w-5xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-28">
          <Reveal>
            <Eyebrow tone="marigold">Now recruiting — Cohort 1 care pods</Eyebrow>
            <h1 className="mt-4 text-balance font-display text-[38px] font-semibold leading-[1.08] text-paper sm:text-[50px] lg:text-[56px]">
              Practise the diabetes care you were actually trained to deliver
            </h1>
            <p className="mt-5 max-w-lg text-balance font-body text-[17px] leading-relaxed text-[#8FB0A3]">
              Loop/90 care pods pair one doctor, one nutritionist, and one movement coach with a cohort of
              30–50 patients for 90 days. We run the operations, the billing, and the patient support.
              You make the clinical calls.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#apply"
                className="rounded-full bg-marigold px-8 py-4 font-body text-[15px] font-bold text-frame-dark shadow-[0_8px_24px_rgba(239,166,60,0.25)]"
              >
                Apply to Join
              </a>
              <a
                href="#refer"
                className="rounded-full border border-[#2A6350] px-6 py-4 font-body text-[14px] font-semibold text-paper hover:border-marigold"
              >
                Just refer patients instead
              </a>
            </div>
            <p className="mt-5 font-body text-[12px] text-[#8FB0A3]">
              Credentials verified before placement · No joining fee · You keep your own practice
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-card border border-[#1E4B3C] bg-[#0C332B] p-7">
              <Eyebrow tone="onDark">A care pod</Eyebrow>
              <div className="mt-5 flex flex-col gap-4">
                {[
                  ["1", "doctor", "medication + escalations"],
                  ["1", "nutritionist", "meal plans + photo review"],
                  ["1", "movement coach", "routines + live sessions"],
                  ["1", "AI coach", "always-on triage layer"],
                ].map(([n, who, what]) => (
                  <div key={who} className="flex items-baseline gap-3 border-b border-[#1E4B3C] pb-3 last:border-0 last:pb-0">
                    <span className="font-display text-[22px] font-semibold text-marigold">{n}</span>
                    <div>
                      <div className="font-body text-[14px] font-bold text-paper">{who}</div>
                      <div className="font-body text-[12px] text-[#8FB0A3]">{what}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[12px] bg-[#0F3E30] px-4 py-3">
                <div className="font-body text-[12px] text-[#C9DED5]">
                  Serving <span className="font-bold text-paper">30–50 patients</span> over{" "}
                  <span className="font-bold text-paper">90 days</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Problem */}
      <Section>
        <Reveal>
          <Eyebrow>Why we built this</Eyebrow>
          <h2 className="mt-3 max-w-xl text-balance font-display text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">
            The medicine isn&apos;t the hard part. The ninety days between visits are.
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {PROBLEMS.map(([icon, title, body], i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="h-full rounded-card border border-line bg-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-mint text-[22px]">{icon}</div>
                <div className="mt-4 font-body text-[15px] font-bold leading-snug text-ink">{title}</div>
                <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Roles */}
      <Section id="roles" className="border-t border-line bg-card">
        <Reveal>
          <Eyebrow>Open roles</Eyebrow>
          <h2 className="mt-3 font-display text-[28px] font-semibold text-ink sm:text-[32px]">Three roles per pod</h2>
          <p className="mt-2 max-w-lg font-body text-[13.5px] leading-relaxed text-ink-soft">
            Compensation is per cohort and discussed at interview — it varies by role, cohort size, and
            how many pods you take on. We&apos;ll give you the exact figure before you commit to anything.
          </p>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <div className="flex h-full flex-col rounded-card border border-line bg-paper p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-mint text-[22px]">{r.icon}</div>
                <div className="mt-4 font-body text-[11px] font-bold uppercase tracking-wide text-primary">{r.tag}</div>
                <div className="mt-1 font-body text-[15px] font-bold leading-snug text-ink">{r.title}</div>
                <p className="mt-2 flex-1 font-body text-[13px] leading-relaxed text-ink-soft">{r.body}</p>
                <div className="mt-4 rounded-[10px] bg-mint px-3 py-2 font-body text-[12px] font-semibold text-primary-deep">
                  {r.commitment}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <section id="how" className="bg-primary-deep">
        <Section>
          <Reveal>
            <Eyebrow tone="marigold">How it works</Eyebrow>
            <h2 className="mt-3 max-w-lg text-balance font-display text-[28px] font-semibold leading-tight text-paper sm:text-[32px]">
              From application to your first cohort
            </h2>
          </Reveal>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {[
              ["Apply and verify", "Submit your credentials. We verify your licence, review your experience, and run a short video interview."],
              ["Protocol training", "A focused session on the Loop/90 protocol, the app, and the escalation rules — including the ones that route to you automatically."],
              ["Get matched to a pod", "You're assigned to a cohort with a nutritionist and a coach. The platform generates your review queues and alerts."],
              ["Deliver care", "Work inside the app: review glucose logs, approve plans, answer escalations, run your sessions. We handle everything else."],
            ].map(([title, body], i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="flex h-full gap-4 rounded-card border border-[#1E4B3C] bg-[#0F3E30] p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marigold font-body text-[14px] font-bold text-frame-dark">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-body text-[14.5px] font-bold text-paper">{title}</div>
                    <p className="mt-1 font-body text-[13px] leading-relaxed text-[#8FB0A3]">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </section>

      {/* Platform */}
      <Section>
        <Reveal>
          <Eyebrow>What the platform handles</Eyebrow>
          <h2 className="mt-3 max-w-lg text-balance font-display text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">
            You bring clinical judgement. We bring the operations.
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {PLATFORM.map(([icon, title, body], i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="flex h-full gap-4 rounded-card border border-line bg-card p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-mint text-[20px]">{icon}</span>
                <div>
                  <div className="font-body text-[14.5px] font-bold text-ink">{title}</div>
                  <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Referral */}
      <Section id="refer" className="border-t border-line bg-card">
        <Reveal>
          <Eyebrow>Too busy for a pod?</Eyebrow>
          <h2 className="mt-3 max-w-lg text-balance font-display text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">
            Refer patients instead. Keep your practice exactly as it is.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-8 grid gap-6 rounded-card border border-line bg-paper p-7 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-col gap-3">
                {[
                  ["Get your code", "Takes a couple of minutes. No credentialing interview needed for referral-only partners."],
                  ["Share it with patients", "Via WhatsApp or in clinic. We handle enrollment, onboarding, and support from there."],
                  ["Get paid per enrollment", "Tracked in your dashboard, paid out on our standard payout cycle."],
                ].map(([t, b], i) => (
                  <div key={t} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-body text-[12px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-body text-[14px] font-bold text-ink">{t}</div>
                      <p className="mt-0.5 font-body text-[13px] leading-relaxed text-ink-soft">{b}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 font-body text-[12.5px] text-ink-soft">
                Their primary care stays with you. Loop/90 only handles the lifestyle layer.
              </p>
            </div>
            <div className="rounded-card bg-frame-dark p-6 text-center sm:w-[210px]">
              <div className="font-display text-[34px] font-semibold text-marigold">
                PKR {REFERRAL_PAYOUT_PKR.toLocaleString()}
              </div>
              <div className="mt-1 font-body text-[12px] leading-snug text-[#8FB0A3]">
                per patient who enrolls with your code
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Promises */}
      <Section>
        <Reveal>
          <Eyebrow>Our promise to professionals</Eyebrow>
          <h2 className="mt-3 max-w-lg text-balance font-display text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">
            You&apos;ve probably been burned by a &ldquo;platform&rdquo; before.
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {PROMISES.map(([title, body], i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="flex h-full gap-3 rounded-card border border-line bg-card p-5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">✓</span>
                <div>
                  <div className="font-body text-[14px] font-bold text-ink">{title}</div>
                  <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Apply */}
      <Section id="apply" className="bg-mint">
        <div className="mx-auto max-w-md text-center">
          <Eyebrow>Apply to the care network</Eyebrow>
          <h2 className="mt-3 font-display text-[26px] font-semibold text-ink sm:text-[30px]">
            Cohort 1 is being staffed now
          </h2>
          <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">
            Tell us your role and how to reach you. We&apos;ll follow up on WhatsApp to verify credentials
            and arrange a short interview.
          </p>
        </div>
        <div className="mx-auto mt-7 max-w-sm rounded-card border border-line bg-card p-6">
          <ProfessionalLeadForm />
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-frame-dark">
        <Section className="py-14">
          <div className="font-display text-[22px] font-semibold text-paper">
            Loop<span className="text-marigold">/90</span>
          </div>
          <p className="mt-2 max-w-md font-body text-[13px] leading-relaxed text-[#8FB0A3]">
            A 90-day cohort lifestyle-medicine program for type-2 diabetes remission, built in Pakistan.
          </p>
          <p className="mt-5 max-w-2xl font-body text-[11.5px] leading-relaxed text-[#6E8F82]">
            Care professionals join Loop/90 as lifestyle advisors within a defined clinical protocol.
            Loop/90 does not replace a patient&apos;s relationship with their primary physician, and does
            not provide professional indemnity insurance — you remain responsible for maintaining your own
            cover and practising within your licence. Compensation terms are confirmed in writing before
            any placement.
          </p>
          <Link href="/" className="mt-5 inline-block font-body text-[12.5px] font-bold text-marigold hover:underline">
            ← Loop/90 for patients
          </Link>
        </Section>
      </footer>
    </div>
  );
}
