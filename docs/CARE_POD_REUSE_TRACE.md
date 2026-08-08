# Loop/90 Care Pod — Repository Reuse Trace

Status: Answers the eight reuse-gate questions from `CARE_POD_CURRENT_CODE_GAP_MAP.md` using the current `main` implementation and commit history. No runtime changes are proposed here.

## Governing rule

`main` is authoritative. Reuse existing code paths first. Do not introduce a second Care Pod, appointment, payout, recruitment, quality, or onboarding subsystem unless the current repository cannot represent the approved requirement.

---

## 1. How does a professional lead currently become a staff profile?

### Confirmed existing flow

1. `/professionals` captures professional applications through the existing lead modal.
2. The lead is persisted in the existing `leads` table with professional persona, city, licence/certification number, attribution and consent.
3. Super-admin reviews the lead in Admin -> Leads and can move its current lead status.
4. Separately, the existing Admin -> Staff flow can invite a staff member by email.
5. Staff invite pre-assigns role and name; a later change also captures phone.
6. The invited user becomes an existing `profiles` row with role `doctor`, `nutritionist`, or `coach`.
7. Admin can then assign that staff profile into an existing `care_pods` record for a cohort.

### Gap

There is no confirmed automatic conversion action from a specific `leads` row directly into `inviteStaff()` / a staff profile. Today this appears to be an admin-mediated handoff between two already-existing flows.

### Reuse decision

Do NOT build a new applicant/user model.

If Cohort #1 needs a smoother conversion, the smallest extension is an admin action on the existing professional lead that pre-fills or invokes the existing staff invite flow and optionally records the resulting profile id back against the lead if auditability requires it.

---

## 2. Where are staff invite / activation / role assignment states stored?

### Confirmed

- Staff identity and role live in existing `profiles` / auth infrastructure.
- Existing roles include doctor, nutritionist and coach.
- Staff invite is performed through the existing admin invite flow using Supabase auth invitation/magic-link behavior.
- Role and name are pre-assigned during the invite flow; phone is now explicitly saved as well.
- Care Pod placement is represented separately by existing `care_pods` assignment.

### Important distinction

The repository does not need a second professional-role state machine just to know whether someone is a doctor/nutritionist/coach.

### Gap

A distinct recruitment lifecycle such as `credentials_verified`, `orientation_complete`, or `agreement_accepted` is not confirmed as part of `profiles` today.

### Reuse decision

Keep auth/profile role as the activation identity source. Add only missing onboarding facts if needed; do not replace the invite/profile system.

---

## 3. Does any existing table already store staff verification or metadata that can be reused?

### Confirmed reusable metadata

The current system already has:

- `profiles` for staff identity/role/name/phone.
- Professional lead capture containing licence/certification number and city before staff creation.
- Existing payment-info functionality from the staff/payout work.
- Existing staff performance page/workflows.
- Existing admin-editable people/staff data.

### Not confirmed

No durable, explicit credential-verification record with verifier, verification date, result, and notes has been confirmed from the inspected code/history.

### Reuse decision

For Cohort #1, do not build an external credential service. First reuse the existing lead licence field + staff profile/admin flow. If an auditable verification fact is required, add only the minimum verification metadata to the most natural existing staff/onboarding record after Claude Code confirms the current schema.

---

## 4. Can `automation_config` safely hold approved default commercial values?

### Confirmed

Yes, for mutable platform defaults.

The repository already uses `automation_config` / `loadConfig()` for runtime business configuration, including:

- referral payout default
- platform currency
- contact WhatsApp
- app / guide URLs
- other operational settings

The admin already has dedicated Settings / Automation / Referrals configuration surfaces.

### Suitable Care Pod defaults

Subject to admin-UI grouping, this mechanism is a good reuse candidate for default values such as:

- public/list program price
- founding realized price
- default doctor cohort baseline
- default nutritionist cohort baseline
- default coach cohort baseline
- approved default additional appointment fee
- approved default professional/platform split

### Limitation

Mutable config alone is NOT sufficient for historical payout audit. Once a professional/cohort commercial arrangement is agreed, later config changes must not rewrite history.

### Reuse decision

Use `automation_config` for defaults. Snapshot only the minimum agreed cohort/professional commercial facts required for historical calculation.

---

## 5. Is there an existing generic payout / referral settlement pattern that can be reused for professional settlements?

### Strongly confirmed

Yes.

The current app already includes:

- `/staff/payouts`
- super-admin-only money-moving controls
- referral payout configuration
- referral states leading to payout
- reward fulfillment audit records
- payment-info functionality
- configurable platform currency
- admin actions that mark eligible records paid
- an explicit audit-first pattern: fulfillment/audit is written before a payout state is advanced

The repository also already separates operational referral tracking from actual settlement authorization.

### Reuse decision

Professional Care Pod settlements should reuse the existing payout/admin/security/audit conventions.

Do NOT build a new finance/accounting subsystem.

Likely extension direction:

- make professional cohort/appointment payout items another approved settlement source within or alongside the current payout surface
- reuse super-admin authorization
- reuse payment-info and currency formatting
- reuse audit-before-state-change behavior

Exact implementation should follow the existing payout code structure after file-level inspection by Claude Code.

---

## 6. Is there an existing admin audit / notes pattern suitable for manual quality review?

### Confirmed reusable patterns

The repository already contains several audited/manual-review patterns:

- medication plan audit
- meal plan audit
- glucose review notes
- patient weekly reviews
- escalation acknowledge/resolve lifecycle
- admin-editable lead status
- staff performance surface
- reward fulfillment audit

### Reuse decision

Do not create an automated quality-scoring engine.

For Cohort #1, manual professional Green/Amber/Red review should reuse the repository's existing admin/manual-review conventions. If no current staff-performance record can carry `status + reason + reviewer + reviewed_at`, add the smallest extension there rather than inventing a generic quality platform.

---

## 7. Which existing records can already prove compensable activities without new logging?

### Strong reuse candidates

Existing source events already prove much of professional work:

- `consult_bookings` -> scheduled/completed 1:1 consults
- `consult_windows` -> professional availability/session source
- `escalations` -> routed/urgent review work and resolution
- `chat_messages` -> professional replies / routed interaction history
- `medication_plans` + `medication_plan_audit` -> doctor medication work
- `meal_plans` + audit -> nutritionist plan work
- movement-plan functionality -> coach plan work
- staff consult/session records -> appointment/session delivery
- glucose review notes -> doctor review work
- patient weekly reviews -> structured clinical/review activity
- cohort assignment -> baseline cohort responsibility

### Rule

Do NOT duplicate these events into a second activity log solely for compensation.

A payout calculation can reference/count authoritative source records.

### Possible genuine gap

Only an approved compensable activity with no source event—e.g. an extra manually requested multidisciplinary case conference not represented anywhere—would justify a lightweight approved manual activity entry.

---

## 8. What is the smallest historical snapshot required so later config changes do not alter prior cohort payout calculations?

### Recommended minimum

Do not snapshot the whole financial model.

At the moment commercial terms become effective for an assigned Care Pod, preserve only the agreed facts needed to reproduce the professional payout later.

Minimum per professional/cohort agreement snapshot:

- cohort id
- professional id / role
- effective/accepted date
- base cohort amount agreed for that professional
- version/reference to the applicable compensation terms

For separately billable appointments, store/snapshot against the existing booking when commercialized:

- agreed appointment fee
- professional amount/share
- platform amount/share
- whether included vs separately billed

For extra compensable activity, store the approved amount at the time the item becomes payable rather than recalculating it forever from mutable config.

### What should remain derived

Do not snapshot facts that already exist authoritatively elsewhere, such as:

- consult completion
- escalation resolution
- medication audit
- role
- cohort membership

### Reuse decision

Use mutable config for defaults, but freeze only agreed transaction/commercial values at the point they become binding.

---

# End-to-end reuse flow for Cohort #1

The repository already supports most of the required journey:

`/professionals`
-> existing `leads`
-> Admin Leads review
-> existing staff invite
-> existing auth/profile with professional role
-> existing Care Pod assignment
-> existing consult/escalation/chat/plan workflows
-> existing staff performance/manual review patterns
-> existing super-admin payout/security/payment-info patterns

The missing work is therefore not a new platform. It is mainly connecting a few commercial/onboarding facts into this existing flow.

---

# Minimal gaps remaining after trace

## Small extensions only

1. Optional professional-lead -> existing staff-invite handoff/linkage.
2. Auditable credential verification fact if current staff metadata cannot hold it.
3. Orientation/agreement completion facts if not already represented.
4. Default Care Pod commercial settings in existing config.
5. Historical agreed base-payout snapshot at professional/cohort level.
6. Commercial metadata on existing separately paid consult bookings.
7. Manual quality review fields attached to the existing staff/performance/admin pattern.
8. Professional cohort payout line items integrated with the existing payout/audit/admin conventions.

## New logging only if proven necessary

A minimal manual activity record is justified only for a compensable activity that has no existing authoritative source event.

---

# Implementation gate result

The eight reuse questions are sufficiently answered to proceed to a smallest-change technical plan.

That technical plan must start by inspecting the exact current files for:

- Admin Leads / staff invite actions
- Admin Care Pod assignment action
- `/staff/payouts` and its settlement action
- staff performance implementation
- payment-info implementation
- `automation_config` admin update pattern
- consult booking completion path

The next plan must propose extensions to those existing files/flows, not new parallel systems.
