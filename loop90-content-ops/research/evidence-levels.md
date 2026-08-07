# Evidence Levels & Citation Standard

Referenced by `CONSTITUTION.md` §11 and rubric criteria A2–A4. Every medical claim carries a level; every article states its **lowest** level in the frontmatter.

---

## The four levels

### Level A — Strong
Systematic reviews, meta-analyses, or well-conducted RCTs.

- **Language allowed:** "research shows", "a randomised trial found", "the evidence is strong that"
- **Example:** DiRECT trial — weight loss of 15kg+ produced remission in ~86% of that subgroup at 12 months
- **Citation required:** yes, always

### Level B — Moderate
Cohort studies, case-control studies, or small/limited RCTs.

- **Language allowed:** "studies suggest", "observational data indicates", "associated with"
- **Never:** "proven", "causes"
- **Citation required:** yes, always

### Level C — Limited
Case series, mechanistic reasoning, animal or in-vitro work, expert opinion.

- **Language allowed:** "early evidence suggests", "the proposed mechanism is", "some clinicians find"
- **Must be labelled** as preliminary in the body text, not just the frontmatter
- **Citation required:** yes

### Consensus — Guideline / standard of care
Major body recommendations without a single trial behind the specific point.

- **Sources:** ADA Standards of Care, WHO, IDF, EASD, NICE, Pakistan Endocrine Society
- **Language allowed:** "guidelines recommend", "standard practice is"
- **Citation required:** yes — name the body and year

---

## What needs a citation

**Always:**
- Any number: prevalence, percentage, risk, effect size
- Any claim about what a food, drug class, or behaviour does physiologically
- Any comparison ("more effective than")
- Any statement about remission rates or outcomes

**Not needed:**
- Program mechanics ("your cohort has one doctor, one nutritionist, one coach")
- General cultural context ("roti is a staple in most Pakistani households")
- Practical instruction that carries no medical claim ("log your reading before breakfast")

---

## Citation format

Inline, at the end of the sentence:

> Losing 15kg or more put 86% of participants into remission at one year (Lean et al., *The Lancet*, 2018).

Reference list at the article end:

```
## References

1. Lean MEJ, et al. Primary care-led weight management for remission of type 2
   diabetes (DiRECT): an open-label, cluster-randomised trial. The Lancet.
   2018;391(10120):541-551. https://pubmed.ncbi.nlm.nih.gov/29221645/
   [Level A]
```

Every entry ends with its level in brackets.

---

## Approved source tiers

| Tier | Sources | Use |
|------|---------|-----|
| 1 | PubMed-indexed journals, Cochrane, major guideline bodies | Anything |
| 2 | University/hospital publications, WHO/IDF reports | Anything |
| 3 | Reputable clinician-educators (Taylor, Fung, Attia, Bikman, Westman) | Framing and mechanism only — never as the sole source for a number |
| 4 | News, blogs, brand content | Never a source. Trace to the primary study or drop the claim. |

**Never cite:** supplement sellers, MLM material, wellness influencers, AI-generated summaries, or Wikipedia.

---

## Named references we lean on

| Source | Level | Use for |
|--------|-------|---------|
| DiRECT trial (Lean et al., 2018/2019) | A | Remission definition, weight-loss pathway |
| Roy Taylor — twin cycle hypothesis, *Life Without Diabetes* | A/C mix | Liver and pancreas fat mechanism (label mechanism claims C) |
| ADA Standards of Care (current year) | Consensus | Thresholds, definitions, standard of care |
| Jason Fung — *The Diabetes Code* | C | Fasting framing only, never as the evidence base for a number |

**Rule:** cite where appropriate, never name-drop for hype (`CONSTITUTION.md` §4.2). Naming an author is not evidence.

---

## The remission definition (use verbatim)

> Remission means an HbA1c below 6.5% sustained for at least three months without glucose-lowering medication.

Never restate this loosely. Never imply it is permanent or guaranteed.

---

## Hedging table

| Instead of | Write |
|------------|-------|
| "This cures diabetes" | Banned — see `banned-claims.md` |
| "You will reach remission" | "Many people reach remission; whether you do depends on factors your doctor can assess" |
| "Studies prove" (Level B) | "Studies suggest" |
| "Everyone benefits" | "Most participants in the trial improved" |
| "X causes Y" (observational) | "X is associated with Y" |

---

## Frontmatter block

Every medical article carries:

```yaml
evidence_level: A          # lowest level present in the piece
references: 3              # count, must be 2-5
reviewed_by: medical-safety
review_date: 2026-08-07
```
