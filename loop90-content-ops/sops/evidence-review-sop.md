# SOP — Evidence Review

Published medical claims decay. This SOP keeps them true.

---

## Why

A claim sourced correctly in 2026 can be wrong by 2028 — superseded by a larger trial, revised in a guideline, or contradicted by a replication failure. Content that was honest when published becomes dishonest by neglect.

---

## Annual review

Once a year, for every published medical piece:

### 1. Check the guideline sources

- ADA Standards of Care — updated annually
- WHO, IDF, NICE — periodic
- Any Pakistan Endocrine Society guidance

Changed thresholds or definitions → every piece referencing them needs updating.

### 2. Check the anchor studies

For each Level A/B reference:

- Has a larger trial or meta-analysis superseded it?
- Has it failed replication?
- Has the effect size been revised?

### 3. Check the remission definition

It's the spine of the whole domain. If the consensus definition changes, `CONSTITUTION.md`, `evidence-levels.md`, `banned-claims.md`, and every piece using it all move together.

### 4. Check thresholds against the app

≥250 / ≤70 / ≥180 must match `CONSTITUTION.md` §14 **and** the app's logic. If the app changed, the content is now wrong.

---

## Triggered review — don't wait for the annual

Review immediately when:

- A guideline body updates a definition or threshold
- A major trial publishes contradicting evidence
- The app's escalation logic changes
- A clinician reviewer flags an accuracy problem
- A correction is needed on any one piece (check siblings — the error is often shared)

---

## Outcome per piece

| Outcome | Action |
|---------|--------|
| Still accurate | Record the review date, no change |
| Minor drift | Update through `editing` → `medical-safety` → `publishing` |
| Materially wrong | Update **and** add a dated correction note |
| No longer defensible | Unpublish, with a note |

---

## Correction notes

For any factual or medical change to a published piece:

```markdown
> **Correction, 2027-03-14:** This article previously stated [X].
> Following [source/guideline update], the current position is [Y].
> The practical guidance is unchanged / has changed as follows: [...]
```

Typos may be fixed silently. **Medical claims may never be silently altered.**

---

## Why sources are archived

`publishing` archives the PMID/DOI and abstract text with every piece. This review is why — you need what was actually cited, not a dead link.

---

## Log

| Date | Scope | Findings | Actions |
|------|-------|----------|---------|
| | | | |
