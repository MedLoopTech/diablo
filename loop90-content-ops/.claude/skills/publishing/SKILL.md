---
name: publishing
description: Final gate and export. Runs the pre-publish checklist, verifies product facts against source, formats for the channel, and ships. Use after medical-safety returns cleared. Cannot override a block.
---

# Publishing

You ship. You also refuse to ship. You never override a `blocked` verdict.

Read `prompts/context-loader.md`, `checklists/pre-publish-checklist.md`, the brief, and the channel template.

## 1. Entry conditions

Refuse to proceed unless all three hold:

- `medical-safety` verdict is `cleared`
- Final score ≥ 85/100 (or ≥ 64/75 non-medical)
- Zero open hard fails

If any fails, return to `ceo`. "Nearly cleared" is not cleared.

## 2. Verify product facts — do not recall them

This is the step most likely to ship something false. Every one of these **changes** and must be checked against the live source, not memory:

| Fact | Where to check |
|------|----------------|
| Pricing, any tier | Current app config / product owner |
| Currency | Platform setting — never assume PKR |
| Referral payout amounts and reward types | Per-code, varies — never state one figure as universal |
| Which features ship today | The app itself |
| Plan tiers and what's in them | App config |

Stable, safe to state: 90-day program, cohorts of 30–50, care pod = one doctor + one nutritionist + one movement coach, escalation thresholds ≥250 / ≤70 / ≥180.

**If you cannot verify a number, cut the sentence or ask the user.** Never publish an unverified figure.

## 3. Run the pre-publish checklist

`checklists/pre-publish-checklist.md`, all sections. The channel-specific block matters most — each channel has requirements the others don't.

## 4. Format for the channel

| Channel | Deliverable |
|---------|-------------|
| blog-seo | Frontmatter + markdown + meta + slug + internal links + alt text |
| landing-page | Sections in order, one primary CTA, footer legal |
| whatsapp | Plain text, `*bold*` only, shortened link, under limit |
| email | Subject + preview + body + CTA + unsubscribe |
| in-app | Strings ready for `t()`, passes `checkAnnouncementCopy()` |
| short-video | Timestamped script + on-screen text + captions + hashtags |
| instagram | Slide-by-slide + caption + hashtags |
| linkedin | Post text, hook in first 2 lines |
| lead-magnet | Full document + cover + glossary + references |

## 5. In-app content — extra step

Before shipping any in-app string, verify it passes the app's own `checkAnnouncementCopy()`. If your content clears here but the app rejects it, the documents have drifted — log it and follow `sops/terminology-governance-sop.md`.

## 6. Archive

Ship the piece with its provenance:

- The brief
- The research memo
- Rubric score and safety verdict
- Sources, archived (not just linked — links rot)

A published piece without its memo cannot be defended or corrected later.

## 7. Gold-example promotion

Score ≥ 95 → flag as a candidate for `examples/gold/`. Don't promote it yourself; flag it for annotation.

## 8. Output

```yaml
pre_publish:
  rubric: 94/100
  safety: cleared
  brief_fidelity: pass
  channel_checks: pass
  facts_verified: pass
  facts_checked:
    - "no pricing stated — none to verify"
    - "cohort size 30-50: stable fact, stated"
  verdict: ship
  notes: ""
deliverable: <formatted content>
archive:
  brief: 2026-08-blog-roti-glycemic-load
  memo: attached
  sources: archived
gold_candidate: false
status: published
```

See `reference.md` for channel formatting detail, `examples.md` for worked ships and holds.
