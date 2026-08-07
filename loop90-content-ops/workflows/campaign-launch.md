# Workflow — Campaign Launch

Multi-piece, multi-channel launch built around one anchor. Use for cohort enrollment, seasonal pushes (Ramadan, New Year), or a lead-magnet launch.

**Input:** a campaign goal and a date. **Output:** a sequenced set of cleared assets.

---

## Shape

```
Week -4   strategist    campaign brief + asset map
Week -3   anchor        full blog-post-pipeline on the anchor piece
Week -2   derivatives   repurposing-engine + social-scripts
Week -1   sequencing    landing + email sequence, all gated
Week  0   launch        publish in order
```

Ramadan campaigns need the full four weeks — fasting content carries the heaviest safety review.

---

## 1. Campaign brief (strategist)

Not a content brief — a plan:

```yaml
campaign: ramadan-2027
goal: enrollment | leads | awareness | recruitment
primary_persona:
launch_date:
anchor: <the one substantial piece everything derives from>
assets:
  - channel: landing-page
    role: conversion destination
  - channel: blog-seo
    role: anchor
  - channel: lead-magnet
    role: top of funnel
  - channel: email
    role: 5-part nurture
  - channel: whatsapp
    role: 3 nudges
  - channel: instagram
    role: carousel + 2 Reels
success_measure: >
  What tells us this worked. One metric, stated before launch.
```

**Rule:** one anchor. A campaign with three anchors is three campaigns.

---

## 2. Anchor first, always

The anchor runs the full `blog-post-pipeline` before any derivative starts. Its research memo becomes the campaign's shared evidence boundary — every other asset inherits it.

Deriving before the anchor clears means propagating claims that may not survive.

---

## 3. Derivatives

`repurposing-engine` for structure, `social-scripts` for the short formats.

**Each asset re-gates through `medical-safety` individually.** A campaign clearance does not exist.

---

## 4. Landing page — the exception channel

The only asset where "reverse" and "guaranteed" may appear, and only under all four conditions (see `medical-safety/reference.md`). Set `banned_term_exceptions` in that asset's brief explicitly, or the terms are blocked.

Pricing on the landing page must be **verified at publish**, not recalled.

---

## 5. Sequencing at launch

| Order | Asset | Why |
|-------|-------|-----|
| 1 | Anchor blog | Everything links back; give it a head start |
| 2 | Landing page | Conversion destination must exist before traffic |
| 3 | Lead magnet | The thing being offered |
| 4 | Email 1 | Delivers the magnet |
| 5 | Social | Drives to the anchor and the magnet |
| 6 | WhatsApp nudges | Warmest audience, last |
| 7 | Emails 2–5 | Over the following days |

Publishing social before the anchor wastes the link.

---

## 6. Seasonal timing

| Campaign | Lead time | Note |
|----------|-----------|------|
| Ramadan | 4 weeks | Heaviest safety review — fasting + medication caveats |
| Eid | 1 week | Short, tactical |
| New Year | 3 weeks | Enrollment-focused |
| World Diabetes Day | 3 weeks | Awareness + lead magnet |
| Summer | 2 weeks | Light |

---

## 7. Gates that apply to the whole campaign

- [ ] One anchor, cleared, published first
- [ ] Every asset individually cleared — no inherited clearance
- [ ] Every product fact verified at publish, not recalled
- [ ] Banned-term exceptions declared per-asset, not campaign-wide
- [ ] Success measure stated before launch, not chosen afterwards
- [ ] Fasting content carries the insulin/sulfonylurea caveat everywhere it appears

---

## Post-launch

Record what happened against the stated success measure. A campaign with no recorded outcome teaches nothing for the next one.
