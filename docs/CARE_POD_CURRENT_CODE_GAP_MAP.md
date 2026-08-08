# Loop/90 Care Pod — Current Code Gap Map

Status: implementation mapping only. This document intentionally prefers reuse and small extensions over new architecture.

## Governing rule

For every Care Pod requirement, use this order:

1. Reuse existing implementation.
2. Extend an existing table / config / workflow only if needed.
3. Add a small field or configuration value only if existing structures cannot represent the approved rule.
4. Create a new subsystem only when there is a proven gap.

Claude Code's current `main` implementation is the source of truth.

---

# 1. Already supported — reuse as-is

## Cohorts

Existing implementation already provides:

- `cohorts`
- cohort capacity
- cohort status
- cohort start date
- `cohort_members`

No new cohort model is required.

For Cohort #1, the commercial target can be 30–40 participants while the platform remains technically flexible.

## Care Pod assignment

Existing `care_pods` already links:

- cohort
- doctor
- nutritionist
- coach

Do not create a second Care Pod entity.

## Professional roles

Existing role architecture already supports:

- doctor
- nutritionist
- coach
- admin

Do not create parallel role names such as `clinical_lead`, `nutrition_lead`, or `movement_lead` unless a later proven requirement needs them.

## Consult scheduling

Existing:

- `consult_windows`
- `consult_bookings`
- booking status
- participant reason
- context snapshot

This should remain the source for 1:1 appointment operations.

Do not create a second appointment / session booking system for compensation.

## Clinical escalation

Existing:

- `escalations`
- escalation kinds
- assigned professional
- open / acknowledged / resolved states
- urgent / routine glucose logic
- AI-routed cases

Green / Amber / Red should be a presentation / policy mapping over this existing mechanism, not another escalation engine.

## AI triage

Existing AI design already supports:

- `ai_answerable`
- `route_nutritionist`
- `route_coach`
- `route_doctor`
- `urgent`

The current medication and symptom safety boundaries remain authoritative.

No second triage classifier is needed.

## Medication safety and audit

Existing:

- `medication_plans`
- doctor-only creation / editing requirement
- `medication_plan_audit`

Do not create compensation or quality logic that bypasses these clinical controls.

## Lead capture / professional recruitment

Existing implementation already includes:

- `/professionals`
- professional lead capture
- profession / persona segmentation
- city
- licence / certification number
- attribution
- consent
- Leads admin tab
- lead status

Do not build another recruitment CRM.

The next recruitment extension should start from the existing lead record and only add lifecycle support if the current lead model proves insufficient.

## Config mechanism

Existing `automation_config` and `loadConfig()` already provide centralized runtime configuration.

Where a commercial value is genuinely configuration rather than transactional data, prefer the existing config mechanism before introducing a new settings service.

Examples that may fit config, subject to current admin UI conventions:

- founding cohort realized price
- public list / value price
- referral payout
- contact WhatsApp
- future approved default appointment price

Do not store per-professional earned compensation in config.

---

# 2. Small extension needed — existing structures should remain primary

## Base Care Pod payout

Requirement:

- Doctor baseline: PKR 52,500
- Nutritionist baseline: PKR 42,500
- Coach baseline: PKR 32,500
- Current total baseline: PKR 127,500

Current code gap:

The product has Care Pod assignments but does not currently expose cohort compensation against that assignment.

Smallest-change direction:

First determine whether existing admin/config structures can store the role-level cohort payout defaults.

Do not create a full compensation engine merely to store three baseline amounts.

A new transactional record is only needed when the product must preserve a historical cohort-specific agreed amount independently of later config changes.

## 1:1 appointment compensation

Requirement:

Additional paid appointments may use an approved fee and professional / Loop/90 split.

Existing reuse point:

`consult_bookings` already identifies the appointment and completion state.

Smallest-change direction:

Extend the existing booking / completion flow only enough to capture commercial facts when a booking is separately paid.

Do not create a parallel appointment table.

Minimum information eventually required may include:

- whether appointment is included or separately billable
- agreed fee
- professional share / amount
- settlement state

Before adding fields, inspect whether existing payment / referral / admin transaction patterns can represent these facts.

## Professional application lifecycle

Existing leads support acquisition and manual status.

Desired eventual lifecycle includes concepts such as:

- applicant
- credentials reviewed
- approved
- orientation complete
- active

Smallest-change direction:

Do not invent a new applicant system until the current `leads` + staff invitation / profile flow is mapped end-to-end.

Likely progression should reuse:

professional lead -> admin review -> existing staff/profile creation or invitation -> Care Pod assignment.

Only missing verification / onboarding facts should be added.

## Credential verification

The professional form already captures licence / certification number.

Gap:

A captured licence value is not the same as a verified credential.

Smallest-change direction:

Extend the existing admin/professional onboarding path with verification status / notes only if this is not already represented elsewhere.

Do not build external credential automation for Cohort #1 unless required.

## Care Pod onboarding / orientation

The professionals page already describes protocol training.

Gap:

The system needs a reliable way to know whether the professional has completed required onboarding before assignment / activation.

Smallest-change direction:

Reuse the existing staff/profile/admin flow and add only the minimum completion marker or checklist if no equivalent exists.

Avoid creating a full LMS / academy platform.

## Quality / participation review

Requirement:

Professional quality status for compensation purposes:

- Green
- Amber
- Red

This is distinct from patient clinical priority.

Gap:

No clear current professional-quality record has been identified.

Smallest-change direction for Cohort #1:

Use a manual admin-reviewed status with:

- status
- reason
- reviewer
- reviewed_at

Only add a dedicated structure if this cannot cleanly live in an existing professional/cohort-assignment/admin pattern.

Do not build automated scoring yet.

## Professional workload measurement

Much of the work already leaves records:

- consult bookings
- escalations
- chat / routed questions
- medication actions
- cohort / task data

Smallest-change direction:

Derive workload metrics from existing events first.

Do not create activity logging for events already captured elsewhere.

Only genuinely uncaptured compensable events may need a lightweight manual/approved activity entry.

---

# 3. Genuinely missing business capability

The following capabilities are not currently evident as complete product functions and may require implementation after approval.

## Historical payout statement

Need:

A professional should eventually be able to see how a payout was calculated for a specific cohort / period.

Existing admin/referral payout patterns should be inspected before deciding how to represent this.

Required outcome, not prescribed architecture:

- base amount
- additional approved items
- separately paid appointments
- quality adjustment when applicable
- final amount
- settlement state
- auditability

## Additional compensable activity that has no existing source record

If Cohort #1 approves activities that are not already represented by consults, escalations, sessions, chat, medication actions, or other existing records, the system will need a minimal way to record and approve them.

Do not create this until the approved activity catalogue is final.

## Agreement acceptance record

If there is currently no durable record of which professional accepted which Care Pod commercial/protocol terms and when, this is a genuine compliance/operations gap.

Required outcome:

- agreement/protocol version
- accepted by
- accepted at
- current status

Prefer extending existing document/consent/profile mechanisms if present.

---

# 4. Things we should explicitly NOT build now

Do not build:

- a second Care Pod schema
- a second cohort system
- a new scheduling platform
- a new escalation engine
- a new AI triage taxonomy
- an automated professional quality algorithm
- an LMS / academy product
- a standalone recruitment CRM
- a full accounting ledger
- outcome-based professional bonuses
- a generic marketplace architecture
- a complex points-based activity economy

Cohort #1 should remain operationally simple and human-reviewed.

---

# 5. Recommended minimal implementation sequence

## Step 1 — Confirm existing end-to-end professional flow

Trace the current path:

`/professionals` lead -> Leads admin -> staff/profile creation/invite -> role -> Care Pod assignment.

Only document gaps.

## Step 2 — Reuse config for approved commercial defaults where appropriate

Inspect current `automation_config` / admin settings and determine whether the following can be represented there without abuse:

- PKR 25,000 list/value anchor
- PKR 20,000 founding realized price
- doctor cohort baseline
- nutritionist cohort baseline
- coach cohort baseline
- future approved default paid-appointment fee / split

Historical agreed values must not depend only on mutable config if payment audit requires a snapshot.

## Step 3 — Add only cohort-specific payout snapshot if needed

If mutable config is not sufficient for auditability, attach/snapshot the agreed commercial terms to the existing Care Pod / cohort relationship using the smallest repo-consistent method.

Do not implement extra activity logic yet.

## Step 4 — Reuse consult bookings for paid 1:1 work

Identify completed appointments from existing bookings.

Add only the missing commercial metadata required to know whether and how much that completed booking contributes to payout.

## Step 5 — Add manual professional quality review

Cohort #1 needs only Green / Amber / Red + reason + reviewer + date.

Quality should affect variable compensation only according to the approved agreement.

## Step 6 — Derive existing activity before adding activity records

Count / summarize existing source events.

Only add a lightweight approved activity record for an approved compensable activity that has no existing authoritative source.

## Step 7 — Produce admin payout preview

Start with admin review, not automated money movement.

The first usable output should answer:

- professional
- cohort
- base amount
- additional approved activities
- paid appointments
- quality eligibility
- calculated total

No bank-transfer automation is required for Cohort #1.

---

# 6. Current implementation classification

| Requirement | Classification | Primary existing reuse point |
|---|---|---|
| Cohort | Already supported | `cohorts`, `cohort_members` |
| Care Pod roster | Already supported | `care_pods` |
| Professional roles | Already supported | profile role / RLS |
| 1:1 booking | Already supported operationally | `consult_windows`, `consult_bookings` |
| Clinical escalation | Already supported | `escalations` |
| AI routing | Already supported | AI triage / chat |
| Medication safety | Already supported | medication plans + audit |
| Professional acquisition | Already supported | `/professionals`, `leads` |
| Central commercial defaults | Partially supported | `automation_config` |
| Base cohort compensation | Small extension | Care Pod/cohort + config/snapshot |
| Paid appointment economics | Small extension | existing consult booking |
| Credential verification state | Small extension | existing lead/staff onboarding |
| Orientation completion | Small extension | existing staff/profile workflow |
| Professional quality status | Small extension | existing admin/professional relationship where possible |
| Workload measurement | Mostly derivable | existing consult/escalation/chat events |
| Payout statement | Genuine missing capability | inspect existing payout/referral pattern before implementation |
| Uncaptured extra activity | Only if approved activity lacks source | add minimally after catalogue approval |
| Agreement acceptance/version | Genuine gap if no existing consent/doc record | extend existing mechanism if available |

---

# 7. Gate before code changes

Before any runtime implementation, Claude Code / Codex should answer these repository-specific questions:

1. How does a professional lead currently become a staff profile?
2. Where are staff invite / activation / role assignment states stored?
3. Does any existing table already store staff verification or metadata that can be reused?
4. Can `automation_config` safely hold the approved default commercial values?
5. Is there an existing generic payout / referral settlement pattern that can be reused for professional settlements?
6. Is there an existing admin audit / notes pattern suitable for manual quality review?
7. Which existing records can already prove compensable activities without new logging?
8. What is the smallest historical snapshot required so later config changes do not alter prior cohort payout calculations?

Only after these eight questions are answered should an implementation diff be proposed.
