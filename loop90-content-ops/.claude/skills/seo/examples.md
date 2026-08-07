# SEO — Examples

## Example 1 — Worked output

For brief `2026-08-blog-roti-glycemic-load`.

```yaml
primary_keyword: "rice blood sugar"
secondary_keywords:
  - "daal chawal sugar"
  - "biryani sugar patient"
  - "glycemic load vs glycemic index"
  - "chawal sugar mein kha sakte hain"
  - "roti ya chawal diabetes"

search_intent: informational

title_tag: "Rice and Blood Sugar: Why Daal Chawal Is Gentler"   # 52 chars

meta_description: >
  Same rice, two meals, two different numbers. Here's what pairing
  actually does to your blood sugar — and the one swap to try tonight.
  # 148 chars

slug: /rice-blood-sugar-pairing

h2_structure:
  - "Why does rice spike my sugar?"
  - "What's the difference between GI and GL?"
  - "Why daal chawal is gentler than plain rice"
  - "What about biryani?"
  - "The one change to make tonight"
  - "When to talk to your doctor"

snippet_target: >
  Rice raises blood sugar quickly when eaten alone, but pairing it with
  protein and fibre — like daal and kachumber — slows digestion and
  flattens the rise. The rice hasn't changed; the meal has. That's the
  difference between glycaemic index and glycaemic load in practice.
  # 48 words

internal_links:
  outbound:
    - "/plate-method-guide"      # anchor: "the half-quarter-quarter plate"
    - "/post-meal-walk"          # anchor: "a 10-minute walk after dinner"
  inbound_from:
    - "/plate-method-guide"      # add a link back once published

notes: >
  "Sugar" used in H2s and FAQ (local vocabulary), "blood sugar" in the
  title tag for authority. No cannibalisation — no existing piece targets
  rice or GL.

  Data limitation: no keyword tool connected. Keywords chosen from intent
  and local phrasing, not measured volume. Do not treat these as
  volume-ranked.

  Banned-term note: "reverse diabetes" surfaces adjacent to this topic and
  is high-intent, but is not targetable here — blog channel forbids it.
  The intent behind it is served by the remission content in Pillar 1.
```

---

## Example 2 — Cannibalisation caught

**Brief:** a second piece on the plate method.

```yaml
status: flagged
issue: cannibalisation
detail: >
  "/plate-method-guide" already targets "diabetes plate method" and
  "desi plate diabetes". This brief would target "how to portion roti
  and rice" — which is the same search intent expressed differently.
  Two pages competing for one query rank worse than one.

recommendation: >
  Either (a) expand the existing guide with a portioning section and
  redirect this brief's angle elsewhere, or (b) narrow this piece to
  eating out — "dhaba, wedding, iftar" — which is a genuinely different
  intent with no existing coverage.

routed_back_to: chief-content-strategist
```

---

## Example 3 — Keyword rejected on safety grounds

**Request:** "Target 'reverse diabetes naturally' — it has the volume."

```yaml
status: rejected
keyword: "reverse diabetes naturally"
reason: >
  "Reverse" is permitted only on B2C landing pages and ads, with
  remission defined on the same page. This is a blog brief, where the
  term is banned outright. Ranking is not a reason to override
  banned-claims.md.

  "Naturally" additionally implies an alternative to medical care,
  which conflicts with the doctor-led positioning.

alternative:
  primary_keyword: "diabetes remission possible"
  rationale: >
    Serves the same underlying question — "can this get better?" —
    with a term we can defend. Lets us cite DiRECT properly and define
    remission, which is stronger content than the keyword-chasing version.

  title_tag: "Is Diabetes Remission Possible? What the Evidence Shows"
```
