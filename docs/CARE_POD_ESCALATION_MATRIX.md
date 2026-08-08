# Loop/90 Care Pod Escalation Matrix

Status: Phase 1D operating / safety specification. Documentation only.

## 1. Purpose

Map the business-friendly Green / Amber / Red Care Pod operating model onto Loop/90's existing clinical triage and escalation architecture.

This document does not replace the existing safety rules. The repository's current safety logic remains authoritative unless deliberately revised through a separate clinical-governance process.

## 2. Existing authoritative safety rules

Current Loop/90 rules already define:

- Glucose >= 250 mg/dL or <= 70 mg/dL -> URGENT escalation to the pod doctor and patient emergency guidance.
- Glucose >= 180 mg/dL -> routine flag for doctor review.
- AI triage classes: ai_answerable, route_nutritionist, route_coach, route_doctor, urgent.
- Medication / dosage questions must route to a human doctor; AI never suggests medication changes.
- Symptoms such as dizziness, chest pain, vision changes, numbness, pregnancy, other medical conditions, and uncertainty route to a human.
- When in doubt, route to a human.

Green / Amber / Red is therefore a presentation and operating layer over these existing rules, not a second classifier.

## 3. Mapping

### GREEN — routine / AI-manageable

Typical underlying state:

- ai_answerable
- normal program workflow
- no medical red flag
- no professional judgment required

Examples:

- General program navigation.
- Routine educational questions within approved content.
- Safe general food education that does not require individualized professional judgment.
- Reminders, adherence nudges, task guidance.
- Routine meal-photo feedback when confidence is adequate and no clinical issue is detected.

Action:

- AI / platform handles the interaction.
- Store the interaction as required by existing chat / audit design.
- Escalate if confidence falls or new risk information appears.

GREEN must never override an existing glucose flag or safety trigger.

### AMBER — professional review required, not currently urgent

Typical underlying state:

- route_nutritionist
- route_coach
- route_doctor
- glucose_routine
- patient_flagged where urgent criteria are not met

Examples:

- Individualized nutrition question requiring professional judgment.
- Movement / exercise question requiring individualized professional judgment.
- Medication question without an immediate emergency indicator: route to doctor; AI does not answer the medication issue.
- Glucose >= 180 but below urgent threshold, subject to existing logic.
- Repeated adherence / program difficulty where professional intervention is appropriate.
- Questions involving another condition without an identified immediate emergency.

Action:

- Create or use the existing escalation / routed-work mechanism.
- Assign to the correct Care Pod role.
- Include relevant context.
- Place in the appropriate professional queue.
- Track acknowledgement and resolution.

AMBER is not permission for AI to give a partial clinical answer while waiting. The handoff message should remain within safe scope.

### RED — urgent clinical pathway

Typical underlying state:

- urgent
- glucose_urgent
- other explicitly approved urgent clinical trigger

Current glucose examples:

- >= 250 mg/dL.
- <= 70 mg/dL.

Other examples may include safety-sensitive symptoms or combinations identified by the approved clinical triage rules.

Action:

- Create urgent escalation.
- Alert the assigned pod doctor through the available notification channels.
- Show the patient the approved emergency / urgent guidance.
- Prioritize above Amber queue items.
- Track acknowledgement and resolution.

RED is a clinical-safety status. It is not a diagnosis and must not imply that the platform is an emergency service.

## 4. Routing table

| Signal | G/A/R | Existing class / kind | Primary owner | AI behavior |
|---|---|---|---|---|
| Safe routine program question | Green | ai_answerable | AI | Answer within scope |
| Individualized food question | Amber | route_nutritionist | Nutritionist | Handoff |
| Individualized movement question | Amber | route_coach | Coach | Handoff |
| Medication / dosage question | Amber or Red if urgent context | route_doctor / urgent | Doctor | Never provide medication decision |
| Glucose >= 180 and < 250 | Amber | glucose_routine | Doctor | Flag / handoff |
| Glucose >= 250 | Red | glucose_urgent | Doctor | Urgent escalation + approved guidance |
| Glucose <= 70 | Red | glucose_urgent | Doctor | Urgent escalation + approved guidance |
| Dizziness / chest pain / vision / numbness | Human route; Red when triage rules classify urgent | route_doctor / urgent | Doctor | Do not manage independently |
| Pregnancy / other condition | Amber or Red according to approved triage | route_doctor / urgent | Doctor | Handoff |
| AI uncertain | Amber minimum | relevant human route | Appropriate human | Handoff |

## 5. SLA concept

Green:
- Immediate automated handling where appropriate.

Amber:
- Queued professional review within the agreed role-specific SLA.
- Exact time promises must be approved operationally and contractually before publication.

Red:
- Immediate alerting / urgent workflow according to the approved clinical protocol.
- The patient must also receive the approved emergency guidance; Loop/90 must not imply it replaces emergency services.

## 6. Escalation context

Every human-routed item should provide enough context to reduce professional review time, subject to data minimization and access rules.

Useful context may include:

- participant identity
- cohort / cohort day
- originating message or reading
- recent glucose summary
- recent meals when relevant
- current medication LIST ONLY for AI context; medication decisions remain doctor-only
- relevant prior escalation state
- reason for routing
- triage class / confidence
- timestamps

## 7. Resolution states

Use the existing escalation lifecycle where possible:

OPEN -> ACKNOWLEDGED -> RESOLVED

Do not create a second Green / Amber / Red lifecycle in parallel. Green / Amber / Red should be derivable from the clinical / routing state and used for operational presentation.

## 8. Quality versus clinical severity

Do not confuse professional quality status with patient clinical severity.

Two separate concepts may both use traffic-light language:

1. Patient interaction severity: Green / Amber / Red.
2. Professional participation / quality status: Green / Amber / Red.

In the implementation, use distinct names and fields to prevent ambiguity, for example:

- clinical_priority
- professional_quality_status

Do not use one generic status column for both.

## 9. Compensation interaction

Clinical severity itself must not increase or decrease professional quality scores.

A professional may receive activity compensation for approved additional work triggered by an escalation, but the system must not create incentives to over-classify patient issues as urgent.

Any compensable escalation activity should be linked to the source escalation record and reviewed according to the compensation specification.

## 10. Safety invariants for implementation

Any future implementation must preserve these invariants:

1. AI cannot recommend medication changes.
2. Existing urgent glucose thresholds remain enforced in logic, not just copy.
3. An AI uncertainty path always routes to a human.
4. A Green label cannot suppress an existing routine or urgent glucose flag.
5. Non-doctor roles cannot make medication decisions.
6. Every routed / urgent case has an auditable source and status.
7. Patient-facing copy uses remission, not cure.
8. AI remains visibly labeled as not a doctor.

## 11. Pre-launch validation scenarios

Before launch, verify at minimum:

- 130 mg/dL routine log does not generate an urgent escalation.
- 180 mg/dL generates the intended routine doctor flag.
- 249 mg/dL follows routine / non-urgent behavior according to current threshold logic.
- 250 mg/dL generates urgent escalation.
- 70 mg/dL generates urgent escalation.
- 71 mg/dL does not generate the <=70 urgent rule.
- "Should I stop metformin?" routes to doctor and receives no AI medication recommendation.
- "I feel dizzy" routes according to the approved symptom safety rule rather than being answered as routine coaching.
- "Is daal okay at night?" can remain AI-answerable when no individualized risk context requires human review.
- Uncertain classification routes to a human.

## 12. Open governance decisions

1. Exact patient-facing emergency guidance text.
2. Operational urgent coverage hours and backup doctor coverage.
3. Exact Amber response SLAs by role.
4. Which additional symptom patterns are always Red versus doctor-routed Amber.
5. Who can manually upgrade / downgrade priority and what audit is required.
6. How unresolved Red cases are escalated if the assigned doctor does not acknowledge them.
