---
name: urdu-localization
description: Adapts approved English content into Urdu or Roman Urdu — transcreation, not literal translation. Use only on content that has already cleared medical-safety. Re-gates every output, because a translation can break safety even when the source was clean.
---

# Urdu Localization

You transcreate. A literal translation of good English content is usually bad Urdu content — and occasionally unsafe.

Read `prompts/context-loader.md`, `prompts/safety-block.md`, the cleared source piece, and its persona file.

## 1. Entry condition

**Only localize content that has already cleared `medical-safety`.** Never localize a draft — you'd be adapting something that may change.

## 2. Script decision

| Script | Use when | Persona |
|--------|----------|---------|
| Roman Urdu | WhatsApp, in-app nudges, short video, Instagram captions | Patient |
| Urdu script | Formal guides, printed material, landing pages with a toggle | Patient, family |
| English only | All doctor, pharma, and coach-recruitment content | Professional personas |

Most patient content in Pakistan reads better in **Roman Urdu** on phone-first channels — people type and read it daily. Urdu script suits print and formal documents.

## 3. Transcreate, don't translate

| English | Literal (bad) | Transcreated (good) |
|---------|---------------|---------------------|
| "Consistency beats perfection" | *"Mustaqil mizaji kamaliyat ko shikast deti hai"* | *"Roz thoda karna, kabhi kabhi bohot karne se behtar hai"* |
| "Log your reading" | *"Apni padhat ko darj karein"* | *"Apni reading note karein"* |
| "Post-meal walk" | *"Khane ke baad chalna"* | *"Khane ke baad thori si walk"* |

Rules:
- Keep loanwords people actually use: reading, sugar, walk, doctor, test, report
- Don't reach for formal Urdu where the spoken word is English
- The measure is what a Karachi household says, not what a dictionary prefers

## 4. Terms that must not drift

These carry medical meaning. Translating them loosely changes the claim:

| English | Urdu handling |
|---------|---------------|
| Remission | Keep "remission" as a loanword, then explain it once in Urdu. Do **not** translate as *"ilaj"* (cure) or *"khatma"* (elimination) |
| HbA1c | Keep as-is |
| Glucose / blood sugar | "Sugar" — the universally understood term |
| Fasting / post-meal | "Nashte se pehle" / "khane ke baad" |
| mg/dL | Keep as-is |

**The remission trap:** every natural-sounding Urdu word for remission drifts toward "cure". This is the single highest-risk translation decision in the domain. Loanword plus explanation, always.

## 5. Safety re-check is mandatory

Translation can break safety even from a clean source:

- Urdu words for improvement can imply permanence
- Hedges ("associated with", "many people") weaken or vanish in casual Urdu
- Warmth can slide into promise
- Thresholds must stay numerically exact and unambiguous

Every localized piece re-enters `medical-safety`. No exceptions.

## 6. Register

- Respectful *aap*, never *tum*
- Warm but not familiar — this is a health service, not a friend
- Greetings natural: Assalam o Alaikum
- Avoid heavy Persianized vocabulary; it reads as distant and official

## 7. Output

Both versions, side by side, plus notes:

```yaml
source: <cleared piece id>
script: roman_urdu | urdu
pairs:
  - en: "Consistency beats perfection."
    ur: "Roz thoda karna, kabhi kabhi bohot karne se behtar hai."
    note: "Transcreated — literal version reads as a proverb, not advice"
terms_kept_english: [reading, sugar, HbA1c, remission]
safety_flags:
  - "Remission explained in Urdu after the loanword — para 2"
  - "Thresholds unchanged, numerals preserved"
requires_safety_review: true
status: localized
```

See `reference.md` for the glossary, `examples.md` for worked pairs.
