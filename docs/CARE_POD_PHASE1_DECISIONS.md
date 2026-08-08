# Loop/90 Care Pod — Phase 1 Business Decisions

Status: Recommended Cohort #1 defaults for founder approval and implementation planning.

This document converts the open questions in Phase 1B–1E into a deliberately simple founding-cohort operating model. These are product/business defaults, not legal or clinical advice. Clinical safety rules already present in the application remain authoritative.

## 1. Commercial anchor

- Program/list-value anchor: PKR 25,000.
- Founding-cohort realized price: PKR 20,000.
- Base financial planning must recognize PKR 20,000 per paid participant, not PKR 25,000, unless the higher amount is actually collected.
- Founding cohort target: 30–40 paid participants.
- Platform may retain higher technical capacity; this commercial limit does not require reducing schema capacity.

## 2. Care Pod baseline compensation

For Cohort #1, retain the existing fixed role baselines:

- Doctor: PKR 52,500.
- Nutritionist: PKR 42,500.
- Movement Coach: PKR 32,500.
- Total: PKR 127,500.

At 40 participants x PKR 20,000, this is approximately 15.94% of realized revenue.

Do not implement a 30% revenue-share pool for Cohort #1.

Reason: fixed baseline compensation is easier to understand, audit, contract, and test before real workload data exists.

## 3. Payout milestones

Recommended Cohort #1 settlement schedule:

- 25% of base allocation after professional activation + cohort start + completion of required onboarding obligations.
- 35% after Day 30, subject to active participation and no unresolved material non-performance.
- 40% after Day 90 / cohort close and required documentation / handover completion.

Activity and appointment compensation should be settled at the next approved payout cycle after becoming payable.

This milestone schedule should be reviewed by legal/tax advisers before being embedded in contracts.

## 4. Activity compensation model

Use fixed PKR amounts, not points, for Cohort #1.

Recommended initial catalogue:

| Activity | Doctor | Nutritionist | Movement Coach | Rule |
|---|---:|---:|---:|---|
| Additional 1:1 program review, not a separately billed appointment | PKR 1,500 | PKR 1,000 | PKR 1,000 | Must be assigned/approved and outside baseline allowance |
| Additional group session requested by Loop/90 | PKR 3,000 | PKR 2,500 | PKR 2,500 | Outside agreed baseline session cadence |
| Additional multidisciplinary complex-case review | PKR 1,500 | PKR 1,000 | PKR 1,000 | Per participating professional; source case required |
| Additional structured follow-up | PKR 1,000 | PKR 750 | PKR 750 | Must be assigned and documented |
| Additional escalation review beyond baseline queue obligation | PKR 1,500 | PKR 1,000 | PKR 1,000 | Only where role-appropriate and explicitly marked compensable |

These are founding-cohort operating defaults and should remain configurable, not hardcoded business constants.

### Activity budget cap

Total additional activity compensation for the whole Care Pod should be capped at PKR 30,000 per 40-person Cohort #1 unless an admin explicitly approves an exception.

This cap protects contribution margin while real workload is being measured.

At smaller cohort sizes, use the same cap initially only if the base payout remains fixed; finance should monitor the effective Care Pod percentage closely.

## 5. Included versus separately paid 1:1 care

Cohort #1 should include limited participant-specific professional review required by safety and routine program delivery, but should NOT promise unlimited 1:1 appointments.

Recommended participant entitlement:

- Required safety/clinical escalations: included; never blocked by payment.
- Routine cohort-level professional support: included.
- One scheduled nutrition 1:1 during the 90 days: included when clinically/programmatically appropriate.
- One scheduled movement 1:1 during the 90 days: included when programmatically appropriate.
- Doctor 1:1: included when clinically indicated by the Care Pod / escalation workflow; not marketed as an on-demand unlimited entitlement.
- Additional elective 1:1 appointments: separately billed.

This entitlement should be tested against actual professional workload before final launch copy is changed.

## 6. Additional appointment pricing

Recommended Cohort #1 pilot price:

- Additional 1:1 appointment: PKR 2,000.
- Professional share: 70% = PKR 1,400.
- Loop/90 platform/coordination share: 30% = PKR 600.

This is a pilot commercial rule and must remain configurable.

Cancellation recommendation:

- Cancelled >=12 hours before appointment: no professional payout; participant credit/refund according to payment policy.
- Participant no-show or late cancellation: 50% of professional share may become payable if the professional was available and attendance can be verified.
- Professional cancellation: no payout; participant receives rebooking priority / credit.
- Completed appointment: full approved professional share payable.

Clinical safety escalation must never require a participant to purchase an appointment before receiving appropriate urgent guidance/routing.

## 7. Baseline workload — Doctor

Cohort #1 baseline should include:

- Daily review of doctor-routed / glucose review queue on operating days.
- Urgent escalation participation according to the approved clinical coverage protocol.
- Medication decisions and medication-plan documentation.
- Up to 2 scheduled cohort clinical education / Q&A sessions across the 90 days.
- Up to 4 multidisciplinary Care Pod review meetings across the 90 days.
- Clinically indicated participant reviews generated by the existing escalation workflow within the agreed workload envelope.

Planning target: approximately 30 minutes/day average per cohort, but instrument actual time rather than treating this as a guarantee.

## 8. Baseline workload — Nutritionist

Cohort #1 baseline should include:

- Initial nutrition framework / meal-plan workflow for enrolled participants.
- Review of routed nutrition questions and flagged meal issues.
- 1 nutrition group session per week for the cohort, with flexibility to combine education/Q&A formats.
- Up to 4 multidisciplinary Care Pod review meetings.
- Included participant-specific nutrition 1:1 entitlement described above.
- Material recommendation documentation.

AI should handle routine food education and first-pass meal feedback so the nutritionist is not required to manually review every routine meal photo.

## 9. Baseline workload — Movement Coach

Cohort #1 baseline should include:

- Approved cohort movement framework.
- 2 live movement sessions per week, consistent with current recruitment positioning.
- Review of routed movement questions.
- Up to 4 multidisciplinary Care Pod review meetings.
- Included participant-specific movement 1:1 entitlement described above.
- Material individualized recommendation documentation.

## 10. Response SLA defaults

Do not promise 24/7 human response.

Recommended internal Cohort #1 targets:

- GREEN: AI/backend handles immediately where appropriate.
- AMBER nutrition/movement: acknowledge/resolve within 1 operating day where practical.
- AMBER doctor-routed non-urgent: review within the same operating day where practical.
- RED: immediate system alert and urgent workflow under the existing clinical protocol; exact doctor coverage/escalation timing must be finalized operationally before launch.

These are operating targets, not emergency-service guarantees.

## 11. Professional quality model

Use a simple human-reviewable score for Cohort #1.

Recommended dimensions and weights:

- Response SLA adherence: 25%.
- Documentation completeness: 20%.
- Attendance/session reliability: 20%.
- Assigned-task completion: 15%.
- Care Pod collaboration/meeting participation: 10%.
- Scope adherence / appropriate escalation: 10%.

Participant feedback should be visible as a supporting signal but should NOT directly determine payout in Cohort #1 because early sample sizes can be small and biased.

### Status thresholds

- GREEN: >=85%.
- AMBER: 70–84%.
- RED: <70%, or a material safety/conduct breach regardless of numeric score.

### Compensation effect

- GREEN: 100% of approved activity compensation.
- AMBER: 85% of approved activity compensation, subject to human review.
- RED: variable compensation placed on hold for human review; no automatic forfeiture.

Base cohort allocation is not automatically reduced by the score. Material non-performance affecting base pay must follow the professional agreement and human review.

## 12. Quality safeguards

Never score professionals on:

- HbA1c reduction.
- Remission.
- Medication reduction.
- Weight loss.
- Participant glucose outcome.

Never create an incentive to classify more cases as urgent or to create unnecessary activities.

A professional must be able to see the reason for any Amber/Red status and dispute factual errors.

## 13. Professional coverage

Founding cohort requirement:

- One primary doctor, nutritionist, and movement coach assigned.
- Backup professional coverage must be identified before activation for critical absence/withdrawal.
- A professional may support multiple cohorts only after admin approval based on measured workload; do not set an unlimited number of concurrent Care Pods.

For Cohort #1, default maximum active assignment should be 2 Care Pods per professional until workload data supports a higher cap. Doctor urgent-coverage arrangements may require a stricter cap.

## 14. Refund interaction

Recommended principle:

- Professional compensation is earned for verified work actually performed.
- A participant refund should not automatically claw back professional pay for completed, approved work unless the professional caused the refund through defined material breach/non-performance.
- Unperformed future base milestones and future appointments are not payable after participant exit where the agreement provides for this.

Exact accounting/tax/legal treatment requires final review.

## 15. Cohort #1 financial guardrail

At 40 participants and PKR 20,000 realized price:

- Revenue: PKR 800,000.
- Base Care Pod: PKR 127,500.
- Maximum routine activity budget: PKR 30,000.
- Base + activity maximum before additional appointment economics: PKR 157,500, or approximately 19.7% of realized revenue.

This intentionally keeps the planned Care Pod cost below ~20% before separately funded appointment payouts.

Additional appointments create additional revenue and should be evaluated on their own unit economics.

## 16. Implementation principle

Do not implement compensation as scattered constants across UI and API code.

When implementation is approved:

- Keep rates/configuration versioned.
- Tie every payout item to an auditable source.
- Separate clinical severity from professional quality status.
- Use the existing consult booking and escalation architecture.
- Preserve current medication and urgent-glucose safety rules.
- Give admins a review/approval step before payout becomes final.

## 17. Decisions deferred until Cohort #1 data

Do not over-decide these yet:

- Permanent revenue-share percentage.
- Permanent activity point system.
- Higher professional payout tiers.
- Automated quality deductions.
- More than 2 concurrent Care Pods per professional.
- Complex bonuses.
- Outcome-linked compensation.

## 18. Cohort #1 review trigger

After Day 90, compare actual data with these assumptions and explicitly review:

- Actual professional hours by role.
- AI deflection rate.
- Activity budget usage.
- Appointment demand.
- SLA performance.
- Participant feedback.
- Professional satisfaction.
- Care Pod cost per participant.
- Contribution margin.

Only then decide whether Cohort #2 should retain the fixed model, move toward 18–20% revenue-linked economics, or change the base/activity/appointment mix.
