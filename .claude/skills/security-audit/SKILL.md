---
name: security-audit
description: Run before any deploy/launch, or whenever asked to "secure the app" — a 5-pass security review adapted from open-source tools (Gitleaks, Bearer, Trail of Bits, ECC) for this codebase's actual stack (Next.js App Router, Supabase Postgres/Auth/RLS, service-role admin client, Vercel Cron, Anthropic vision).
---

# Security audit

Five passes, run in order. For each, cite `file:line` and mark severity
(low/medium/high). Only report what's actually exploitable in this codebase —
don't pad with speculative issues, and don't flag something RLS already
mitigates unless the finding is specifically that RLS is missing/wrong.

Fix confirmed findings directly rather than just listing them, unless the fix
is a genuine product/scope decision (e.g. "add a self-service deletion flow")
— flag those to the user instead of building silently.

## 1. Secret leak prevention

- Grep the whole repo (not `node_modules`) for hardcoded API keys, tokens,
  passwords as string literals — `sk-ant-`, `sb_secret`, AWS key patterns, etc.
- Check `next.config.*` for accidental secret exposure in any `env:` block.
- Any `NEXT_PUBLIC_`-prefixed env var must be genuinely safe client-side —
  never `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, or `ANTHROPIC_API_KEY`.
- `.gitignore` must exclude `.env*` (with an explicit carve-out for
  `.env*.example` templates); confirm via `git ls-files` that no real `.env`
  is tracked.
- No `console.log`/`error`/`warn` anywhere should print a secret, token,
  glucose/lab value tied to an identifiable patient, or connection string.
- `CRON_SECRET` (see pass 4) must be documented in `.env.example` as
  required, not left implicit — an unset value is what makes the fail-open
  bug in pass 4 possible in the first place.
- If any secret was ever hardcoded and committed, it's still in git history —
  flag for rotation, this tool can't rewrite history for the user.

## 2. Personal data flow audit

- Map where PHI enters (glucose readings, weight, HbA1c, meal photos,
  medication plans, phone numbers) and trace it to storage and any
  third-party integration (Anthropic API for chat/vision, push/WhatsApp/
  Telegram notification senders in `lib/notify.ts` / `lib/push.ts`).
- No log statement should output a glucose value, medication detail, or
  phone number alongside an identifiable patient/profile id.
- API/server-action responses should be column-scoped (`select("col1,col2")`,
  never `select("*")`) on any table holding PHI (`glucose_readings`,
  `medication_plan`, `profiles`, `chat_messages`) — check every query
  against those tables, including in `lib/staff.ts` and the cron routes.
- Cookies: confirm nothing bypasses `@supabase/ssr`'s default httpOnly/
  secure/sameSite handling with custom cookie-setting code
  (`lib/supabase/middleware.ts` and `lib/supabase/server.ts` are the two
  places cookies are touched — both should go through `@supabase/ssr`).
- Confirm there's a data-deletion/anonymization path, in-app or documented —
  if there isn't, that's a product gap to flag, not something to build
  unprompted.

## 3. Pre-deploy production hardening

- `next.config.*` `headers()` should set `X-Content-Type-Options: nosniff`,
  `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`, a
  `Content-Security-Policy`, and a `Permissions-Policy` scoping camera/
  microphone (relevant here: meal-photo capture and voice notes). Verify the
  CSP doesn't break the app — check actual response headers (`curl -sD -`)
  and load a real page; `unsafe-eval` should be dev-only
  (`process.env.NODE_ENV !== "production"` gate).
- No test/debug/backdoor HTTP routes should exist without an explicit env
  gate. `/demo` and `/api/demo-login` are an intentional, scoped exception
  (restricted to `@sehat90.app` seed accounts) — they must stay behind
  `DEMO_MODE` (`lib/env.ts#demoModeEnabled`), off by default in production.
  Confirm the route also carries `export const dynamic = "force-dynamic"` —
  without it, Next.js can bake the build-time gate result into a static
  response and the env var stops having any effect at runtime (found and
  fixed in this codebase — see `app/api/demo-login/route.ts`).
- Server actions/API routes shouldn't leak stack traces or raw internal
  error detail to the client; a bare `error.message` passthrough is
  acceptable only when the message itself carries no schema/secret detail.
- Auth-adjacent routes (login, phone OTP, `/api/demo-login`) should have
  some rate limiting or scope restriction; note gaps even if not fixing
  them inline.
- CORS: no `Access-Control-Allow-Origin: *` on anything that isn't meant to
  be a fully public API.

## 4. Deep audit — cron auth, admin client, injection

- **Cron routes are this app's highest-risk surface, not an afterthought.**
  Grep every `app/api/cron/*/route.ts` for its `CRON_SECRET` check. The
  check must be **fail-closed**: `if (!process.env.CRON_SECRET || auth !==
  \`Bearer ${process.env.CRON_SECRET}\`)`. Reject anything shaped
  `if (process.env.CRON_SECRET && auth !== ...)` — when the env var is
  unset that skips the check entirely, and reject anything shaped
  `if (auth !== \`Bearer ${process.env.CRON_SECRET}\`)` with no separate
  unset-guard — when unset, `${process.env.CRON_SECRET}` interpolates to
  the literal string `"undefined"`, so a request with header
  `Authorization: Bearer undefined` passes. Both patterns were found across
  all 7 cron routes in this codebase (6 of the first shape, 1 of the
  second, in `cgm-sync`) and fixed to fail-closed — re-check this every
  time a new cron route is added, since it's an easy pattern to copy wrong
  from an existing route.
- Grep every `createAdminSupabase()` (service-role, bypasses RLS) call
  site — `lib/supabase/admin.ts` is the only place it's defined, and it
  carries `import "server-only"` as a compile-time guard against client
  bundling. For each call site: is there an explicit authorization check
  immediately before the privileged operation (a role check, an ownership
  check via the *regular* RLS client, or — for cron routes — the
  `CRON_SECRET` check above)? A missing or weak check here is the
  highest-value thing to find — RLS provides zero protection once the
  admin client is in play. Note: `lib/admin.ts` (no "supabase" in the
  name) is a *different* file — it's the cohort/template data layer using
  the regular RLS client, not the privileged one; don't conflate the two
  when grepping.
- Grep `dangerouslySetInnerHTML` and any raw HTML-string templates. None
  exist in this codebase as of the last audit — but the moment a feature
  renders admin/staff-authored free text as HTML (cohort announcements,
  resource-library descriptions), any interpolated string (cohort name,
  patient name, free-text body) must be HTML-escaped before landing in a
  template. Add an `escapeHtml` helper at that point if one doesn't exist
  yet; don't ship the feature without it.
- Medication changes: confirm no code path outside a `doctor`-role-gated
  server action can write to `medication_plan` — this is Loop/90's
  non-negotiable safety rule #1 (CLAUDE.md), not just a generic security
  concern. Grep for every write to `medication_plan` and confirm each is
  behind a role check and produces an audit-trail row.
- SQL injection: confirm no raw SQL concatenation or unparameterized
  `.rpc()` calls — everything should go through the Supabase query builder.

## 5. Attacker's-perspective / IDOR review

- For every dynamic `[id]` route (`app/(staff)/staff/patients/[id]/`,
  consult-booking, etc.), confirm it either (a) uses the regular RLS-scoped
  client so cohort/pod ownership is enforced at the DB layer, or (b) uses
  the admin client with an explicit ownership check. Flag any admin-client
  fetch-by-ID with no accompanying check.
- Re-check `lib/supabase/middleware.ts`'s role guard whenever a new route
  group is added — currently it's a single `isStaffRole(role)` gate on
  `/staff/*`; confirm a `patient` role can never reach it, and that any new
  staff-only route lands under `/staff/*` rather than a fresh top-level path
  that middleware doesn't know about.
- Glucose/escalation logic: confirm the ≥250/≤70 mg/dL urgent-escalation
  trigger and the ≥180 routine-flag threshold (CLAUDE.md safety rule #2)
  are enforced at the DB trigger level, not just in application code that a
  new code path could bypass — check `supabase/migrations/` for the
  trigger definition and confirm every glucose-insert path goes through it.
- AI triage: confirm the classifier (`ai_answerable` / `route_nutritionist`
  / `route_coach` / `route_doctor` / `urgent`) still routes medication,
  dosage, and symptom-keyword messages to a human — this is safety rule #3,
  and the vitest triage suite is the regression guard; re-run it
  (`npm run test`) whenever prompts or the classifier change.
- Business-logic checks worth a quick look on any points/leaderboard/streak
  feature: can a patient inflate their own points or streak by replaying a
  request, and does that create any downstream effect beyond cosmetic rank?

## When to run this

- Before any change is described to the user as "ready to deploy" or
  "production-ready."
- Whenever the user asks to "secure the app," "run a security check," or
  similar, in this repo.
- After adding any new cron route, any new `createAdminSupabase()` call
  site, any new HTML-templated content (announcements, resource library),
  or any new auth-adjacent route.
- Re-running full-scope after a major feature addition is worth more than
  skipping it because "nothing auth-related changed" — new code is new
  attack surface even when the feature itself isn't auth/payments.
