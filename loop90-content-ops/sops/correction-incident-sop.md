# SOP — Corrections & Incidents

When something wrong ships. Speed matters, but so does not making it worse.

---

## Severity

| Level | Definition | Response |
|-------|------------|----------|
| **P0** | Could cause harm — wrong threshold, medication advice, unsafe fasting guidance | Unpublish within the hour |
| **P1** | Materially misleading — wrong statistic, banned claim, unsupported outcome | Correct within 24 hours |
| **P2** | Inaccurate but not misleading — outdated reference, imprecise phrasing | Correct in the next cycle |
| **P3** | Cosmetic — typo, formatting | Fix silently |

**When unsure between two levels, take the higher one.**

---

## P0 procedure

1. **Unpublish immediately.** Don't wait to draft a fix. Remove it from every channel it reached.
2. **Check derivatives.** A wrong threshold in an anchor is wrong in every Reel, carousel, and WhatsApp message derived from it. Pull them all.
3. **Assess reach.** Did it go out via WhatsApp or email? Those can't be unpublished — a correction message may be needed.
4. **Fix through the full pipeline.** No shortcuts, even now.
5. **Republish with a dated correction note.**
6. **Root-cause it** (below).

---

## P1 procedure

1. Correct through `editing` → `medical-safety` → `publishing`
2. Add the dated correction note
3. Check and fix derivatives
4. Root-cause it

Don't unpublish for P1 unless the correction will take more than 24 hours.

---

## Correction note format

```markdown
> **Correction, 2027-03-14:** This article previously stated [what was wrong].
> That was incorrect — [what's true, and why]. The practical guidance
> [is unchanged / has changed as follows: ...].
```

Rules:
- Dated, always
- States what was wrong, not just what's right now
- Never silently alters a medical claim
- Stays on the piece permanently

---

## Root cause — the part that matters

Every P0 and P1 gets this. The question is not "who made the error" but **"which gate should have caught it, and why didn't it?"**

| Error | Gate that should have caught it | Fix |
|-------|--------------------------------|-----|
| Unsourced number | `medical-research` numbers table → `editing` A1 | Was there a memo? Was it followed? |
| Banned term | `medical-safety` B1 scan | Did the scan cover that surface (CTA, meta, alt text)? |
| Wrong threshold | `medical-safety` B5 | Was it verified against CONSTITUTION, or recalled? |
| Implied medication outcome | `medical-safety` B3 judgement | Add the phrasing to the reference list |
| Stale pricing | `publishing` facts verification | Was it verified or recalled? |
| Hedge lost in Urdu | `medical-safety` on the Urdu text | Was the Urdu scanned, or just the English? |

**Then fix the gate**, not just the piece. A gate that failed once will fail again.

If the failure reveals a rule that doesn't exist yet, route it through `terminology-governance-sop.md`.

---

## Channels that can't be recalled

WhatsApp and email are already delivered. For P0/P1 on those:

- Send a brief, clear correction on the same channel
- Don't over-explain or apologise at length — state the correction and the right guidance
- Never let the correction message itself repeat the wrong claim prominently

---

## Log

Every P0 and P1, permanently:

| Date | Severity | Piece | What was wrong | Gate that failed | Gate fix |
|------|----------|-------|----------------|------------------|----------|
| | | | | | |

This log is the honest record of how well the system actually works.
