# Loop/90 Care Pod Compensation Specification

Status: Phase 1B business specification. Documentation only; no runtime or schema implementation in this branch.

## 1. Purpose

Define a commercially sustainable, auditable compensation model for the Loop/90 Care Pod without tying professional pay to patient clinical outcomes.

This specification layers commercial logic on top of the existing cohort, care_pods, consult_windows, consult_bookings, escalations, and professional-role architecture. It must not create a second Care Pod model.

## 2. Current commercial baseline

Founding-cohort commercial model:

- Program / list-value anchor: PKR 25,000.
- Base-case realized founding-cohort price: PKR 20,000.
- Initial operating cohort target: 30–40 participants.
- Program duration: 90 days.

Current average cohort professional payouts used for planning:

- Doctor: PKR 52,500.
- Nutritionist: PKR 42,500.
- Movement Coach: PKR 32,500.
- Total baseline Care Pod payout: PKR 127,500.

At 40 participants x PKR 20,000, realized cohort revenue is PKR 800,000 and the current Care Pod payout is approximately 15.94% of realized revenue.

This ~16% share is the Cohort #1 planning benchmark. Do not replace it with the previously discussed 30% illustrative pool unless a later approved financial model supports that change.

## 3. Compensation formula

The target model is:

Final Professional Payout = Base Cohort Allocation + Eligible Activity Compensation + 1:1 Appointment Compensation

The variable portion is subject to Quality / Participation Eligibility.

The model intentionally separates three kinds of value:

1. Baseline responsibility for being an active Care Pod member.
2. Additional professional work performed during the cohort.
3. Additional participant-specific work delivered through 1:1 appointments.

## 4. Base cohort allocation

For Cohort #1, use the current planning baseline unless commercially revised before launch:

- Doctor: PKR 52,500.
- Nutritionist: PKR 42,500.
- Movement Coach: PKR 32,500.

The base cohort allocation compensates for agreed baseline responsibilities such as scheduled cohort participation, required reviews, protocol compliance, team coordination, and defined availability.

The base allocation should not be casually reduced by quality scoring. Any right to withhold or reduce base compensation must be explicit in the professional agreement and reserved for material non-performance, breach, absence, credential failure, or other defined contractual conditions.

## 5. Activity compensation

Activity compensation pays for approved work above the baseline expectations.

For Cohort #1, keep the activity catalogue intentionally small. Recommended eligible activity types:

1. Additional individual professional review.
2. Additional 1:1 consultation delivered within the program but outside the baseline package.
3. Additional group session requested by the program.
4. Multidisciplinary case review requiring documented professional input.
5. Structured follow-up assigned by the Care Pod workflow.
6. Escalation review requiring professional action beyond normal queue handling.

Do not pay separate activity credits for routine actions already included in the base role unless the approved workload matrix says otherwise.

### Cohort #1 recommendation

Prefer fixed PKR values per approved activity over an abstract points system. Activity units may be introduced after Cohort #1 when real workload data exists.

Every compensable activity must include:

- professional_id
- cohort_id
- participant_id when applicable
- activity_type
- source / reason
- started_at / completed_at where relevant
- status
- approved / verified state
- linked consultation, escalation, session, or other source record when applicable
- audit timestamps

## 6. 1:1 appointment economics

Participant-specific appointments are a separate commercial layer from the base cohort allocation.

Target flow:

Participant requires additional support -> books role-appropriate appointment -> appointment is completed -> professional earns appointment compensation -> Loop/90 retains the approved platform / coordination share.

Previously discussed illustration only:

- Appointment price: PKR 2,000.
- Professional share: 70%.
- Loop/90 share: 30%.

These values are NOT approved product configuration and must not be hardcoded until commercially approved.

Appointment compensation should link to the existing consult_bookings architecture rather than create a parallel scheduling system.

Required commercial states should eventually distinguish at least:

- booked
- completed and payable
- no-show
- cancelled
- refunded / reversed if applicable
- paid to professional

## 7. Quality / participation eligibility

Quality scoring must measure only factors the professional can reasonably control.

Recommended dimensions:

- Response SLA adherence.
- Documentation completeness.
- Session attendance / reliability.
- Completion of assigned professional tasks.
- Required Care Pod meeting participation.
- Appropriate escalation and scope adherence.
- Participant experience / feedback where collected.
- Professional conduct and protocol compliance.

Quality must NOT directly reward or penalize:

- HbA1c reduction.
- Medication reduction.
- Diabetes remission.
- Weight loss.
- Specific glucose outcomes.
- Any other clinical outcome primarily dependent on participant biology, medication, adherence, or circumstances.

### Suggested status model

GREEN
- Meets required standards.
- 100% eligible for approved variable compensation.

AMBER
- Minor or repeated process issues.
- Variable eligibility may be reduced according to an approved, transparent schedule.
- Professional must be able to see the reason for the status.

RED
- Material non-compliance, safety concern, abandonment, serious documentation failure, repeated missed commitments, or conduct concern.
- Variable compensation is reviewed according to the professional agreement.
- May trigger suspension or replacement workflow.

The first production version should not use opaque algorithmic scoring. Store measurable inputs and allow human review.

## 8. Payout lifecycle

Recommended lifecycle:

DRAFT -> CALCULATED -> REVIEWED -> APPROVED -> SCHEDULED -> PAID

Additional states may include:

- ON_HOLD
- DISPUTED
- REVERSED

A payout calculation should provide a line-item breakdown:

- Base cohort allocation.
- Activity items.
- Appointment items.
- Quality / participation adjustment, if any.
- Reversals or approved adjustments.
- Gross professional payout.
- Tax / withholding information when implemented.
- Net settlement.

The professionals landing page currently promises transparent payouts; the eventual dashboard must therefore show the underlying breakdown, not just a total.

## 9. Financial guardrails

For Cohort #1:

- Use PKR 20,000 as realized ASP in base-case planning.
- Keep baseline Care Pod cost near the current ~16% benchmark unless updated financial modelling approves otherwise.
- Do not commit publicly to role payout figures until the business approves them.
- Do not let activity compensation create an uncapped liability.
- Additional appointments should generally create additional revenue before they create additional payout.

Before implementation, model at least:

- 30 participants.
- 35 participants.
- 40 participants.
- Realized price PKR 20,000.
- Realized price PKR 22,500.
- Realized price PKR 25,000.
- Current professional baseline payouts.
- Care Pod total cost at 16%, 18%, and 20% of realized revenue.

## 10. Cohort #1 configuration recommendation

Keep the first cohort simple:

- Fixed role-based base allocations.
- Small approved activity catalogue.
- Separate paid 1:1 appointment layer.
- Human-reviewed Green / Amber / Red quality status.
- Payout at agreed milestones or cohort completion.

Do not build a complicated algorithm before real operating data exists.

## 11. Audit and safety requirements

All compensation-affecting events should be auditable.

The audit trail should make it possible to answer:

- What activity was performed?
- Which source record proves it?
- Which cohort and participant did it relate to?
- Who approved it?
- Was a quality adjustment applied?
- Why?
- When was it paid?

Financial tables must not be writable by ordinary patients. Professional access should be limited to their own compensation data. Admin / finance privileges should be explicit.

## 12. Candidate implementation model — not approved migration

Potential future entities, names subject to repository conventions:

- care_pod_compensation_plans
- professional_activities
- professional_quality_reviews
- professional_payouts
- professional_payout_items
- appointment_compensation_rules

Do NOT create these migrations until this specification, the role matrix, and the agreement requirements are approved.

## 13. Open commercial decisions before implementation

1. Is the base allocation fixed by role or derived from a Care Pod pool?
2. Which activities are above baseline and therefore separately payable?
3. What exact PKR amount applies to each eligible activity?
4. Which 1:1 appointments are included in the program price versus separately charged?
5. What is the appointment price and professional / Loop/90 split?
6. What payout milestones apply during the 90-day cohort?
7. How are participant refunds treated after professional work has already been completed?
8. How are taxes / withholding handled?
9. What exact Amber variable-payment schedule is acceptable?
10. Who has authority to approve, dispute, and reverse professional payouts?

## 14. Cohort #1 learning metrics

After Cohort #1, measure:

- Actual doctor hours.
- Actual nutritionist hours.
- Actual movement-coach hours.
- Number and type of additional activities.
- Number and type of 1:1 appointments.
- AI deflection rate.
- Escalation volume.
- Quality exceptions.
- Professional satisfaction.
- Care Pod cost per participant.
- Contribution margin.

Use these data to decide whether the ~16% Care Pod baseline should remain, increase, decrease, or move toward a more appointment-led model.
