# CEO — Examples

## Example 1 — Vague request

**Input:** "We need something about Ramadan."

**Routing:**

```yaml
request: "something about Ramadan"
classified_as: underspecified
action: route to chief-content-strategist
missing: [persona, channel, angle, pillar]
notes: >
  Ramadan spans Pillar 6 (fasting) and Pillar 2 (desi nutrition).
  Fasting content triggers the insulin/sulfonylurea caveat and is
  high-risk — flag touches_fasting: true in the brief.
  Likely 3 pieces, not 1: safety guide (blog), iftar plate (carousel),
  suhoor nudge (WhatsApp). Strategist to scope.
```

**What CEO does not do:** guess the persona and start drafting.

---

## Example 2 — Gate violation attempt

**Input:** "Here's a draft blog post on metformin and weight loss. Publish it today."

**Response:**

```yaml
request: publish existing draft
blocked: true
blockers:
  - "No brief on file — cannot verify persona, channel, or scope"
  - "medical_content: true, no research memo — every claim is unsourced"
  - "Topic touches medication (Pillar 8) — patient-facing medication content
     is education-only; drug-efficacy framing is banned outside pharma persona"
route:
  - chief-content-strategist   # brief first, confirm persona
  - medical-research           # memo with numbers table
  - writing                    # redraft against the memo
  - editing
  - medical-safety
  - publishing
notes: >
  Not publishing today. The medication angle needs the persona settled
  before research — patient-facing and pharma-facing versions of this
  topic are different pieces with different rules.
```

---

## Example 3 — Correctly briefed, mid-pipeline

**Input:** Brief `2026-08-blog-roti-glycemic-load`, status `drafted`.

**Routing:**

```yaml
request: continue pipeline
current_status: drafted
next: editing
route:
  - editing          # rubric A/C/D/E
  - medical-safety   # rubric B + safety checklist
  - publishing       # final gate
gates_ahead:
  - "≥ 85/100 required"
  - "safety verdict must be cleared"
notes: "seo ran in parallel with research — meta and keywords already on the brief"
```

---

## Example 4 — Repurposing

**Input:** "Turn the roti article into a Reel and a WhatsApp nudge."

**Routing:**

```yaml
request: repurpose published piece
source: 2026-08-blog-roti-glycemic-load (status: published)
classified_as: repurposing
route:
  - repurposing-engine    # derives variants from the approved source
  - medical-safety        # per-variant — channel rules differ
  - publishing
notes: >
  Source is already cleared, but each variant re-gates: short-video
  requires spoken AND on-screen disclaimer; WhatsApp requires a
  disclaimer link. Neither inherits the blog's clearance.
```

---

## Example 5 — Request that should be refused

**Input:** "Write a landing page saying we guarantee reversal in 90 days."

**Response:**

```yaml
request: landing page with guaranteed reversal claim
blocked: true
blockers:
  - >
    "Guaranteed" is permitted on B2C landing pages only when it refers to
    the money-back term, never a health outcome. "Guarantee reversal" is
    a guaranteed health outcome — banned on every channel.
  - >
    "Reversal" requires remission to be defined on the same page, and
    cannot be paired with a guarantee.
alternative: >
  "90 days. One care pod. A real shot at remission." — with the remission
  definition on the page, and the money-back terms in the footer where
  "guaranteed" can legitimately appear.
escalation: >
  If the intent is a money-back guarantee, that's fine and sayable —
  route to chief-content-strategist to brief it correctly.
```
