# Medical Article Rubric

The publish gate referenced by `CONSTITUTION.md` §11. **Minimum total: 85/100.**

Scored by the `editing` skill (sections A–D) and the `medical-safety` skill (section E). Any **hard fail** blocks publication regardless of total score.

---

## Scoring summary

| Section | Weight |
|---------|--------|
| A. Medical accuracy & evidence | 25 |
| B. Safety & compliance | 25 |
| C. Brand voice & cultural fit | 20 |
| D. Clarity & structure | 20 |
| E. Actionability | 10 |
| **Total** | **100** |

---

## A. Medical accuracy & evidence — 25 pts

| # | Criterion | Pts |
|---|-----------|-----|
| A1 | Every medical claim is accurate and current | 8 |
| A2 | Evidence level stated (A / B / C / consensus) per `research/evidence-levels.md` | 5 |
| A3 | 2–5 references from PubMed or a major guideline body | 5 |
| A4 | Statistics are sourced, with hedges preserved ("estimated at 40–60%") | 4 |
| A5 | Mechanism explained correctly, without oversimplifying into falsehood | 3 |

**Hard fail:** a factually wrong medical claim, or a statistic presented without a source.

---

## B. Safety & compliance — 25 pts

| # | Criterion | Pts |
|---|-----------|-----|
| B1 | Banned-claims scan clean for the channel (`domains/*/banned-claims.md`) | 8 |
| B2 | Disclaimer block present and correct for the channel | 5 |
| B3 | No medication advice — no dosing, no start/stop/switch | 5 |
| B4 | Clinical note present: when to involve the doctor | 4 |
| B5 | Escalation thresholds correct where glucose numbers appear (≥250 / ≤70 urgent, ≥180 routine) | 3 |

**Hard fail:** any absolute-banned term, any medication advice, missing disclaimer on medical content, or a wrong escalation threshold.

---

## C. Brand voice & cultural fit — 20 pts

| # | Criterion | Pts |
|---|-----------|-----|
| C1 | Hope over fear — no scare tactics, no shame for slips | 6 |
| C2 | Desi kitchen first — Pakistani food examples, not Western defaults | 5 |
| C3 | Matches the loaded persona's voice cues | 4 |
| C4 | No hype: no "secret", no conspiracy framing, no celebrity claims | 3 |
| C5 | "AI coach" paired with "not a doctor" on first mention, where AI is named | 2 |

**Hard fail:** fear-mongering, shaming, or Western-default food examples throughout a patient piece.

---

## D. Clarity & structure — 20 pts

| # | Criterion | Pts |
|---|-----------|-----|
| D1 | Reading level on target for the audience (see below) | 6 |
| D2 | Clear hierarchy — headings, short paragraphs, scannable | 5 |
| D3 | Science explained in one or two sentences, not a lecture | 4 |
| D4 | Opening earns attention within two sentences | 3 |
| D5 | Length appropriate to channel | 2 |

**Reading-level targets** (`CONSTITUTION.md` §6):

| Audience | Target |
|----------|--------|
| Patient | Grade 6–8 (Flesch-Kincaid ~60–70) |
| Lead magnet / guide | Grade 8–10 with glossary |
| Doctor / professional | Professional medical writing |
| Employer / pharma | Executive summary + data tables |

---

## E. Actionability — 10 pts

| # | Criterion | Pts |
|---|-----------|-----|
| E1 | One practical takeaway the reader can do today | 5 |
| E2 | CTA present and appropriate to channel and funnel stage | 3 |
| E3 | Action is realistic for the persona's constraints (time, budget, family) | 2 |

**Hard fail:** no takeaway at all in a patient-facing piece.

---

## Score bands

| Score | Verdict |
|-------|---------|
| 95–100 | Publish; candidate for `examples/gold/` |
| 85–94 | Publish |
| 70–84 | Revise and re-score — do not publish |
| < 70 | Send back to `writing` with the brief |
| Any hard fail | Blocked regardless of total |

---

## Output format

The `editing` and `medical-safety` skills return:

```yaml
rubric_score:
  a_evidence: 22/25
  b_safety: 25/25
  c_voice: 18/20
  d_clarity: 17/20
  e_actionability: 9/10
  total: 91/100
  hard_fails: []
  verdict: publish
  fixes:
    - "A4: 'most patients improve' needs a source or softer hedge"
    - "D1: para 3 reads at grade 11 — split the sentence about hepatic fat"
```

Non-medical content (pure marketing, recruitment, social) uses the same rubric with section A scored as N/A and the total rebased to 75, minimum **64/75**.
