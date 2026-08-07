# Playbook — Clinician Reviewer

For the doctor or clinical lead reviewing content before or after it ships. You are the human check on top of `medical-safety`.

---

## What we need from you

Not copy-editing. Three things:

1. **Is it clinically accurate?**
2. **Could a patient act on this in a way that harms them?**
3. **Would you be comfortable with your name near it?**

---

## What the system has already checked

So you don't re-do it:

| Already checked | By |
|-----------------|-----|
| Banned terms (cure, miracle, guaranteed, 100%) | `medical-safety` regex scan |
| Medication advice, dosing, start/stop | `medical-safety` boundary check |
| Escalation thresholds (≥250 / ≤70 / ≥180) | Verified against CONSTITUTION §14 |
| Citations present, 2–5, with evidence levels | `editing` section A |
| Disclaimer present in the channel's required form | `medical-safety` |
| Every number traced to an approved source table | `medical-research` → `editing` |

If you find a failure in any of these, that's a system bug — tell us, because the gate should have caught it.

---

## Where machine checking is weakest

Focus here:

### Implied claims

Regex catches words, not implications. Things like:

- "Patients typically come off medication by week 10" — no banned word, but it's a medication outcome promise
- "Members average a 2-point HbA1c drop" — sourced-sounding, unpublished
- "Say goodbye to diabetes" — functionally a cure claim

### Clinical nuance

- Is the mechanism actually right, or right-sounding?
- Does a Level C mechanism read as established fact to a lay reader?
- Is the population caveat adequate? (Most remission research is on largely European cohorts; South Asians present at lower BMI.)

### Real-world risk

- Could someone with insulin or a sulfonylurea act on this and go hypo?
- Does fasting content adequately route to a doctor first?
- Does the "try this today" action carry any risk for a subgroup?

### Whether the caveat actually caveats

Counter-evidence sections can be decorative. Does the limitation genuinely qualify the claim, or is it a paragraph that looks responsible?

---

## How to respond

Be specific and quotable:

| Weak | Useful |
|------|--------|
| "This feels off" | "Para 4 implies fasting is safe for everyone; needs the sulfonylurea caveat before the action step" |
| "Too strong" | "'Studies prove' — that's a Level B finding; should read 'studies suggest'" |
| "Fine" | "Clinically accurate. One note: the DiRECT cohort was largely European — worth a line" |

Your feedback goes back through `writing` → `medical-safety`, so a precise note becomes a precise fix.

---

## Verdicts

| Verdict | Means |
|---------|-------|
| **Approve** | Clinically sound, safe to publish |
| **Approve with note** | Publish after one specific change |
| **Revise** | Substantive clinical problem |
| **Reject** | Cannot be made safe as framed |

There is no "approve with reservations". If you have a reservation, name it as a required change.

---

## Content most worth your time

| Priority | Type |
|----------|------|
| Highest | Fasting, medication-adjacent, remission definitional |
| High | Anything with a number, anything doctor-facing |
| Medium | General nutrition, movement |
| Low | Program mechanics, recruitment, brand |

Don't spend review time on recruitment copy. Spend it where a patient could get hurt.
