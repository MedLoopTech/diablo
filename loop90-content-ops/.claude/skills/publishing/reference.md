# Publishing — Reference

## The facts-verification rule, expanded

The single highest-risk failure at this stage is publishing a number that was true once.

**Why recall fails here:** pricing, currency, referral amounts, and feature availability all changed during development. Anything you "remember" about them is a snapshot, not a fact. The platform currency is admin-configurable — content that hardcodes "PKR" breaks the moment it's changed.

**Procedure:**

1. List every product fact in the piece
2. For each: is it on the stable list, or does it need verification?
3. Verify the unstable ones against the live source
4. If verification isn't possible right now → cut the sentence or hold the piece and ask

Never publish with "I'll check that later."

## Currency in content

- Never write a bare "PKR 4,500" as if the currency is fixed
- For app-surface content, currency comes from config
- For static marketing copy where a figure is genuinely needed, verify the current setting and state it as of a date

## Frontmatter (blog)

```yaml
title:
slug:
meta_description:
primary_keyword:
persona:
pillar:
evidence_level:
references:
reviewed_by: medical-safety
review_date:
published_date:
rubric_score:
```

## Channel gotchas

| Channel | Easy to get wrong |
|---------|-------------------|
| WhatsApp | Markdown headings don't render; only `*bold*` and `_italic_` |
| In-app | Concatenated strings break `t()`; write whole sentences |
| Email | Preview text that just repeats the subject wastes the slot |
| Short video | Disclaimer needs to be *both* spoken and on screen — one isn't enough |
| Instagram | Slide 1 must work as a thumbnail out of context |
| Landing | Disclaimer needed twice: footer *and* near health claims |
| LinkedIn | Everything after line 2 is behind "…see more" |

## Archiving sources

Link rot is real and citations must survive. For each reference:

- Store the PMID or DOI, not just the URL
- Save the abstract text
- Note the access date

A correction two years from now needs the source you actually used.

## Corrections to published content

If an error is found post-publication:

1. Fix through the normal pipeline — `editing` → `medical-safety` → `publishing`
2. For a factual or medical error, add a dated correction note on the piece
3. For a typo, silent fix is fine
4. If the error was a safety issue, note it in the terminology SOP changelog if a rule needs to change

Never silently alter a medical claim on a published piece.

## What you don't do

- Override a block, for any reason
- Fix content problems yourself — return them
- Publish "provisionally"
- Promote your own pieces to `examples/gold/` (flag only)
