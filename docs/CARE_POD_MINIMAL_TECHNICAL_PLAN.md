# Loop/90 Care Pod — Minimal Technical Plan

Status: implementation planning only. No runtime changes in this branch.

This plan is intentionally reuse-first. It maps the approved Care Pod business rules onto files and patterns that already exist in `main`.

## 1. Existing files / flows to reuse

### Admin / staff / Care Pod

- `app/(staff)/staff/admin/actions.ts`
  - already contains `assignPod()`
  - already contains `inviteStaff()`
  - already contains `saveAutomationConfig()`
  - already contains `updateLeadStatus()`
  - already contains super-admin gating for money/config actions

- `app/(staff)/staff/admin/AdminPanels.tsx`
  - already provides the Admin UI surface for staff, leads, cohorts, settings, automation and referrals

### Payouts

- `app/(staff)/staff/payouts/page.tsx`
- `app/(staff)/staff/payouts/PayoutsPanel.tsx`

These are the existing super-admin payout surfaces and should be extended before considering any separate Care Pod finance screen.

### Performance / quality

- `app/(staff)/staff/performance/page.tsx`

This should be inspected/extended first for manual Green/Amber/Red professional review rather than creating a new quality module.

### Consults / 1:1 appointments

- `app/(staff)/staff/consults/actions.ts`
- `app/(staff)/staff/consults/page.tsx`
- `app/(staff)/staff/consults/ConsultForm.tsx`
- existing `consult_windows`
- existing `consult_bookings`

Use this as the only scheduling source for paid and included 1:1 care.

### Care Pod assignment

Existing `assignPod()` upserts the current `care_pods` record for a cohort. Do not add another Care Pod assignment flow.

### Recruitment -> staff

Existing flow is:

`/professionals` -> `leads` -> Admin Leads -> existing `inviteStaff()` -> `profiles` role -> existing `assignPod()`.

Do not create an applicant user table for Cohort #1.

---

# 2. Implementation sequence

## Step A — Commercial defaults only

Use existing `automation_config` and `saveAutomationConfig()` for mutable defaults.

Candidate approved keys, subject to current Settings grouping conventions:

- `loop90_list_price_pkr`
- `loop90_founder_price_pkr`
- `care_pod_doctor_base_pkr`
- `care_pod_nutritionist_base_pkr`
- `care_pod_coach_base_pkr`
- `care_pod_extra_activity_cap_pkr`
- `care_pod_paid_consult_fee_pkr`
- `care_pod_paid_consult_professional_share_pct`

Do not hardcode these values in the UI.

Do not store earned payouts in `automation_config`.

## Step B — Professional lead -> existing staff invite handoff

Do not automate approval.

Smallest useful improvement:

- From the existing Admin Leads professional row, offer a super-admin action that launches/pre-fills the existing staff invite flow using the lead's known details.
- Continue to use `inviteStaff()` as the actual account creation path.
- Keep human approval / credential review before invite.

Only add a durable lead-to-profile link if needed to prevent duplicate invitations or support audit/history.

No new applicant subsystem.

## Step C — Credential/orientation/agreement facts

First inspect current staff/profile metadata and performance/payment-info structures.

If these facts are genuinely absent, add only the minimum professional-onboarding facts required to know whether someone is eligible for Care Pod assignment:

- credentials verified yes/no + reviewer/date
- orientation complete yes/no + date
- agreement/protocol version accepted + accepted_at

Prefer one small repo-consistent extension over separate tables for each concept.

Do not build an LMS.

## Step D — Freeze the base cohort commercial agreement

Mutable config defines defaults, but the assigned professional's agreed base amount must not change retroactively when config changes.

At the point a professional is activated/assigned to a cohort, preserve only:

- cohort
- professional
- role
- agreed base amount
- applicable terms/version
- effective/accepted date

Before adding any new storage, inspect whether current payment-info/payout structures can hold this cleanly.

Do not snapshot the entire financial model.

## Step E — Reuse consult bookings for paid 1:1 care

Do not create a second appointment table.

Extend the existing consult booking/completion path only if needed to distinguish:

- included vs separately billable
- agreed fee
- professional amount/share
- platform amount/share
- payable/settled state

Commercial values should be frozen on the booking once the separately paid appointment is confirmed, so later config changes do not rewrite the amount.

Use the existing booking status as the operational truth for completed/cancelled/no-show.

## Step F — Manual quality review in existing performance flow

Start from `app/(staff)/staff/performance/page.tsx`.

Cohort #1 needs only:

- Green / Amber / Red
- reason
- reviewer
- reviewed_at
- optional score inputs if the existing performance page already calculates suitable process metrics

Do not create automatic deductions.

Base cohort pay is not automatically reduced by this status. Variable activity eligibility follows the approved agreement and human review.

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

Extend existing payout conventions so super-admin can review professional cohort payouts alongside the existing settlement patterns.

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

For Cohort #1, keep actual bank transfer/manual settlement outside the app if that is how current payouts operate. The app's responsibility is accurate approval, audit and paid-state recording.

Reuse existing:

- super-admin authorization
- payment-info patterns
- platform currency formatter/config
- audit-before-paid-state behavior
- payout UI conventions

---

# 3. Existing file changes likely involved

This is a likely map, not permission to edit all files.

### `app/(staff)/staff/admin/actions.ts`

Possible minimal extensions:

- reuse/save new approved config values
- optional professional-lead -> `inviteStaff()` handoff
- optional credential/orientation status admin actions if that belongs in current admin pattern

Do not change `assignPod()` unless assignment eligibility needs a narrow guard/check.

### `app/(staff)/staff/admin/AdminPanels.tsx`

Possible minimal extensions:

- expose approved commercial defaults in the existing appropriate config section
- lead-to-invite convenience action
- verification/orientation markers only if they fit current Staff/Leads UI

### `app/(staff)/staff/consults/*`

Possible minimal extensions only for separately paid bookings.

Do not fork booking behavior.

### `app/(staff)/staff/performance/page.tsx`

Primary candidate for manual professional quality view/review.

### `app/(staff)/staff/payouts/*`

Primary candidate for Care Pod payout preview, approval and paid-state reuse.

### Existing migrations

Only one small migration should be proposed at a time after Claude Code verifies that current tables cannot represent the required facts.

Do not pre-plan a large compensation schema migration.

---

# 4. Things NOT to change

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

# 5. First implementation slice recommended

The safest first runtime slice after review is NOT payout calculation.

It should be:

1. Add approved commercial defaults to existing config/admin settings.
2. Add a convenience handoff from an approved professional lead into the existing staff invite flow, if the team wants it.
3. Add the minimum credential/orientation/agreement completion markers only if current data cannot represent them.

This gives recruitment/onboarding a complete operational path without touching clinical logic or financial settlement yet.

Second slice:

1. Add/freeze cohort-professional agreed base commercial facts.
2. Extend existing consult bookings for separately paid appointment metadata.
3. Add manual quality review to existing performance flow.

Third slice:

1. Extend existing payouts page to calculate/display Care Pod payout preview.
2. Reuse existing paid-state/audit/payment-info conventions.

---

# 6. Stop conditions

Stop and re-review before implementation if any proposed change requires:

- a second professional identity model
- a second Care Pod model
- a second booking system
- a new generic accounting ledger
- a new automated quality engine
- duplicated clinical activity logs
- changes to safety thresholds or medication boundaries

Those would indicate the plan has drifted away from the existing architecture.
