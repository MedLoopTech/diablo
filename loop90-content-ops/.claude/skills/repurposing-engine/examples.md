# Repurposing Engine — Examples

## Example 1 — Full derivation from the roti anchor

```yaml
anchor: 2026-08-blog-roti-glycemic-load (published, 94/100)
memo_boundary: "Directional comparison only — no GI/GL figures approved"

variants:
  - channel: short-video
    takeaway: "Same rice, two plates, two numbers."
    treatment: >
      Visual side-by-side: plate of plain rice vs rice + daal + kachumber.
      Hook is the visual, not a claim.
    script_beats:
      - "[0:00-0:03] Two plates. Same rice."
      - "[0:03-0:15] One is just rice. One has daal and kachumber."
      - "[0:15-0:40] The second one raises your sugar more gently. Not because the rice changed — because the plate did. Protein and fibre slow everything down."
      - "[0:40-0:60] Tonight: don't let the rice sit alone. + disclaimer"
    new_claims: []
    disclaimer_form: "spoken + on-screen"
    requires_safety_review: true

  - channel: instagram
    takeaway: "Pairing changes the curve. Here are six swaps."
    treatment: "7-slide carousel, real thali photography, one swap per slide"
    new_claims: []
    disclaimer_form: "final slide + caption line"
    requires_safety_review: true

  - channel: whatsapp
    takeaway: "Add kachumber to tonight's rice."
    treatment: "Roman Urdu, one action, disclaimer link"
    new_claims: []
    disclaimer_form: "link"
    requires_safety_review: true

  - channel: email
    takeaway: "Why the plate matters more than the grain."
    treatment: >
      Mechanism expanded to ~300 words, links back to the anchor for
      the full piece.
    new_claims: []
    disclaimer_form: "full block"
    requires_safety_review: true

skipped:
  - channel: linkedin
    reason: >
      No professional-audience angle. The clinical version of this
      topic (meal composition counselling) is a different piece with a
      different evidence bar — brief it separately if wanted.

future_research_needs:
  - >
    Slide 4 of the carousel would land harder with actual GL values for
    roti vs rice vs biryani. Memo forbids: no validated Pakistani GI
    database exists. Worth a research brief if a local dataset surfaces.

status: repurposed
```

---

## Example 2 — New claim caught

```yaml
issue: new_claim_introduced
variant: instagram
slide: 4

drafted: >
  "White rice has a GI of 73 — daal brings it down to around 55."

problem: >
  Neither figure is in the anchor or its memo. The memo explicitly
  states no validated Pakistani GI values exist and directs
  directional comparison only. These numbers came from a general
  GI table, not from our research.

  This is the classic repurposing failure: the slide felt thin
  without a number, so a number appeared.

corrected: >
  "Rice alone: fast rise. Rice with daal: gentler. Same rice."

note: >
  The corrected version is also the better slide — it's readable at a
  glance, which the numeric version wasn't.

status: corrected_before_review
```

---

## Example 3 — Skipping rather than manufacturing

```yaml
anchor: 2026-08-blog-what-remission-means (published)

variants:
  - channel: email
    takeaway: "Remission has a definition. Here it is."
    new_claims: []
    requires_safety_review: true

skipped:
  - channel: short-video
    reason: >
      This topic is definitional and carries the highest terminology
      risk in the domain. A 45-second video cannot hold the remission
      definition, the not-a-cure caveat, the impermanence caveat, AND
      a disclaimer — something gets cut, and whatever gets cut is the
      part that keeps it honest.

      A video version would almost certainly drift toward "you can
      beat diabetes", which is precisely what this article exists to
      correct.

  - channel: instagram
    reason: >
      Same problem, slightly less acute. Possible as a carousel where
      each caveat gets its own slide — but that's a brief, not a
      derivation, because the structure is entirely different.

status: repurposed
notes: >
  Two skips out of three isn't a failure. Some anchors are anchors
  precisely because they need the length.
```

---

## Example 4 — Refused source

```yaml
request: "Repurpose the metformin draft into a Reel"
status: refused

reason: >
  Source status is 'blocked', not 'published'. Repurposing a blocked
  draft would propagate the exact medication-outcome claim that
  medical-safety rejected — into a format with even less room for the
  routing nuance that would make it acceptable.

action: >
  The anchor has to clear first. Short video may still be skipped even
  then — medication-adjacent topics generally shouldn't be Reels.
```
