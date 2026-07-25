# Sehat/90 — Product & Technical Specification

## 1. Data model (Postgres via Supabase)

profiles
- id (uuid, = auth.users.id), role (enum: patient|doctor|nutritionist|coach|admin)
- full_name, phone, avatar_url, timezone (default 'Asia/Karachi'), created_at

cohorts
- id, name, start_date, capacity (default 45), status (enum: enrolling|active|completed)

cohort_members
- cohort_id, patient_id, joined_at, baseline_hba1c, baseline_weight_kg,
  baseline_fasting_glucose, target_notes

care_pods
- cohort_id, doctor_id, nutritionist_id, coach_id

glucose_readings
- id, patient_id, value_mgdl (int), context (enum: fasting|pre_meal|post_meal|bedtime|random)
- source (enum: manual|cgm), taken_at, created_at
- flag (enum: none|routine|urgent) — set by trigger/edge function on insert:
  urgent if value ≥ 250 or ≤ 70; routine if ≥ 180

meals
- id, patient_id, photo_url, meal_type (breakfast|lunch|dinner|snack), eaten_at
- ai_analysis jsonb: { dish_guess, est_carbs_g, glycemic_load: low|med|high,
  feedback_text, healthier_swap }

tasks
- id, patient_id, cohort_day (int), title, subtitle, kind (glucose|meal|walk|yoga_live|custom)
- done_at (nullable). Generated daily from task_templates per program phase.

task_templates
- phase (1|2|3), kind, title, subtitle, default_time

consult_windows
- id, staff_id, date, start_time, end_time, slot_minutes (default 10)

consult_bookings
- id, window_id, slot_time, patient_id, reason, status (booked|completed|no_show|cancelled)
- context_snapshot jsonb (last 3 days readings + meals, attached at booking time)

medication_plans
- id, patient_id, created_by (must be doctor — enforce in RLS + app layer)
- medications jsonb [{name, dose, schedule}], effective_from, notes

medication_plan_audit
- plan_id, changed_by, changed_at, before jsonb, after jsonb

escalations
- id, patient_id, kind (glucose_urgent|glucose_routine|ai_routed|patient_flagged)
- payload jsonb, assigned_to, status (open|acknowledged|resolved), created_at, resolved_at

chat_messages
- id, patient_id, sender (patient|ai|doctor|nutritionist|coach), body, created_at
- triage jsonb (on patient messages): { class, confidence, routed_to }

posts / post_reactions / post_replies — cohort feed, scoped by cohort_id

points_ledger
- patient_id, points, reason (task_done|streak|reading_logged|challenge), created_at
- Leaderboard = sum(points) per patient per cohort; streak = consecutive days with
  ≥1 glucose reading + ≥2 tasks done

progress_snapshots
- patient_id, week, est_hba1c, weight_kg, avg_fasting_7d, time_in_range_pct

## 2. The 90-day program logic
- Phase 1 (day 1–14) Baseline: log everything, no diet overhaul, education drips.
- Phase 2 (day 15–60) Intervention: personalized meal plan, daily movement targets,
  medication review at day 45 (auto-create a consult booking prompt for the doctor).
- Phase 3 (day 61–90) Stabilization: taper coaching intensity, day-90 HbA1c lab prompt.
- est_hba1c formula for the progress card: (avg_glucose_mgdl + 46.7) / 28.7 over
  trailing 30 days, labeled clearly as an estimate.

## 3. AI coach (Anthropic API)
Two server-side functions (Next.js route handlers, key never on client):

a) `POST /api/ai/chat`
   - Input: patient message + rolling context (last 7 days readings summary, current
     meal plan, active medications LIST ONLY — never dosing advice, cohort day).
   - Step 1: triage classification (strict JSON out): ai_answerable | route_nutritionist
     | route_coach | route_doctor | urgent.
   - Step 2: if ai_answerable → generate reply (warm, concise, desi-food-aware,
     Urdu-English code-switching OK). Else → create escalation row, reply with a
     handoff message + offer next available consult slot for the routed role.
   - System prompt must include the safety rules from CLAUDE.md verbatim.

b) `POST /api/ai/meal` — vision call on uploaded meal photo → ai_analysis jsonb
   (schema in §1). If confidence low, ask patient to confirm dish name.

## 4. Screens (match prototype)
Patient app (mobile-first web):
- Today: glucose horizon dial, AI nudge card → coach chat sheet, daily task list
- Log: glucose entry (with flag feedback states), meal photo upload + AI card, steps
- Care: pod roster, today's consult windows with bookable slots, safety notice
- Cohort: group challenge progress bar, leaderboard with streaks, feed
- Progress: 90-day path, est HbA1c, weight, fasting trend chart, remission criteria card

Staff dashboard (desktop, /staff):
- Doctor: escalation queue (urgent first), flagged readings review, patient detail
  (full timeline), medication plan editor with audit trail, consult schedule
- Nutritionist: routed questions queue, meal plan editor, cohort meal-photo review
- Coach: session schedule, attendance, routed questions
- Admin: cohort creation, pod assignment, enrollment, program templates

## 5. Notifications (v1 = in-app + web push; WhatsApp via Twilio in v2)
- Patient: task reminders, consult reminder (30 min before), doctor replied, urgent guidance
- Doctor: urgent escalation (immediate), daily flagged-readings digest (8am PKT)

## 6. Out of scope for v1 (do not build yet)
Payments, CGM device sync (manual entry only), native apps, Urdu UI (strings wrapped
but English only), video consults (slots link to a Google Meet URL field for now),
WhatsApp notifications.
