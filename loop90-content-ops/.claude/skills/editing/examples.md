# Editing — Examples

## Example 1 — Scored draft (passes)

The roti draft from `writing/examples.md`.

```yaml
rubric_score:
  a_evidence: 23/25
  c_voice: 19/20
  d_clarity: 17/20
  e_actionability: 10/10
  subtotal: 69/75
  hard_fails: []

fixes_applied:
  - >
    D1: split "Protein, fat, and fibre all slow down how quickly your
    stomach empties, and when rice arrives in your system gradually
    instead of all at once, the rise is gentler" (31 words) into two
    sentences. Now ~15 words each.
  - >
    D3: cut a fourth mechanism sentence about gastric emptying rates —
    the point was already made in three.
  - >
    C2: "salad" → "kachumber" in the action section. Specific beats generic.

deductions:
  - "A2 (-2): evidence level stated in frontmatter but not signalled in the body where the Level C mechanism claim appears — reader can't tell which part is mechanism vs outcome"
  - "D1 (-3): para 3 still reads around grade 9; acceptable for this brief's 8-10 target but at the ceiling"

returned_items: []
verdict: pass_to_safety
status: edited
```

**Note on A2:** the deduction is real but not a hard fail — the frontmatter is correct, the body signal is missing. Worth 2 points, not a block.

---

## Example 2 — Returned to research

```yaml
rubric_score:
  a_evidence: 11/25
  c_voice: 18/20
  d_clarity: 16/20
  e_actionability: 8/10
  subtotal: 53/75
  hard_fails:
    - "A: 'roti has a GI of about 62' — not in the research memo's numbers table"
    - "A: 'most patients see improvement within 6 weeks' — unsourced, and 'most' is an unhedged majority claim"

fixes_applied: []

returned_items:
  - to: medical-research
    issue: >
      Two numbers in the draft have no memo entry. The memo explicitly
      states no validated Pakistani GI values exist and directs
      directional comparison only — the GI figure appears to come from
      training data.
  - to: medical-research
    issue: >
      "Most patients see improvement within 6 weeks" is a Loop/90 outcome
      claim. We have no published outcome data. Either source it or the
      sentence goes.

verdict: return_to_research
status: edited
notes: >
  Voice and structure are genuinely good — this is an evidence problem,
  not a writing problem. Do not send back to writing; the writer followed
  a memo that didn't cover these, or reached past it.
```

---

## Example 3 — Hard fail on voice

```yaml
rubric_score:
  a_evidence: 21/25
  c_voice: 8/20
  d_clarity: 15/20
  e_actionability: 7/10
  subtotal: 51/75
  hard_fails:
    - "C1: fear-mongering — 'every roti you eat without thinking is doing damage you can't undo'"

fixes_applied: []

returned_items:
  - to: writing
    issue: >
      The framing is fear-first throughout, not just in one sentence.
      Paras 2, 4, and 6 all lead with consequence-if-you-don't. This is
      a rewrite, not an edit — CONSTITUTION §10 is explicit: never scare,
      never shame.
    suggestion: >
      Same facts, inverted frame. "Pairing your rice changes the curve"
      instead of "eating rice alone is damaging you." The action stays
      identical; the reader doesn't leave feeling accused.

verdict: return_to_writing
status: edited
```

---

## Example 4 — Fixed in place, no return

```yaml
rubric_score:
  a_evidence: 24/25
  c_voice: 17/20
  d_clarity: 13/20
  e_actionability: 9/10
  subtotal: 63/75
  hard_fails: []

fixes_applied:
  - "D1: 6 sentences over 28 words split — average now 16"
  - "D2: added two H2s; the middle 600 words had no heading"
  - "D4: replaced 'Diabetes affects millions of Pakistanis' opening with the reader's own observation"
  - "C1: 'you're damaging your pancreas' → 'your pancreas is under more strain'"
  - "D5: cut 180 words of repeated mechanism to land inside the 1200-1500 range"

returned_items: []
verdict: pass_to_safety
status: edited
notes: >
  Subtotal was 63/75 before fixes (below the 66 threshold); all five
  issues were mechanical and fixable in place, so no return needed.
  Re-scored after fixes: D now 18/20, subtotal 68/75.
```
