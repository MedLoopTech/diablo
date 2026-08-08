# Loop/90 Care Pod — Minimal Technical Plan

Status: reuse-first implementation plan.

## 1. Existing architecture remains authoritative

Reuse the current product flow and do not create replacements:

`/professionals` -> `leads` -> Admin review -> existing `inviteStaff()` -> `profiles` role -> existing `assignPod()` -> existing consult/escalation/plan workflows -> existing performance/payout conventions.

Existing surfaces to extend when required:

- `app/(staff)/staff/admin/actions.ts`
- `app/(staff)/staff/admin/AdminPanels.tsx`
- `app/(staff)/staff/consults/*`
- `app/(staff)/staff/performance/page.tsx`
- `app/(staff)/staff/payouts/*`
- `automation_config`
- existing referral/payment/audit conventions

## 2. Completed minimal slices

### Commercial defaults

Implemented in `supabase/migrations/00000000000045_care_pod_commercial_config.sql` using the existing `automation_config` table.

No React/admin code was needed because the existing Settings tab already renders rows in the `general` group.

These values are mutable defaults only, never historical earned payout records.

### Professional activation facts

Implemented in `supabase/migrations/00000000000046_professional_activation_facts.sql` by extending the existing `profiles` table only.

No professional/onboarding/agreement subsystem was introduced.

The minimum activation facts are:

- `credentials_verified_at`
- `credentials_verified_by`
- `care_pod_orientation_completed_at`
- `care_pod_agreement_version`
- `care_pod_agreement_accepted_at`

Null timestamps mean the gate is incomplete. Timestamps provide both status and audit information without duplicate boolean fields.

The existing `profiles_admin_update` RLS policy already allows admins to update profile fields, so no new RLS policy is needed.

## 3. Next minimal implementation step

Wire the activation facts into the **existing Admin -> Staff** flow only.

Required behavior:

- Show whether credentials are verified.
- Show whether Care Pod orientation is complete.
- Show whether an agreement/protocol version has been accepted.
- Let an authorized admin record/clear those facts.
- Record the acting admin for credential verification.
- Do not create a separate credentialing page or onboarding application.

Do not yet block `assignPod()` automatically. First confirm the operational process works with real staff; assignment enforcement can be a narrow guard later if required.

## 4. Then freeze cohort-commercial facts

After activation UI is working, inspect existing payout/payment structures before adding any storage.

The assigned professional's agreed base amount must eventually be frozen per cohort so later config changes do not rewrite historical terms.

Minimum facts when needed:

- cohort
- professional
- role
- agreed base amount
- applicable terms/version
- effective/accepted date

Do not snapshot the entire financial model.

## 5. Reuse consult bookings for paid 1:1 care

Do not create another appointment system.

Only if required, extend existing `consult_bookings` to distinguish:

- included vs separately billable
- agreed fee
- professional amount/share
- platform amount/share
- payable/settled state

Commercial values must be frozen on the booking when confirmed.

## 6. Manual quality review

Start from the existing performance flow.

Cohort #1 needs only:

- Green / Amber / Red
- reason
- reviewer
- reviewed_at

Do not create automated deductions or clinical-outcome scoring.

## 7. Payouts

Extend the existing Payouts surface only after the above facts exist.

First useful Care Pod payout view:

- professional
- role
- cohort
- base amount
- approved extra activity
- paid-consult amount
- quality eligibility/hold state
- calculated total
- settlement state

Reuse existing super-admin authorization, platform currency, payment-info patterns, audit behavior and paid-state conventions.

## 8. Stop conditions

Stop and re-review if a proposed change requires:

- a second professional identity model
- a second Care Pod model
- a second booking system
- a new generic accounting ledger
- a new automated quality engine
- duplicated clinical activity logs
- changes to safety thresholds or medication boundaries
