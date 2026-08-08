import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { LeadModalProvider, LeadCta } from "@/components/marketing/LeadModal";
import { MobileNav } from "@/components/marketing/MobileNav";
import { loadConfig } from "@/lib/automation";

// Fallback if automation_config hasn't been seeded — matches the number used
// across the original marketing assets.
const DEFAULT_CONTACT_WHATSAPP = "923452739406";
import { GlucoseDial } from "@/components/marketing/GlucoseDial";
import { JourneyPath } from "@/components/marketing/JourneyPath";
import { Reveal } from "@/components/marketing/Reveal";

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
    <section id={id} className={`mx-auto max-w-5xl px-5 py-20 sm:px-8 ${className}`}>
      {children}
    </section>
  );
}

function Eyebrow({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "marigold" | "onDark" }) {
  const color = tone === "marigold" ? "text-marigold" : tone === "onDark" ? "text-[#8FB0A3]" : "text-ink-soft";
  return <div className={`font-body text-[12px] font-bold uppercase tracking-[0.16em] ${color}`}>{children}</div>;
}

export async function MarketingLanding() {
  const cfg = await loadConfig();
  const contactWhatsapp = cfg.contact_whatsapp || DEFAULT_CONTACT_WHATSAPP;

  return (
    <LeadModalProvider contactWhatsapp={contactWhatsapp} persona="patient">
    <div className="flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-line bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="font-display text-[22px] font-semibold text-primary-deep">
            Loop<span className="text-marigold">/90</span>
          </div>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#path" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">
              Your path
            </a>
            <a href="#care-pod" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">
              Care pod
            </a>
            <a href="#evidence" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">
              Evidence
            </a>
            <a href="#pricing" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">
              Pricing
            </a>
            <a href="#faq" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">
              FAQ
            </a>
            <Link href="/professionals" className="font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink">
              For clinicians
            </Link>
          </nav>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/login" className="hidden font-body text-[13.5px] font-semibold text-ink-soft hover:text-ink sm:block">
              Log in
            </Link>
            <a
              href="#pricing"
              className="hidden rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white sm:block"
            >
              Reserve your spot
            </a>
            <MobileNav
              links={[
                { label: "Your path", href: "#path" },
                { label: "Care pod", href: "#care-pod" },
                { label: "Evidence", href: "#evidence" },
                { label: "Pricing", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
                { label: "For clinicians", href: "/professionals" },
              ]}
              extra={
                <>
                  <Link href="/login" className="font-body text-[15px] font-semibold text-ink">
                    Log in
                  </Link>
                  <a
                    href="#pricing"
                    className="rounded-full bg-primary px-5 py-3 text-center font-body text-[14px] font-bold text-white"
                  >
                    Reserve your spot
                  </a>
                </>
              }
            />
          </div>
        </div>
      </header>

      {/* Hero — dark, editorial, with the real product visual */}
      <section className="bg-frame-dark">
        <div className="mx-auto grid max-w-5xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
          <Reveal>
            <Eyebrow tone="marigold">90-day cohort program</Eyebrow>
            <h1 className="mt-4 text-balance font-display text-[40px] font-semibold leading-[1.08] text-paper sm:text-[52px] lg:text-[58px]">
              A real shot at diabetes remission — built for a Pakistani kitchen
            </h1>
            <p className="mt-5 max-w-lg text-balance font-body text-[17px] leading-relaxed text-[#8FB0A3]">
              One doctor, one nutritionist, one movement coach, and an always-on AI coach — shared
              across your cohort. No quinoa bowls. Roti, daal, biryani, everything — worked into a
              plan that fits your kitchen.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="rounded-full bg-marigold px-8 py-4 font-body text-[15px] font-bold text-frame-dark shadow-[0_8px_24px_rgba(239,166,60,0.25)]"
              >
                Reserve Your Spot
              </a>
              <LeadCta className="rounded-full border border-[#2A6350] px-6 py-4 font-body text-[14px] font-semibold text-paper hover:border-marigold">
                Get the free Plate Guide
              </LeadCta>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-[#1E4B3C] pt-8">
              {[
                ["30–50", "patients / cohort"],
                ["90", "days to remission"],
                ["3+1", "care pod + AI"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-[26px] font-semibold text-paper">{n}</div>
                  <div className="mt-0.5 font-body text-[11.5px] text-[#8FB0A3]">{l}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Phone-frame product visual */}
          <Reveal delay={150}>
            <div className="mx-auto w-full max-w-[320px] rounded-[36px] border-[6px] border-[#1E4B3C] bg-[#0C332B] p-5 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between">
                <Eyebrow tone="onDark">Glucose horizon · today</Eyebrow>
                <span className="rounded-full bg-[#1E4B3C] px-2.5 py-1 font-body text-[10.5px] font-bold text-mint">75% in range</span>
              </div>
              <GlucoseDial />
              <div className="mt-2 flex items-center gap-2 rounded-[14px] bg-[#0F3E30] px-3.5 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-marigold text-[13px] text-frame-dark">✦</span>
                <p className="font-body text-[11.5px] leading-snug text-[#C9DED5]">
                  Your post-lunch reading is trending high — a short walk before 4pm usually helps.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Problem */}
      <Section>
        <Reveal>
          <Eyebrow>The problem with what's out there</Eyebrow>
          <h2 className="mt-3 max-w-lg text-balance font-display text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">
            Generic advice was never going to work for a desi kitchen
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[
            ["😔", "You're not alone, but it feels like it", "Generic apps give you calorie counts. Your doctor sees you once every 3 months. No one's there on the days you actually struggle."],
            ["🍛", "Western diets don't work here", "“Eat quinoa bowls” — but your family eats roti, daal, and biryani. You need a plan built for a Pakistani kitchen."],
            ["💊", "Pills feel like the only option", "No one told you that lifestyle change, done properly and with a doctor watching, can put type-2 diabetes into remission."],
          ].map(([icon, title, body], i) => (
            <Reveal key={title as string} delay={i * 100}>
              <div className="h-full rounded-card border border-line bg-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-mint text-[22px]">{icon}</div>
                <div className="mt-4 font-body text-[15px] font-bold leading-snug text-ink">{title}</div>
                <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 90-day path */}
      <Section id="path" className="border-t border-line bg-card">
        <Reveal>
          <Eyebrow>Your 90-day path</Eyebrow>
          <h2 className="mt-3 font-display text-[28px] font-semibold text-ink sm:text-[32px]">Three phases. One goal. Measurable checkpoints.</h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-10 rounded-card border border-line bg-paper p-6 sm:p-10">
            <JourneyPath />
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Baseline", "Days 1–14", "Log everything — glucose, meals, steps. No diet overhaul yet. We establish your baseline HbA1c, weight, and fasting glucose."],
            ["Intervention", "Days 15–60", "A meal plan built for your kitchen, daily movement targets, and a medication review with your doctor around day 45."],
            ["Stabilization", "Days 61–90", "You self-manage with AI nudges as coaching tapers. A day-90 HbA1c lab confirms your progress."],
          ].map(([title, days, body]) => (
            <div key={title} className="rounded-card border border-line bg-card p-5">
              <div className="flex items-baseline gap-2">
                <div className="font-display text-[16px] font-bold text-primary-deep">{title}</div>
                <div className="font-body text-[11.5px] text-ink-soft">{days}</div>
              </div>
              <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Care pod — dark section for rhythm */}
      <section id="care-pod" className="bg-primary-deep">
        <Section>
          <Reveal>
            <Eyebrow tone="marigold">Your care pod</Eyebrow>
            <h2 className="mt-3 max-w-lg text-balance font-display text-[28px] font-semibold leading-tight text-paper sm:text-[32px]">
              One doctor. One nutritionist. One coach. One AI. All focused on your cohort.
            </h2>
          </Reveal>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {[
              ["👨‍⚕️", "Your Doctor", "Reviews your glucose trends and handles every medication decision — always your doctor's call, never the AI's."],
              ["🥗", "Your Nutritionist", "Builds your meal plan around real Pakistani food — roti, daal, sabzi, biryani, everything — and reviews your meal photos."],
              ["🧘", "Your Movement Coach", "Group sessions, walking targets fit to your level, and home strength routines. No gym, no equipment needed."],
              ["🤖", "Your AI Coach", "Answers questions anytime, analyzes meal photos, and nudges you to log. Never suggests medication — that's always routed to your doctor."],
            ].map(([icon, title, body], i) => (
              <Reveal key={title as string} delay={i * 80}>
                <div className="flex h-full gap-4 rounded-card border border-[#1E4B3C] bg-[#0F3E30] p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-[20px]">{icon}</span>
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

      {/* Understand your numbers */}
      <Section>
        <Reveal>
          <Eyebrow>Understand your numbers</Eyebrow>
          <h2 className="mt-3 font-display text-[28px] font-semibold text-ink sm:text-[32px]">What the ranges mean</h2>
          <p className="mt-2 max-w-lg font-body text-[13.5px] leading-relaxed text-ink-soft">
            General reference ranges, not a diagnosis — only a lab test and your doctor can tell you where you actually stand.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Normal", "primary", "Below 100 mg/dL", "Below 5.7%"],
            ["Prediabetes", "marigold", "100–125 mg/dL", "5.7%–6.4%"],
            ["Diabetes", "coral", "126 mg/dL or above", "6.5% or above"],
          ].map(([label, tone, fasting, hba1c], i) => (
            <Reveal key={label as string} delay={i * 90}>
              <div
                className={`h-full rounded-card border-l-4 border border-line bg-card p-5 ${
                  tone === "primary" ? "border-l-primary" : tone === "marigold" ? "border-l-marigold" : "border-l-coral"
                }`}
              >
                <div className="font-body text-[14px] font-bold text-ink">{label}</div>
                <div className="mt-3 font-body text-[11px] uppercase tracking-wide text-ink-soft">Fasting glucose</div>
                <div className="mt-0.5 font-display text-[17px] font-semibold text-ink">{fasting}</div>
                <div className="mt-3 font-body text-[11px] uppercase tracking-wide text-ink-soft">HbA1c</div>
                <div className="mt-0.5 font-display text-[17px] font-semibold text-ink">{hba1c}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 font-body text-[11.5px] text-ink-soft">
          Source: American Diabetes Association Standards of Care. A single reading doesn&apos;t confirm anything — diagnosis needs a lab test read by a doctor.
        </p>
        <div className="mt-5 rounded-card border border-line bg-mint p-4 text-center">
          <p className="font-body text-[13.5px] text-primary-deep">
            Not sure where you stand? Ask your doctor about a fasting glucose or HbA1c test — or start logging real readings once you join a cohort.
          </p>
        </div>
      </Section>

      {/* Evidence — what the research and clinical bodies actually say */}
      <Section id="evidence" className="border-t border-line bg-card">
        <Reveal>
          <Eyebrow>The evidence</Eyebrow>
          <h2 className="mt-3 max-w-lg text-balance font-display text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">
            What the research and clinical bodies actually say
          </h2>
          <p className="mt-2 max-w-lg font-body text-[13.5px] leading-relaxed text-ink-soft">
            Loop/90&apos;s program design is built on published clinical research, not tradition or
            anecdote. Here&apos;s what it&apos;s based on.
          </p>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "How “remission” is defined",
              source: "ADA / EASD Consensus Report, 2021",
              body: "The American Diabetes Association and the European Association for the Study of Diabetes jointly define remission as an HbA1c below 6.5% sustained for at least 3 months after stopping all glucose-lowering medication. This is the definition Loop/90 uses — not a looser or more marketable one.",
              href: "https://diabetes.org/newsroom/international-experts-outline-diabetes-remission-diagnosis-criteria",
              linkLabel: "Read the ADA statement",
            },
            {
              title: "The DiRECT trial",
              source: "Lean, Taylor et al., The Lancet, 2018 — with 5-year follow-up, 2024",
              body: "A primary-care weight-management trial (Universities of Glasgow and Newcastle) put 46% of participants into remission at 12 months and 36% at 24 months, without medication. Participants who lost over 10kg saw remission rates of 75% at both 1 and 2 years. Loop/90's structure — supervised weight management plus ongoing clinical support — is modeled on this trial's approach.",
              href: "https://www.diabetes.org.uk/about-us/news-and-views/weight-loss-can-put-type-2-diabetes-remission-least-five-years-reveal-latest-findings",
              linkLabel: "Read the DiRECT findings",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 90}>
              <div className="flex h-full flex-col rounded-card border border-line bg-paper p-6">
                <div className="font-body text-[11px] font-bold uppercase tracking-wide text-primary">{item.source}</div>
                <div className="mt-2 font-body text-[15px] font-bold text-ink">{item.title}</div>
                <p className="mt-2 flex-1 font-body text-[13px] leading-relaxed text-ink-soft">{item.body}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 font-body text-[12.5px] font-bold text-primary hover:underline"
                >
                  {item.linkLabel} →
                </a>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-5 rounded-card border border-line bg-mint p-4 text-center">
          <p className="font-body text-[13.5px] text-primary-deep">
            Remission isn&apos;t guaranteed for everyone — results depend on how much weight is lost and how early
            in the disease you start. Medication decisions always stay with your doctor, never the app.
          </p>
        </div>
      </Section>

      {/* Our promise */}
      <Section className="border-t border-line bg-card">
        <Reveal>
          <Eyebrow>Our promise to you</Eyebrow>
          <h2 className="mt-3 max-w-lg text-balance font-display text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">
            We&apos;ve seen too many people burned by fake herbal cures. Here&apos;s exactly what you get.
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {[
            ["Doctor-led care pod", "Not an AI chatbot. A real endocrinologist, nutritionist, and coach assigned to your cohort."],
            ["Lab-verified HbA1c, day 0 and day 90", "We don't guess, we measure. Both tests are bundled into the price — no extra cost."],
            ["Money-back guarantee", `Complete 80% of daily tasks and log at least 5 readings a week. If your day-90 HbA1c hasn't improved by 0.5%, your PKR ${PROGRAM_PRICE_PKR.toLocaleString()} is refunded within 48 hours.`],
            [`PKR ${PROGRAM_PRICE_PKR.toLocaleString()} total — no hidden fees`, "No subscriptions, no surprise charges. One price covers the full 90-day program, both lab tests, and every consult with your care pod."],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="flex h-full gap-3 rounded-card border border-line bg-paper p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">✓</span>
                <div>
                  <div className="font-body text-[14px] font-bold text-ink">{title}</div>
                  <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Pricing — dark, high-contrast */}
      <section className="bg-frame-dark" id="pricing">
        <Section>
          <Reveal>
            <Eyebrow tone="marigold">Join a cohort</Eyebrow>
            <h2 className="mt-3 font-display text-[28px] font-semibold text-paper sm:text-[32px]">Your journey starts here</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto mt-8 max-w-lg rounded-card border border-[#1E4B3C] bg-[#0C332B] p-7 sm:p-9">
              <div className="font-body text-[12.5px] font-bold uppercase tracking-wide text-marigold">Loop/90 full program</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-[42px] font-semibold text-paper">PKR {PROGRAM_PRICE_PKR.toLocaleString()}</span>
                <span className="font-body text-[13px] text-[#8FB0A3]">one-time</span>
              </div>
              <div className="mt-1 font-body text-[12.5px] text-[#8FB0A3]">
                or 3 monthly installments of PKR {INSTALLMENT_PKR.toLocaleString()}
              </div>
              <ul className="mt-6 flex flex-col gap-2.5">
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
                  <li key={f} className="flex items-start gap-2.5 font-body text-[13.5px] text-[#C9DED5]">
                    <span className="mt-0.5 text-marigold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <LeadCta
                variant="enrollment"
                className="mt-7 block w-full rounded-full bg-marigold px-6 py-4 text-center font-body text-[15px] font-bold text-frame-dark shadow-[0_8px_24px_rgba(239,166,60,0.25)]"
              >
                Reserve My Spot
              </LeadCta>
              <p className="mt-3 text-center font-body text-[11.5px] text-[#8FB0A3]">
                Sends your details to our team on WhatsApp — no payment taken yet.
              </p>
              <div className="mt-3 flex items-center justify-center gap-3 font-body text-[11.5px] text-[#8FB0A3]">
                <span>Easypaisa</span> · <span>JazzCash</span> · <span>Bank transfer</span>
              </div>
            </div>
          </Reveal>
        </Section>
      </section>

      {/* Lead CTA */}
      <Section id="lead-form" className="bg-mint">
        <div className="mx-auto max-w-md text-center">
          <Eyebrow>Not ready to commit?</Eyebrow>
          <h2 className="mt-3 font-display text-[24px] font-semibold text-ink sm:text-[28px]">
            Start with the free Desi Diabetes Plate Guide
          </h2>
          <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">
            Practical portion and pairing guidance for everyday Pakistani meals — roti, daal,
            biryani — sent straight to your WhatsApp. No cost, no commitment.
          </p>
          <LeadCta className="mt-6 inline-block rounded-full bg-primary px-8 py-4 font-body text-[15px] font-bold text-white">
            Send Me the Free Guide
          </LeadCta>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <Reveal>
          <Eyebrow>Questions, answered</Eyebrow>
          <h2 className="mt-3 font-display text-[26px] font-semibold text-ink sm:text-[28px]">Before you ask</h2>
        </Reveal>
        <div className="mt-8 flex flex-col gap-3">
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
            <details key={q} className="group rounded-card border border-line bg-card p-5 open:border-primary">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-[14.5px] font-bold text-ink">
                {q}
                <span className="shrink-0 font-display text-[18px] text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 font-body text-[13.5px] leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-frame-dark">
        <Section className="py-14">
          <div className="font-display text-[20px] font-semibold text-paper">
            Loop<span className="text-marigold">/90</span>
          </div>
          <p className="mt-2 max-w-xl font-body text-[12.5px] leading-relaxed text-[#8FB0A3]">
            A 90-day cohort-based lifestyle medicine program for type-2 diabetes remission. Built
            in Pakistan, for Pakistan.
          </p>
          <div className="mt-6 max-w-xl">
            <Disclaimer />
          </div>
          <p className="mt-4 max-w-xl font-body text-[11.5px] leading-relaxed text-[#8FB0A3]">
            Loop/90 is a lifestyle education and care coordination program, not a substitute for
            medical treatment. All medication decisions remain with your personal physician.
            Individual results vary. The money-back guarantee applies only to patients who meet
            the stated eligibility criteria.
          </p>
          <div className="mt-4 font-body text-[12px] text-[#8FB0A3]">
            <a href="mailto:hello@loop90.pk" className="underline underline-offset-2 hover:text-paper">hello@loop90.pk</a>
          </div>
        </Section>
      </footer>
    </div>
    </LeadModalProvider>
  );
}
