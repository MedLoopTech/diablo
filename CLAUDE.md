# Sehat/90 — Diabetes Remission Challenge Platform

## What this is
A 90-day cohort-based type-2 diabetes remission program for the Pakistan/South Asia market.
Patients join cohorts of 30–50, each cohort served by a "care pod": one doctor
(endocrinologist/GP), one clinical nutritionist, one yoga/movement coach. An AI coach
(Anthropic API) handles the always-on layer — glucose trend feedback, meal analysis,
routine Q&A, nudges — and triages what actually needs a human. Humans handle judgment:
medication changes, weekly reviews, escalations.

## Design reference
`design-reference/sehat-90-prototype.jsx` is the approved clickable prototype.
Match its visual language exactly: palette, Fraunces/Outfit type pairing, the
"glucose horizon" dial, the 90-day winding path, card style, tab structure.
Colors and tokens are defined at the top of that file in the `C` object.

## Tech stack (decided — do not substitute without asking)
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (extend theme with the palette from the prototype's `C` object)
- Supabase: Postgres, Auth (phone OTP primary — this market is phone-first), Realtime, Storage
- Anthropic API (claude-sonnet-4-6) for the AI coach + meal photo analysis (vision)
- Deployed on Vercel

## User roles
`patient`, `doctor`, `nutritionist`, `coach`, `admin` — enforced via Supabase RLS.
Patients see only their own data + their cohort's shared feed/leaderboard.
Pod staff see only patients in their assigned cohorts. Admin sees everything.

## Non-negotiable safety rules (encode these in logic, not just copy)
1. The AI NEVER suggests medication changes. Medication plans are created/edited only
   by users with role `doctor`, with a full audit trail (who, what, when, prior value).
2. Glucose readings ≥ 250 mg/dL or ≤ 70 mg/dL trigger an URGENT escalation to the
   pod doctor (in-app + notification) and show the patient emergency guidance.
   Readings ≥ 180 create a routine flag for daily doctor review.
3. AI triage classifies every patient question: `ai_answerable` | `route_nutritionist`
   | `route_coach` | `route_doctor` | `urgent`. Anything mentioning medication, dosage,
   symptoms (dizziness, chest pain, vision, numbness), pregnancy, or other conditions
   routes to a human. When in doubt, route to human.
4. Use "remission" in all user-facing copy, never "cure". "Reversal" only in marketing
   contexts already approved.
5. All medical content shows the disclaimer component; AI chat shows a persistent
   "AI coach — not a doctor" label.

## Conventions
- All timestamps stored UTC, displayed Asia/Karachi.
- Glucose in mg/dL. Weight in kg. HbA1c in %.
- Cohort day = (today − cohort.start_date) + 1, capped 1–90.
- Currency PKR. Urdu localization is planned — wrap all user-facing strings in a
  t() helper from day one (next-intl), even though v1 ships English only.
- Prefer server components; client components only where interactivity requires.
- Write migrations in supabase/migrations, never mutate schema ad hoc.

## Commands
- `npm run dev` — local dev
- `npm run build && npm run start` — production check before any commit claiming "done"
- `npx supabase db reset` — rebuild local DB from migrations + seed
- `npm run test` — vitest; add tests for triage classification and escalation thresholds

## Build order
Follow ROADMAP.md phases strictly. Do not start a later phase before the earlier
phase's checklist passes. Read SPEC.md before implementing any feature.
