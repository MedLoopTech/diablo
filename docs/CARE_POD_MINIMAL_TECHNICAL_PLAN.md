# Loop/90 Care Pod — Minimal Technical Plan

Status: reuse-first implementation plan. Claude Code's current `main` remains the source of truth.

## Governing rule

For every Care Pod requirement, use this order:

1. Reuse existing implementation.
2. Extend an existing table / config / workflow only if needed.
3. Add a small field/config value only if existing structures cannot represent the approved rule.
4. Create a new subsystem only when there is a proven gap.

Do not create duplicate cohort, Care Pod, appointment, escalation, AI triage, recruitment CRM, LMS, performance or payout architecture.

---

# 1. Existing files / flows to reuse

### Admin / staff / Care Pod

- `app/(staff)/staff/admin/actions.ts`
  - `assignPod()`
  - `inviteStaff()`
  - `saveAutomationConfig()`
  - `updateLeadStatus()`
  - existing admin/super-admin gates

- `app/(staff)/staff/admin/AdminPanels.tsx`
  - existing Settings, Staff, Leads, Cohorts, Automation and Referrals surfaces
  - `SettingsTab` already renders every `automation_config` row whose `group_name = 'general'`

### Payouts

- `app/(staff)/staff/payouts/page.tsx`
- `app/(staff)/staff/payouts/PayoutsPanel.tsx`

Extend these conventions before considering any separate Care Pod finance screen.

### Performance / quality

- `app/(staff)/staff/performance/page.tsx`

Inspect/extend this before creating a new quality module.

### Consults / 1:1 appointments

- `app/(staff)/staff/consults/actions.ts`
- `app/(staff)/staff/consults/page.tsx`
- `app/(staff)/staff/consults/ConsultForm.tsx`
- existing `consult_windows`
- existing `consult_bookings`

Use these as the only scheduling source for paid and included 1:1 care.

### Recruitment -> staff

Existing path:

`/professionals` -> `leads` -> Admin Leads -> existing `inviteStaff()` -> `profiles` role -> existing `assignPod()`.

Do not create an applicant user table for Cohort #1.

---

# 2. Implementation sequence

## Step A — Commercial defaults only

### STATUS: IMPLEMENTED ON `codex/care-pod-phase1-specs`

Implemented through:

`supabase/migrations/00000000000045_care_pod_commercial_config.sql`

No React/admin code was needed. The migration reuses the existing `automation_config` table, `saveAutomationConfig()`, and `SettingsTab` renderer.

Added defaults:

- `loop90_program_list_price` = 25000
- `loop90_founding_price` = 20000
- `care_pod_doctor_base_payout` = 52500
- `care_pod_nutritionist_base_payout` = 42500
- `care_pod_coach_base_payout` = 32500
- `care_pod_activity_budget_cap` = 30000
- `care_pod_additional_appointment_price` = 2000
- `care_pod_appointment_professional_share_pct` = 70

These are mutable defaults only. Earned/historical professional obligations must not later be recalculated from changed config values.

## Step B — Professional lead -> existing staff invite handoff

Do not automate approval.

Smallest useful improvement, only if it materially saves admin work:

- from an eligible professional lead row, prefill or invoke the existing Staff invite path using the lead's known name/email/phone and persona -> role mapping
- continue to use `inviteStaff()` as the actual account-creation action
- keep human credential/approval review before invite

If the current Leads + Staff tabs are operationally sufficient for Cohort #1, this convenience step can be deferred rather than adding code merely for convenience.

## Step C — Credential/orientation/agreement facts

First inspect current staff/profile metadata.

If genuinely absent, add only the minimum durable facts required to know whether someone is eligible for Care Pod assignment:

- credentials verified + reviewer/date
- orientation complete + date
- agreement/protocol version accepted + accepted_at

Prefer one small repo-consistent extension. Do not build an LMS.

## Step D — Freeze the base cohort commercial agreement

Mutable config defines defaults, but the assigned professional's agreed base amount must not change retroactively when config changes.

At assignment/activation time preserve only the minimum approved facts:

- cohort
- professional
- role
- agreed base amount
- applicable terms/version
- effective/accepted date

Before adding new storage, inspect whether current payment-info/payout structures can hold this cleanly.

Do not snapshot the full financial model.

## Step E — Reuse consult bookings for paid 1:1 care

Do not create a second appointment table.

Extend the existing booking/completion path only if needed to distinguish:

- included vs separately billable
- agreed fee
- professional amount/share
- platform amount/share
- payable/settled state

Freeze commercial values on the booking once the separately paid appointment is confirmed.

## Step F — Manual quality review in existing performance flow

Start from `app/(staff)/staff/performance/page.tsx`.

Cohort #1 needs only:

- Green / Amber / Red
- reason
- reviewer
- reviewed_at

Do not create automatic deductions or outcome-based scoring.

## Step G — Derive compensable work from existing records

Before creating any activity record, calculate what can be proven from:

- consult bookings
- escalations
- chat/professional replies
- medication plan audit
- meal plan audit
- movement plan records
- glucose review notes
- weekly reviews
- existing session records

Only introduce a minimal manual approved activity entry if an approved compensable activity has no authoritative source event.

## Step H — Extend the existing Payouts page

Do not create a separate Care Pod payout application.

First useful output:

- professional
- role
- cohort
- base amount
- additional approved activity amount
- paid-consult amount
- quality eligibility/hold state
- calculated total
- settlement state

For Cohort #1, manual bank settlement can remain outside the app; the app should focus on accurate calculation, approval, audit and paid-state recording.

Reuse:

- super-admin authorization
- payment-info patterns
- platform currency config/formatter
- audit-before-paid-state behavior
- current payout UI conventions

---

# 3. Things NOT to change

Do not modify or replace:

- existing `care_pods` architecture
- cohort membership model
- role/RLS design
- AI triage taxonomy
- escalation engine
- glucose urgent/routine thresholds
- medication plan ownership/audit
- current scheduling model
- lead CRM
- current super-admin security model

---

# 4. Next implementation decision

After the commercial-default migration, do **not** immediately build payouts.

Next inspect whether the existing professional Lead -> Staff workflow is sufficient for the founding cohort. If yes, skip convenience automation and move directly to the minimum professional activation facts (credential verification, orientation, agreement acceptance).

Only then should the cohort-specific commercial snapshot be designed.

---

# 5. Stop conditions

Stop and re-review before implementation if any proposed change requires:

- a second professional identity model
- a second Care Pod model
- a second booking system
- a new generic accounting ledger
- a new automated quality engine
- duplicated clinical activity logs
- changes to safety thresholds or medication boundaries
