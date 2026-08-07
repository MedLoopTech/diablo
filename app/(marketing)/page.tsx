import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { LeadForm } from "@/components/marketing/LeadForm";

export const metadata = {
  title: "90 Days to Diabetes Remission — Loop/90",
  description:
    "A doctor-led 90-day cohort program for type-2 diabetes remission, built around real Pakistani food. One doctor, one nutritionist, one coach, one AI — per cohort.",
};

const PROGRAM_PRICE_PKR = 25000;
const INSTALLMENT_PKR = 8500; // 3x — small installment premium over the one-time price

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-3xl px-5 py-14 ${className}`}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{children}</div>;
}

export default function MarketingLanding() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="font-display text-[20px] font-semibold text-primary-deep">
            Loop<span className="text-marigold">/</span>90
          </div>
          <Link href="/login" className="font-body text-[13px] font-semibold text-ink-soft hover:text-ink">
            Log in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <Section className="text-center">
        <Eyebrow>90-day cohort program</Eyebrow>
        <h1 className="mt-3 text-balance font-display text-[34px] font-semibold leading-tight text-ink sm:text-[42px]">
          A real shot at diabetes remission — built for a Pakistani kitchen
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance font-body text-[16px] leading-relaxed text-ink-soft">
          One doctor, one nutritionist, one movement coach, and an always-on AI coach — shared
          across your cohort. No quinoa bowls. Roti, daal, biryani — everything, worked into a
          plan that fits your kitchen.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <a
            href="#pricing"
            className="rounded-full bg-primary px-8 py-3.5 font-body text-[15px] font-bold text-white"
          >
            Reserve Your Spot — PKR {PROGRAM_PRICE_PKR.toLocaleString()}
          </a>
          <a href="#lead-form" className="font-body text-[13px] font-semibold text-primary-deep underline underline-offset-2">
            Or get the free Desi Diabetes Plate Guide first
          </a>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            ["30–50", "patients per cohort"],
            ["90", "days to remission goal"],
            ["3+1", "care pod + AI"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-card border border-line bg-card p-4">
              <div className="font-display text-[22px] font-semibold text-primary-deep">{n}</div>
              <div className="mt-0.5 font-body text-[11.5px] text-ink-soft">{l}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Problem */}
      <Section className="border-t border-line bg-card">
        <Eyebrow>The problem with what's out there</Eyebrow>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ["😔", "You're not alone, but it feels like it", "Generic apps give you calorie counts. Your doctor sees you once every 3 months. No one's there on the days you actually struggle."],
            ["🍛", "Western diets don't work here", "“Eat quinoa bowls” — but your family eats roti, daal, and biryani. You need a plan built for a Pakistani kitchen."],
            ["💊", "Pills feel like the only option", "No one told you that lifestyle change, done properly and with a doctor watching, can put type-2 diabetes into remission."],
          ].map(([icon, title, body]) => (
            <div key={title as string} className="rounded-card border border-line bg-paper p-5">
              <div className="text-[24px]">{icon}</div>
              <div className="mt-2 font-body text-[14px] font-bold text-ink">{title}</div>
              <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 90-day path */}
      <Section>
        <Eyebrow>Your 90-day path</Eyebrow>
        <h2 className="mt-2 font-display text-[24px] font-semibold text-ink">Three phases. One goal. Measurable checkpoints.</h2>
        <div className="mt-6 flex flex-col gap-4">
          {[
            ["1", "Baseline", "Days 1–14", "Log everything — glucose, meals, steps. No diet overhaul yet. Your care pod observes your patterns and your AI coach learns your routine while we establish your baseline HbA1c, weight, and fasting glucose."],
            ["2", "Intervention", "Days 15–60", "A meal plan built for your kitchen. Daily movement targets. A medication review with your doctor around day 45 — your doctor adjusts your plan, your nutritionist reviews your meal photos, your coach keeps you moving."],
            ["3", "Stabilization", "Days 61–90", "You self-manage with AI nudges as coaching intensity tapers. A day-90 HbA1c lab confirms your progress. You graduate with a maintenance plan and an alumni community."],
          ].map(([n, title, days, body]) => (
            <div key={title as string} className="flex gap-4 rounded-card border border-line bg-card p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint font-display text-[15px] font-bold text-primary-deep">{n}</div>
              <div>
                <div className="flex items-baseline gap-2">
                  <div className="font-body text-[14px] font-bold text-ink">{title}</div>
                  <div className="font-body text-[11.5px] text-ink-soft">{days}</div>
                </div>
                <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Care pod */}
      <Section className="border-t border-line bg-card">
        <Eyebrow>Your care pod</Eyebrow>
        <h2 className="mt-2 font-display text-[24px] font-semibold text-ink">
          One doctor. One nutritionist. One coach. One AI. All focused on your cohort.
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["👨‍⚕️", "Your Doctor", "Reviews your glucose trends and handles every medication decision — always your doctor's call, never the AI's."],
            ["🥗", "Your Nutritionist", "Builds your meal plan around real Pakistani food — roti, daal, sabzi, biryani, everything — and reviews your meal photos."],
            ["🧘", "Your Movement Coach", "Group sessions, walking targets fit to your level, and home strength routines. No gym, no equipment needed."],
            ["🤖", "Your AI Coach", "Answers questions anytime, analyzes meal photos, and nudges you to log. Never suggests medication — that's always routed to your doctor."],
          ].map(([icon, title, body]) => (
            <div key={title as string} className="rounded-card border border-line bg-paper p-5">
              <div className="text-[22px]">{icon}</div>
              <div className="mt-2 font-body text-[14px] font-bold text-ink">{title}</div>
              <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Understand your numbers */}
      <Section>
        <Eyebrow>Understand your numbers</Eyebrow>
        <h2 className="mt-2 font-display text-[24px] font-semibold text-ink">What the ranges mean</h2>
        <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">
          These are general reference ranges, not a diagnosis — only a lab test and your doctor can tell you where you actually stand.
        </p>
        <div className="mt-5 overflow-x-auto rounded-card border border-line bg-card">
          <table className="w-full min-w-[480px] border-collapse">
            <thead className="border-b border-line bg-paper">
              <tr>
                {["", "Normal", "Prediabetes", "Diabetes"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-body text-[11px] uppercase tracking-wider text-ink-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-body text-[13px] text-ink">
              <tr>
                <td className="px-4 py-3 font-semibold">Fasting glucose</td>
                <td className="px-4 py-3">Below 100 mg/dL</td>
                <td className="px-4 py-3">100–125 mg/dL</td>
                <td className="px-4 py-3">126 mg/dL or above</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">HbA1c</td>
                <td className="px-4 py-3">Below 5.7%</td>
                <td className="px-4 py-3">5.7%–6.4%</td>
                <td className="px-4 py-3">6.5% or above</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-body text-[11.5px] text-ink-soft">
          Source: American Diabetes Association Standards of Care. A single reading doesn&apos;t confirm anything — diagnosis needs a lab test read by a doctor.
        </p>
        <div className="mt-5 rounded-card border border-line bg-mint p-4 text-center">
          <p className="font-body text-[13.5px] text-primary-deep">
            Not sure where you stand? Ask your doctor about a fasting glucose or HbA1c test — or start logging real readings once you join a cohort.
          </p>
        </div>
      </Section>

      {/* Our promise */}
      <Section className="border-t border-line bg-card">
        <Eyebrow>Our promise to you</Eyebrow>
        <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-soft">
          We&apos;ve seen too many people burned by fake herbal cures and useless supplements.
          Here&apos;s exactly what you get — and exactly what we guarantee.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {[
            ["Doctor-led care pod", "Not an AI chatbot. A real endocrinologist, nutritionist, and coach assigned to your cohort."],
            ["Lab-verified HbA1c at day 0 and day 90", "We don't guess, we measure. Both tests are bundled into the price — no extra cost."],
            [`Money-back guarantee`, `Complete 80% of your daily tasks and log at least 5 glucose readings a week. If your day-90 HbA1c hasn't improved by at least 0.5%, your full PKR ${PROGRAM_PRICE_PKR.toLocaleString()} is refunded within 48 hours.`],
            [`PKR ${PROGRAM_PRICE_PKR.toLocaleString()} total — no hidden fees`, "No subscriptions, no surprise charges. One price covers the full 90-day program, both lab tests, and every consult with your care pod. Pay via Easypaisa, JazzCash, or bank transfer."],
          ].map(([title, body]) => (
            <div key={title} className="flex gap-3 rounded-card border border-line bg-paper p-4">
              <span className="mt-0.5 text-primary">✓</span>
              <div>
                <div className="font-body text-[13.5px] font-bold text-ink">{title}</div>
                <p className="mt-0.5 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing">
        <Eyebrow>Join a cohort</Eyebrow>
        <h2 className="mt-2 font-display text-[24px] font-semibold text-ink">Your journey starts here</h2>
        <div className="mt-6 rounded-card border-2 border-primary bg-card p-6">
          <div className="font-body text-[13px] font-semibold uppercase tracking-wide text-primary-deep">Loop/90 full program</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[36px] font-semibold text-ink">PKR {PROGRAM_PRICE_PKR.toLocaleString()}</span>
            <span className="font-body text-[13px] text-ink-soft">one-time</span>
          </div>
          <div className="mt-1 font-body text-[12.5px] text-ink-soft">
            or 3 monthly installments of PKR {INSTALLMENT_PKR.toLocaleString()}
          </div>
          <ul className="mt-5 flex flex-col gap-2">
            {[
              "Both HbA1c lab tests + 90 days of care",
              "Personalized meal plan, built around desi food",
              "Daily glucose logging with AI analysis",
              "Weekly group sessions with your care pod",
              "Meal photo analysis and swap suggestions",
              "Day-0 and day-90 lab-verified HbA1c",
              "Cohort feed, leaderboard, and challenges",
              "Money-back guarantee",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 font-body text-[13.5px] text-ink">
                <span className="mt-0.5 text-primary">✓</span> {f}
              </li>
            ))}
          </ul>
          <a
            href="#lead-form"
            className="mt-6 block rounded-full bg-primary px-6 py-3.5 text-center font-body text-[15px] font-bold text-white"
          >
            Reserve My Spot
          </a>
          <div className="mt-3 flex items-center justify-center gap-3 font-body text-[11.5px] text-ink-soft">
            <span>Easypaisa</span> · <span>JazzCash</span> · <span>Bank transfer</span>
          </div>
        </div>
      </Section>

      {/* Lead form */}
      <Section id="lead-form" className="border-t border-line bg-card">
        <div className="mx-auto max-w-md text-center">
          <Eyebrow>Not ready yet?</Eyebrow>
          <h2 className="mt-2 font-display text-[22px] font-semibold text-ink">
            Get the free Desi Diabetes Plate Guide
          </h2>
          <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">
            Practical portion and pairing guidance for everyday Pakistani meals — sent straight to
            your WhatsApp.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-sm">
          <LeadForm interest="guide" />
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <Eyebrow>Questions, answered</Eyebrow>
        <div className="mt-4 flex flex-col divide-y divide-line rounded-card border border-line bg-card">
          {[
            [
              "What exactly is “diabetes remission”?",
              "Remission means your HbA1c drops below 6.5% and stays there without needing to increase your medication. It's not a cure — diabetes can return if old habits come back. But remission is clinically documented and measurable. We use the word “remission” in all our patient-facing materials, never “cure.”",
            ],
            [
              "Do I have to stop eating roti and rice?",
              "No. Your nutritionist builds your plan around the food you actually eat — roti, daal, sabzi, biryani, everything. The goal isn't elimination, it's timing, portion, and pairing. No quinoa bowls required.",
            ],
            [
              "Can my doctor still manage my medication?",
              "Absolutely. Loop/90 works with your existing doctor, not instead of them. Your pod doctor reviews your glucose trends and may recommend adjustments — but only your personal doctor can actually change your prescription. All data is shared with you and your doctor through the app.",
            ],
            [
              "What if I don't improve? Do I really get a refund?",
              "Yes. Complete 80% of your assigned tasks and log at least 5 glucose readings a week — if your day-90 HbA1c hasn't improved by at least 0.5%, we refund your full program fee within 48 hours. No forms, no arguments.",
            ],
            [
              "Is this safe? What about low blood sugar?",
              "Safety is the first principle. A reading below 70 or above 250 mg/dL immediately flags your pod doctor and shows you emergency guidance. Our AI coach never suggests medication changes — anything about symptoms, dizziness, chest pain, or pregnancy is instantly routed to your doctor. We're a support system, not a replacement for medical care.",
            ],
            [
              "What happens after the 90 days?",
              "You graduate into the Loop/90 alumni community, keep access to your data and meal plan, and can keep using the AI coach for basic questions. Your journey doesn't end at day 90.",
            ],
          ].map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer list-none font-body text-[14px] font-bold text-ink">
                {q}
              </summary>
              <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-line bg-card">
        <Section className="py-10">
          <div className="font-display text-[18px] font-semibold text-primary-deep">
            Loop<span className="text-marigold">/</span>90
          </div>
          <p className="mt-2 max-w-xl font-body text-[12.5px] leading-relaxed text-ink-soft">
            A 90-day cohort-based lifestyle medicine program for type-2 diabetes remission. Built
            in Pakistan, for Pakistan.
          </p>
          <div className="mt-6">
            <Disclaimer />
          </div>
          <p className="mt-4 font-body text-[11.5px] leading-relaxed text-ink-soft">
            Loop/90 is a lifestyle education and care coordination program, not a substitute for
            medical treatment. All medication decisions remain with your personal physician.
            Individual results vary. The money-back guarantee applies only to patients who meet
            the stated eligibility criteria.
          </p>
          <div className="mt-4 font-body text-[12px] text-ink-soft">
            <a href="mailto:hello@loop90.pk" className="underline underline-offset-2">hello@loop90.pk</a>
          </div>
        </Section>
      </footer>
    </div>
  );
}
