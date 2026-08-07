# Medical Safety — Reference

## Conditional-term decision tree

For "reverse" or "guaranteed":

```
1. Is it in the brief's banned_term_exceptions?     No → BLOCK
2. Does the channel permit it?                       No → BLOCK
   (B2C landing / ads only — never in-app, blog,
    email body, doctor, or pharma content)
3. "reverse": is remission defined on the same page? No → BLOCK
   "guaranteed": does it refer to the money-back
    term, not a health outcome?                      No → BLOCK
4. Is the legal/disclaimer block on the page?        No → BLOCK
                                                     All yes → allow
```

Four conditions. Any failure blocks.

## Things that read as claims but aren't caught by regex

The regex catches words. These need judgement:

| Phrasing | Why it blocks |
|----------|---------------|
| "Patients typically come off medication by week 8" | Medication outcome as a program promise |
| "Our members average a 2-point HbA1c drop" | Unpublished outcome claim, implies typical result |
| "You'll be off metformin" | Medication advice by implication |
| "Diabetes doesn't have to be forever" | Fine — this is remission framing, allowed |
| "Say goodbye to diabetes" | Blocks — functionally a cure claim |
| "Beat diabetes" | Judgement: acceptable in marketing with remission context; block if it stands alone as an outcome promise |

The test: **would a reader come away expecting a specific health outcome?** If yes, it's a promise, regardless of the words used.

## Testimonials

| Element | Rule |
|---------|------|
| Specific HbA1c or weight numbers | Requires "individual results vary" adjacent — not in a footer |
| Before/after imagery | Blocked if it implies a typical result |
| "This changed my life" | Fine — subjective, not a claim |
| "I came off my medication" | Blocked — medication outcome, even as a quote |
| Verified consent | Required, always |

## Tone blocks

These are hard fails under C1 but you catch them too, since they're safety-adjacent:

- Fear: consequence-if-you-don't framing
- Shame: implying the reader caused this or failed
- Urgency manufactured around a health decision ("only 3 spots left" on a medical program)

## Cross-checking the app

For in-app content specifically, the app enforces its own `BANNED_CLAIMS` at save time. Your scan must be a **superset** — if you clear something the app then rejects, the docs have drifted. Log it and follow `sops/terminology-governance-sop.md`.

## What "cleared" does not mean

Cleared means: no banned claims, no medication advice, correct thresholds, disclaimer present, evidence safely framed.

Cleared does **not** mean: factually verified from scratch (that's the memo), well-written (that's editing), or correctly targeted (that's the brief). You are one gate, not all of them.

## Escalation to the user

Escalate rather than block silently when:

- The brief and the safety rules genuinely conflict and the piece can't be re-angled
- A rule seems wrong for a legitimate case (route via the terminology SOP)
- The same piece has been blocked twice for the same issue — there's a scope disagreement upstream

## What you never do

- Rewrite the content
- Clear with conditions ("publish but change X later")
- Accept urgency as a reason to soften a threshold
- Fix a blocker yourself and then clear your own fix
