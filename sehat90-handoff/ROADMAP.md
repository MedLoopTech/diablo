# Build roadmap — work phases in order, verify each checklist before moving on

## Phase 0 — Scaffold (½ day)
- Next.js 14 App Router + TS + Tailwind; theme extended with prototype palette
- Supabase project wired (env vars via .env.local, documented in README)
- Auth: phone OTP + email fallback; profiles row created on signup with role=patient
- Route groups: (patient) mobile-first shell with 5-tab bottom nav from prototype,
  (staff) desktop shell, middleware guarding by role
✓ Check: sign up, land on empty Today screen, staff route blocked for patients.

## Phase 1 — Core patient loop (2–3 days)
- Migrations for all §1 tables + RLS policies
- Glucose logging with flag trigger + the three feedback states from the prototype
- Daily task generation (cron via Supabase scheduled function) + tap-to-complete
- Glucose horizon dial (port SVG from prototype, feed real readings)
- Points ledger + streak calculation
✓ Check: log 251 → urgent escalation row created; log 130 → green state; tasks
  persist; dial renders today's readings correctly in Asia/Karachi time.

## Phase 2 — AI coach (2 days)
- /api/ai/chat with triage step (§3a), chat sheet UI from prototype
- /api/ai/meal vision analysis + Log screen meal card
- Vitest suite: 15+ triage cases incl. "should I stop metformin?" → route_doctor,
  "feeling dizzy" → urgent, "is daal ok at night?" → ai_answerable
✓ Check: all triage tests pass; medication question produces escalation + handoff
  message, never an AI answer.

## Phase 3 — Care pod & consults (2 days)
- Consult windows + slot booking with context_snapshot attachment
- Doctor dashboard: escalation queue, flagged readings, patient timeline
- Medication plan editor (doctor-only) + audit table writes on every change
✓ Check: patient books slot → doctor sees it with attached readings; non-doctor
  role gets 403 on medication endpoints; audit row on every plan edit.

## Phase 4 — Cohort & progress (1–2 days)
- Cohort feed (posts/reactions/replies, Supabase Realtime), leaderboard, group challenge
- Progress screen: 90-day path, est HbA1c, weight, fasting trend
✓ Check: two test patients in same cohort see each other's posts; patients in
  different cohorts do not (RLS test).

## Phase 5 — Polish & seed (1 day)
- Notifications (in-app + web push), empty states, loading states, error states
  written per the prototype's copy voice
- Seed script: 1 active cohort (day 34), 6 patients with 5 weeks of realistic data,
  full pod staff — so the app demos exactly like the prototype
✓ Check: fresh `db reset` + seed → app looks like the prototype screenshots.
