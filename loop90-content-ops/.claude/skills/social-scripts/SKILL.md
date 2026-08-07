---
name: social-scripts
description: Writes short-video scripts (Reels/Shorts), Instagram carousels, and LinkedIn posts — either from a published anchor or from a standalone brief. Handles hooks, beats, on-screen text, and captions. Every output re-gates through medical-safety.
---

# Social Scripts

You write for formats where attention is measured in seconds and the disclaimer competes with the content for space.

Read `prompts/context-loader.md`, `prompts/brand-voice-block.md`, `prompts/safety-block.md`, the relevant template (`short-video.md`, `instagram.md`, `linkedin.md`), the persona, and — if derived — the anchor and its memo.

## 1. Two entry paths

| Path | Requirement |
|------|-------------|
| Derived from a published anchor | Inherit the memo's boundary; add no new claims |
| Standalone brief | If `medical_content: true`, a research memo is still required |

Short format does not exempt a piece from the evidence rules. It constrains what topics are viable at all.

## 2. The hook is the whole game

**Short video:** 3 seconds. **Instagram:** slide 1 as a thumbnail. **LinkedIn:** 2 lines before "…see more".

| Hook type | Example |
|-----------|---------|
| Visual contrast | Two plates, same rice, different pairing |
| The reader's own observation | "Biryani spikes you. Daal chawal doesn't. Same rice." |
| The reframe | "The problem was never the roti." |
| Direct question | "Can you eat rice with sugar? Yes — here's how." |

Banned hooks: "Doctors don't want you to know", any promised number, fear openers, slow build-ups.

## 3. One idea, always

These formats hold exactly one idea. A script with two ideas has neither. If the brief has two, it's two pieces.

## 4. Disclaimer is part of the script, not an afterthought

**Short video** needs it spoken *and* on screen — write both into the beats, don't append them:

> Spoken: *"Yeh general information hai — medical advice nahi. Apne doctor se zaroor baat karein."*
> On screen: *General information, not medical advice. Talk to your doctor.*

**Instagram:** final slide *and* a caption line.
**LinkedIn (doctor):** "Clinical decisions remain yours."

Budget the seconds for it up front. A 60-second script with 55 seconds of content has no room and will get cut.

## 5. Topics that don't work in short form

Say so rather than forcing it:

- Anything medication-adjacent — no room for the routing nuance
- Definitional content with multiple mandatory caveats (e.g. remission)
- Claims needing citation density the format can't carry
- Anything where cutting a caveat for time would change the meaning

**Test:** if the honest version doesn't fit, the format is wrong — not the honesty.

## 6. On-screen text

- Large enough to read on a phone at arm's length
- Never more than ~8 words at once
- Never the same words as the voiceover — complement, don't duplicate
- Numbers on screen must match the memo exactly

## 7. Output

```yaml
format: short-video | carousel | linkedin
source: <anchor id> | standalone brief
persona:
takeaway: >
  One sentence.
hook: >
  The first 3 seconds / slide 1 / first 2 lines.
beats: []              # timestamped for video, per-slide for carousel
on_screen_text: []
voiceover: []
caption: >
disclaimer:
  spoken: >
  on_screen: >
hashtags: []
new_claims: []         # must be empty when derived
requires_safety_review: true
status: scripted
```

See `reference.md` for beat structures and hook patterns, `examples.md` for full scripts.
