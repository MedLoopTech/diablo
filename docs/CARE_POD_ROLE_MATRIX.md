# Loop/90 Care Pod Role & Workload Matrix

Status: Phase 1C operating specification. Documentation only.

## 1. Purpose

Define who does what inside a Loop/90 Care Pod, what work is baseline versus additional, and what should be handled by AI / platform automation instead of scarce professional time.

This document uses the existing product architecture: one doctor, one clinical nutritionist, one movement coach, and an AI coach supporting a 90-day cohort.

## 2. Operating principle

Humans own judgment. The platform owns repetition.

AI / backend should handle routine education, reminders, summarization, preparation, routing, and administrative nudges. It must not make medication decisions or independently handle safety-sensitive clinical questions.

The Care Pod should not become a WhatsApp-style unlimited-access service where every professional is expected to respond to every participant message.

## 3. Responsibility matrix

| Activity | Doctor | Nutritionist | Movement Coach | AI / Backend |
|---|---|---|---|---|
| Routine program Q&A | No routine ownership | No routine ownership | No routine ownership | Primary first layer |
| Medication / dosage decisions | Owns | No | No | Never; route to doctor |
| Urgent clinical escalation | Owns clinical response | Support if relevant | Support if relevant | Detect / route / alert |
| Routine glucose flags | Reviews according to queue / SLA | No | No | Detect, summarize, prioritize |
| Nutrition questions | Clinical oversight when needed | Owns routed questions | No | Answer safe routine questions; route uncertain cases |
| Meal plan | Clinical constraints when needed | Owns | No | Draft / summarize support only |
| Meal-photo review | Exception / clinical only | Reviews selected / routed items | No | First-pass analysis and routine feedback |
| Movement plan | Medical restrictions if relevant | No | Owns | Support / reminders |
| Movement questions | Clinical restrictions if relevant | No | Owns routed questions | Answer safe routine questions; route uncertain cases |
| Group education | Selected clinical sessions | Nutrition sessions | Movement sessions | Scheduling / reminders / resources |
| 1:1 appointment | Clinical / medical | Nutrition | Movement | Scheduling + context preparation |
| Cohort case review | Owns medical perspective | Owns nutrition perspective | Owns movement perspective | Prepare summaries |
| Documentation | Required for clinical actions | Required for professional actions | Required for professional actions | Autofill / summarize where safe |
| Participant reminders | No | No | No | Owns |
| Adherence nudges | No routine ownership | No routine ownership | No routine ownership | Owns |
| Escalation routing | Receives doctor cases | Receives nutrition cases | Receives coach cases | Owns classification / routing |
| Medication audit trail | Creates / edits plans | No | No | Enforce + record |

## 4. Doctor workload

### Baseline responsibilities

- Review urgent clinical escalations.
- Review routine glucose flags according to the agreed operating cadence.
- Own every medication decision made inside Loop/90.
- Review participant context when a clinical consultation is booked.
- Document clinical decisions.
- Participate in required multidisciplinary case review.
- Follow the program's escalation and safety protocol.
- Provide clinical oversight for questions outside nutrition / movement scope.

### Additional / separately compensable candidates

- Additional scheduled 1:1 clinical consultation outside baseline allowance.
- Additional multidisciplinary case conference requested for a complex participant.
- Additional structured clinical review explicitly assigned beyond baseline queue expectations.

### Workload target

The current professionals page describes approximately 30 minutes/day per cohort. Treat this as a planning hypothesis, not a guaranteed workload.

For Cohort #1, track actual time and event counts so this assumption can be validated.

### Suggested SLA categories

- RED / urgent: immediate platform notification; clinical response according to the approved emergency / urgent protocol.
- AMBER doctor-routed: same operating day where practical, with exact contractual SLA approved before launch.
- Routine review queue: daily review cadence.

Do not publish exact response-time promises until the professional agreement and operational coverage are approved.

## 5. Nutritionist workload

### Baseline responsibilities

- Build / approve culturally relevant meal guidance and participant meal plans.
- Review routed nutrition questions.
- Review selected or flagged meal-photo analyses rather than every routine meal image.
- Run the agreed nutrition group sessions.
- Participate in required multidisciplinary case reviews.
- Document material nutrition recommendations.
- Escalate medical, medication, symptom, pregnancy, or out-of-scope questions rather than answering beyond scope.

### Additional / separately compensable candidates

- Additional 1:1 nutrition consultation outside baseline allowance.
- Additional individualized plan redesign triggered by material participant circumstances.
- Additional group workshop requested by Loop/90.
- Complex multidisciplinary review beyond normal cadence.

### Workload principle

AI should absorb repetitive food-identification, routine educational feedback, and reminders. Nutritionist time should concentrate on personalization, exceptions, adherence barriers, and professional judgment.

## 6. Movement Coach workload

### Baseline responsibilities

- Create / approve safe home-based movement routines within role scope.
- Run the agreed live movement sessions.
- Review routed movement / activity questions.
- Support adherence and progression within the approved program.
- Document material individualized recommendations.
- Escalate symptoms, medical contraindications, medication questions, or other clinical issues.

The current recruitment page describes two live sessions per week plus asynchronous support. Treat this as the Cohort #1 planning baseline.

### Additional / separately compensable candidates

- Additional 1:1 movement consultation outside baseline allowance.
- Additional individualized movement-plan redesign.
- Additional group session requested by Loop/90.

## 7. AI Coach workload

The AI Coach is the always-on first layer, but not a clinician.

### AI owns

- Routine program questions within approved knowledge boundaries.
- Routine reminders and nudges.
- Safe educational explanations.
- Meal-photo first-pass analysis.
- Summarizing recent participant context for professionals.
- Routing questions to the correct role.
- Detecting keywords / patterns requiring human review.
- Preparing context for consult bookings.
- Repetitive administrative guidance.

### AI never owns

- Medication initiation, stopping, dosage, or adjustment.
- Diagnosis.
- Urgent clinical management.
- Safety-sensitive symptom advice that should be routed.
- Pregnancy-related clinical advice.
- Questions where confidence or scope is uncertain.

When uncertain, route to a human.

## 8. Backend / operations workload

The platform / Loop/90 operations layer should own:

- Cohort enrollment administration.
- Care Pod assignment.
- Scheduling infrastructure.
- Reminder delivery.
- Payment collection when payments are implemented.
- Professional payout administration when implemented.
- Lab coordination where commercially offered.
- Credential workflow administration.
- Attendance / session administration.
- Support tickets that are not professional-care questions.
- Reporting and cohort-level operational dashboards.

## 9. Baseline versus additional work rule

Before an activity can be separately compensated, ask:

1. Is this explicitly part of the professional's baseline role?
2. Is it already covered by the base cohort allocation?
3. Was it generated by an approved workflow rather than self-created for compensation?
4. Is there an auditable source record?
5. Is the activity complete and documented?

If the answer to #1 or #2 is yes, it should normally not create an additional payout item.

## 10. Suggested Cohort #1 baseline allowances

Exact quantities require commercial approval, but the first agreement should explicitly state baseline allowances such as:

- Number / cadence of required group sessions.
- Routine review cadence.
- Number of multidisciplinary pod meetings.
- Whether any participant-specific 1:1 appointments are included in the base program.
- Expected asynchronous availability windows.
- Documentation expectations.

Do not use the phrase unlimited support.

## 11. Handoff rules

### To doctor

Route when the question involves medication, dosage, significant symptoms, glucose safety thresholds, pregnancy, medical diagnosis, other conditions, or any issue outside another professional's safe scope.

### To nutritionist

Route individualized food / meal-plan questions requiring professional judgment when no medical red flag is present.

### To movement coach

Route individualized movement / exercise questions requiring professional judgment when no medical red flag is present.

### Cross-role

A professional who identifies an issue outside their scope should hand it off through the platform rather than informally assuming another role's responsibility.

## 12. Required workload instrumentation

Cohort #1 should measure, per role:

- Number of routed questions.
- Response times.
- Number of escalation reviews.
- Number of consults.
- Number and duration of group sessions.
- Number of individualized plans / revisions.
- Documentation events.
- Estimated professional minutes / hours.
- AI-handled versus human-routed interactions.

This data is required before changing compensation economics.

## 13. Decisions required before implementation

1. Exact number of baseline group sessions by role.
2. Exact routine review cadence.
3. Exact response SLAs for Amber work.
4. Whether any 1:1 appointments are included in the PKR 20,000 program price.
5. Maximum cohort size for the founding cohort.
6. Backup coverage when the assigned professional is unavailable.
7. Whether a professional can serve multiple simultaneous Care Pods and under what workload cap.
