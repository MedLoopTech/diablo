---
name: repurposing-engine
description: Turns one published, cleared anchor piece into channel variants — WhatsApp, video, carousel, email, LinkedIn. Use only on published sources. Every variant re-gates through medical-safety, because channel rules differ.
---

# Repurposing Engine

You derive, you don't re-report. The anchor's evidence boundary is your boundary.

Read `prompts/context-loader.md`, the published anchor, its research memo, and the target channel templates.

## 1. Entry condition

The source must be **published** — cleared and shipped. Never repurpose a draft; you'd propagate something that may still change.

## 2. Inherit the evidence, not the clearance

| Inherited | Not inherited |
|-----------|---------------|
| The memo's numbers table | The safety clearance |
| The approved hedges | The disclaimer form |
| The factual boundary | Banned-term permissions |

**Each variant re-enters `medical-safety`.** A blog cleared with a full disclaimer block does not make a Reel compliant — video needs the disclaimer spoken *and* on screen. WhatsApp needs a link. Different channel, different gate.

## 3. Derive, don't summarize

A summary of a 1400-word article makes a bad Reel. Instead, extract **one** thing per variant:

| Variant | Extract |
|---------|---------|
| Short video | The single most visual contrast |
| Instagram carousel | The method, one step per slide |
| WhatsApp | The one action |
| Email | The mechanism, expanded with a link back |
| LinkedIn | The professional-audience angle, if one exists |

If the anchor has no visual contrast, it has no Reel. Say so rather than manufacturing one.

## 4. Each variant needs its own takeaway

Derived from the anchor's `single_takeaway`, but expressed for that channel and that moment. Same destination, different vehicle.

The WhatsApp variant is not "the blog, shortened". It's the one action, standing alone, comprehensible to someone who never read the anchor.

## 5. Never introduce new claims

If a variant would be stronger with a fact the anchor doesn't have, you don't add it. Flag it as a future research need.

This is the main failure mode: a carousel wants a number for slide 4, and a number appears that was never in the memo.

## 6. Persona can shift, carefully

An anchor written for `patient` can yield an Instagram variant for `prediabetic-family` — but that's a different register, different objections, and possibly a different reading level. Load the new persona file; don't just change the label.

If the shift is large, it's a new brief, not a repurpose.

## 7. Output

```yaml
anchor: <published piece id>
variants:
  - channel: short-video
    takeaway: >
      Same rice, two plates, two numbers.
    inherits_from_memo: [directional comparison only, no figures]
    new_claims: []          # must be empty
    disclaimer_form: "spoken + on-screen"
    requires_safety_review: true

  - channel: whatsapp
    takeaway: >
      Add kachumber to tonight's rice.
    new_claims: []
    disclaimer_form: "link"
    requires_safety_review: true

skipped:
  - channel: linkedin
    reason: "No professional-audience angle in this anchor"

future_research_needs:
  - "Pakistani GI values — wanted for a carousel, memo forbids"

status: repurposed
```

See `reference.md` for the derivation map, `examples.md` for worked variants.
