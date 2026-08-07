# Personas — Diabetes Remission

Ranked per `CONSTITUTION.md` §3. Every content brief should load the matching persona file before drafting — it sets vocabulary, objections to pre-empt, and which channels to prioritize.

| # | Persona | File |
|---|---------|------|
| 1 | Patient (T2D, enrolled or considering) | [patient.md](patient.md) |
| 2 | Prediabetes / at-risk family member | [prediabetic-family.md](prediabetic-family.md) |
| 3 | Doctor / GP / endocrinologist | [doctor.md](doctor.md) |
| 4 | Nutritionist & movement coach | [nutritionist-coach.md](nutritionist-coach.md) |
| 5 | Pharma / corporate partner | [pharma-corporate.md](pharma-corporate.md) |
| 6 | Employer | Future — not v1, no persona file yet |
| 7 | Pharmacist | Future — not v1, no persona file yet |

## Using a persona in a brief

```yaml
persona: patient
domain: diabetes-remission
channel: whatsapp
```

The `writing` skill loads the persona's **voice cues** and **objections to pre-empt** sections; `chief-content-strategist` uses **goals** and **channels** to pick angle and format.
