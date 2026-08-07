# Editing — Reference

## Judging reading level without a tool

Flesch-Kincaid needs a calculator, but these proxies catch most problems:

| Signal | Grade impact |
|--------|--------------|
| Sentences over 25 words | Pushes past grade 10 |
| Three-syllable words stacked | Each one raises it |
| Subordinate clauses ("which", "although", "whereas") | Splitting drops a full grade |
| Passive voice | Adds difficulty and distance |
| Nominalisation ("the utilisation of") | Verb it ("using") |

Target sentence lengths:

| Audience | Average |
|----------|---------|
| Patient (6–8) | 12–15 words |
| Guide (8–10) | 15–18 words |
| Professional | 18–22 words |
| Executive | 15–20, but dense |

## Common fixes

| Problem | Fix |
|---------|-----|
| "It is important to note that X" | "X" |
| "In order to" | "To" |
| "Utilise" | "Use" |
| "May potentially" | "May" |
| "Studies have shown that research indicates" | Pick one, cite it |
| Sentence with two ideas | Two sentences |
| Paragraph over 5 lines | Split at the turn |
| Heading that's a label ("Mechanisms") | Make it a question ("Why does rice spike my sugar?") |

## Voice failures to catch

| Failure | Looks like | Fix |
|---------|------------|-----|
| Fear | "Left unchecked, this will damage your kidneys" | State the fact without the threat |
| Shame | "If you'd been logging, you'd know this" | "Logging tomorrow gives you the pattern" |
| Hype | "This one trick" | Describe what it actually is |
| Lecture | Three paragraphs of mechanism | Two or three sentences, then the action |
| Western default | "Try a quinoa bowl" | "Try daal with brown rice" |
| Wrong register | "Salaam doctor sahib" in a LinkedIn post | Professional open |

## Evidence failures to catch

| Failure | Why it matters |
|---------|----------------|
| A number not in the memo's table | It came from training data — unverifiable |
| "Studies prove" on Level B | Overstates the evidence |
| "Causes" on observational data | Claims causation from correlation |
| Subgroup result stated generally | "86% of participants" ≠ "86% of people" |
| Author name in place of a citation | Not evidence |
| Missing counter-evidence | Fails A1 — one-sided evidence |

Each of these returns to `medical-research`, not to your own judgement.

## Scoring discipline

Score against the criterion, not against effort. A draft that is clearly hard work but reads at grade 11 for a patient audience still loses D1 points.

Be specific in `fixes_applied` and in what you return. "Improve clarity" helps nobody; "split para 3's 34-word sentence about hepatic fat" is actionable.

## What you don't do

- Section B, the safety checklist, or the verdict — `medical-safety`
- Re-angling the piece — that's a brief problem, return to the strategist via `ceo`
- Adding facts — even true ones, even obvious ones. If it's not in the memo, it doesn't go in.
