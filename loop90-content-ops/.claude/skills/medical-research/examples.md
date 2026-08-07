# Medical Research — Examples

## Example 1 — Worked memo

For brief `2026-08-blog-roti-glycemic-load`.

```markdown
# Research Memo — Glycaemic load and meal pairing

**Brief:** 2026-08-blog-roti-glycemic-load
**Domain:** diabetes-remission
**Persona:** patient
**Channel:** blog-seo
**Researched:** 2026-08-07
**Overall evidence level:** B

## The question

Why does the same rice produce a smaller glucose rise when eaten with
daal than when eaten alone or as biryani?

## Answer in brief

Glycaemic index describes a food eaten alone. Glycaemic load accounts for
how much you actually eat. But in a real meal, what sits alongside the
carbohydrate also matters: protein, fat, and fibre slow gastric emptying
and blunt the post-meal rise. Daal adds protein and fibre to rice; biryani
adds fat and refined carbohydrate together in a larger portion. Same grain,
different meal, different curve.

## Key findings

| # | Finding | Level | Source |
|---|---------|-------|--------|
| 1 | GL predicts post-meal glucose better than GI alone | B | Bhupathiraju 2014 |
| 2 | Adding protein/fat to a carbohydrate meal lowers peak glucose | B | Various crossover studies |
| 3 | Fibre slows gastric emptying, flattening the curve | B–C | Mechanistic + small trials |

## Mechanism

Carbohydrate reaching the small intestine faster produces a steeper rise.
Protein, fat, and soluble fibre all slow gastric emptying, so the same
grams of carbohydrate arrive more gradually. This is well-described
physiologically — treat as Level C where stated as mechanism, Level B
where tied to measured post-meal outcomes.

## Numbers the writer may use

| Figure | Exact wording to use | Source |
|--------|----------------------|--------|
| — | (no specific figures approved for this piece) | — |

**Note to writer:** this piece runs on mechanism and comparison, not
statistics. Do not introduce GI or GL point values for specific Pakistani
dishes — no validated Pakistani GI database exists, and published Indian
values don't transfer reliably across preparation methods. Compare
directionally ("lower than", "gentler than"), never numerically.

## Desi context

The research is largely on Western meals. The **mechanism transfers**;
the **specific foods do not**. Applied here:

- Plain white rice alone → fastest rise
- Rice + daal + kachumber → slower, from protein and fibre
- Biryani → larger portion, refined grain, added fat; the fat slows the
  peak but the portion raises the total load
- Roti alone vs roti + sabzi + yoghurt → same principle
- Chai with sugar alongside a carbohydrate meal adds load with no blunting

South Asians develop T2D at lower BMI with higher visceral fat than
European populations — worth noting that portion norms calibrated to
Western studies may already be generous here.

## Safety boundaries

- Medication angle: none directly. If a reader asks whether this lets them
  reduce medication → route to their pod doctor.
- Escalation thresholds: relevant if the piece mentions post-meal readings.
  ≥180 routine flag, ≥250 urgent.
- Populations to caveat: none specific to this topic.
- Claims to avoid: any implication that pairing makes an unlimited portion
  safe, or that a "low-GI" food is unrestricted.

## Counter-evidence / limits

- GI/GL values vary widely by cooking method, ripeness, cooling, and
  processing — published tables are approximations, and reheated or cooled
  rice behaves differently from fresh
- Individual glucose responses to identical meals vary substantially
  between people (Zeevi 2015) — this is why we teach patterns from a
  person's own logs, not universal food rules
- No validated Pakistani GI database exists
- Most pairing studies are small crossover designs, not long-term outcome
  trials — we can say "blunts the post-meal rise", not "improves HbA1c"

## References

1. Bhupathiraju SN, et al. Glycemic index, glycemic load, and risk of type 2
   diabetes. Am J Clin Nutr. 2014;100(1):218-232.
   https://pubmed.ncbi.nlm.nih.gov/24787496/  [Level B]
2. Zeevi D, et al. Personalized Nutrition by Prediction of Glycemic
   Responses. Cell. 2015;163(5):1079-1094.
   https://pubmed.ncbi.nlm.nih.gov/26590418/  [Level B]
3. American Diabetes Association. Standards of Care in Diabetes.
   Diabetes Care. [current year].  [Consensus]

## Notes for the writer

Lead with the reader's own observed contrast — they already noticed this,
we're explaining it. Keep the mechanism to two or three sentences. The
takeaway is "change what's next to the rice", which is far easier to act
on than "eat less rice", and it's the direct answer to the "I can't give
up roti" objection.

Do not add numbers. Directional comparison only.
```

---

## Example 2 — Refusing a memo

**Brief asks:** "Article on how our program helps you get off metformin."

```markdown
# Research Memo — REFUSED

**Brief:** 2026-08-blog-off-metformin
**Status:** cannot be researched as briefed

## Why

The brief asks us to support a claim we cannot make and must not imply:

1. Deprescribing is a clinical decision. Content framing medication
   reduction as a program outcome invites patients to act on it —
   which violates CONSTITUTION §14.1 regardless of hedging.
2. DiRECT's remission definition already includes "without
   glucose-lowering medication" — so remission content covers the
   honest version of this. A separate "get off metformin" piece adds
   nothing except the implication of instruction.
3. No evidence supports a program-specific deprescribing claim for
   Loop/90. We have no published outcomes.

## What can be supported instead

- What remission means, including the medication-free criterion,
  cited to DiRECT [Level A]
- That the doctor reviews medication as glucose improves — framed as
  the doctor's decision, with no timeline or expectation
- What patients can do that's within their control: logging, plate,
  post-meal movement

## Recommendation

Return to chief-content-strategist. Suggested re-angle:
"What remission actually means — and who decides when medication changes"
with persona: patient, pillar: 1, touches_medication: true.
```
