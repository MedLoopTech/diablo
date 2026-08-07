---
name: medical-research
description: Produces the research memo that every medical piece is built from — evidence levels, citations, the approved numbers table, desi context, safety boundaries, and counter-evidence. Use whenever a brief has medical_content true, before any drafting.
---

# Medical Research

You establish what can honestly be said. `writing` may only use what you approve.

Read `prompts/context-loader.md`, `prompts/evidence-block.md`, and `research/evidence-levels.md`.

## 1. Answer the brief's question, not the topic

The brief has a `reader_question`. Research that, not the general subject. A memo on "fibre" when the question is "why does daal chawal spike me less" is a memo the writer can't use.

## 2. Grade every claim

| Level | Source | Language it permits |
|-------|--------|---------------------|
| A | Meta-analysis, systematic review, good RCT | "research shows", "a trial found" |
| B | Cohort, case-control, small RCT | "studies suggest", "associated with" |
| C | Case series, mechanism, animal, expert opinion | "early evidence suggests" — label preliminary in body |
| Consensus | ADA, WHO, IDF, EASD, NICE, PES | "guidelines recommend" — name body and year |

The memo's `overall evidence level` is the **lowest** level present in the piece, not the highest.

## 3. Build the numbers table

This is the core deliverable. Every figure the writer may use, with its **exact approved wording**:

| Figure | Exact wording to use | Source |
|--------|----------------------|--------|
| 86% | "86% of participants in that subgroup" | Lean et al., 2018 |
| 40–60% | "estimated at 40–60%" | [source] |

Rules:
- If it isn't in this table, the writer cannot use it
- Preserve hedges — "estimated at" is part of the number
- Never round a trial figure
- Never convert a subgroup result into a general one

## 4. Set the hedges here

Hedging is a research decision, not an editing one. If the evidence is Level B, write "associated with" in the memo — don't let the writer choose "causes" and hope editing catches it.

## 5. Desi context is mandatory

Most diabetes research is on Western populations eating Western diets. State explicitly:

- What carries over (mechanism usually does)
- What doesn't (specific foods, portion norms, meal timing)
- The Pakistani-food application, with actual foods named

A memo without this section forces the writer to invent the bridge — which is how unsourced claims enter.

## 6. Counter-evidence is mandatory

Never omit. Cover:

- What the research does **not** show
- Where it's contested
- Who it doesn't apply to
- Study limits (population, duration, funding)

If there genuinely are no meaningful limits, write "none identified" and explain why. An article with only supporting evidence fails rubric A1.

## 7. Safety boundaries

Name them for this specific topic:

- What must route to the doctor
- Which escalation thresholds are relevant (≥250 / ≤70 / ≥180)
- Populations needing a caveat (insulin/sulfonylurea, pregnancy, CKD)
- Claims to avoid on this topic in particular

## 8. Output

`research/research-memo-template.md`, complete. 2–5 references, each ending with its level in brackets.

**Refuse to produce a memo** when the claim has no support at any level. Say so, and say what *can* be supported instead.

See `reference.md` for source evaluation, `examples.md` for a worked memo.
