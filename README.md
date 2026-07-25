# Sehat/90

A 90-day cohort-based type-2 diabetes remission program for the Pakistan/South Asia
market. Patients join cohorts served by a care pod (doctor, nutritionist, movement
coach) plus an always-on AI coach that triages what needs a human.

Project docs: [CLAUDE.md](CLAUDE.md) (conventions & safety rules),
[SPEC.md](SPEC.md) (data model & features), [ROADMAP.md](ROADMAP.md) (build phases).

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth,
Realtime, Storage) · Anthropic API · Vercel.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to get it | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Client + server Supabase access |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Client + server Supabase access (RLS enforced). Accepts either the legacy `anon` JWT or a newer `sb_publishable_…` key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | Server-only admin ops (role changes, seeding). Never sent to the client. |
| `ANTHROPIC_API_KEY` | console.anthropic.com | AI coach + meal photo analysis (Phase 2+) |

### Supabase project setup (Phase 0)

1. Create a project at supabase.com.
2. Apply the migration: paste `supabase/migrations/00000000000001_profiles.sql`
   into the SQL editor, or link the CLI (`npx supabase init`, `npx supabase link`)
   and run `npx supabase db push`.
3. Enable auth providers: **Phone** (attach an SMS provider — Twilio Verify works
   well for Pakistan) and **Email**. Email is the dev-friendly fallback and needs
   no SMS provider.
4. **Make the email provider send a code, not a magic link.** This app calls
   `verifyOtp()` with a 6-digit token, but Supabase's stock email template only
   contains `{{ .ConfirmationURL }}`, so no code ever reaches the user and the
   OTP step cannot succeed. Fix it under Authentication → Emails → *Magic Link*
   by including the token in the body:

   ```html
   <p>Your Sehat/90 code is <strong>{{ .Token }}</strong></p>
   ```

   Leaving the link in alongside the code is fine — both work.
5. Signup automatically creates a `profiles` row with `role = 'patient'`.
   To make a staff account, sign up first, then update the row with the service
   role (SQL editor): `update profiles set role = 'doctor' where phone = '+92...';`

## Commands

- `npm run dev` — local dev
- `npm run build && npm run start` — production check before any commit claiming "done"
- `npx supabase db reset` — rebuild local DB from migrations + seed (requires `npx supabase init` once)
- `npm run test` — vitest (triage + escalation tests arrive in Phase 2)

## Status

**Phase 0 (scaffold)** — auth (phone OTP + email fallback), patient shell with
5-tab bottom nav, staff shell, role-guarded middleware. Later phases per ROADMAP.md.
