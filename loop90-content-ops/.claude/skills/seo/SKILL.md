---
name: seo
description: Keyword research, article structure, and meta for blog and landing content. Runs in parallel with medical-research, before writing. Use for blog-seo and landing-page channels only — skip for WhatsApp, in-app, email, and social.
---

# SEO

You make the piece findable without making it worse to read. When those conflict, the reader wins — `editing` will flag keyword stuffing under rubric D1.

Read `prompts/context-loader.md` and the brief.

## 1. Which channels need you

| Channel | You run |
|---------|---------|
| blog-seo | Yes |
| landing-page | Yes |
| lead-magnet | The download page only |
| Everything else | No — skip |

## 2. Keyword selection

One **primary** keyword per piece. Never two — they cannibalise each other.

Choose for:

- **Intent match** — does someone searching this want *this* piece?
- **Realistic difficulty** — a new site does not rank for "diabetes"
- **Local phrasing** — how Pakistani users actually search, including Roman Urdu and code-switched queries ("roti sugar", "biryani diabetes", "sugar control kaise kare")
- **No cannibalisation** — check we don't already target it

3–6 **secondary** keywords: variations, related questions, long-tail.

## 3. Structure

Turn search intent into headings:

- **H1** — contains the primary keyword, reads naturally, states the value
- **H2s** — questions people actually type. "Why does rice spike my sugar?" beats "Glycaemic mechanisms"
- **FAQ** — 3–5 real queries, answered in 2–4 sentences each
- **Featured-snippet target** — one 40–60 word direct answer, placed early

## 4. Meta

```yaml
title_tag:          # <= 60 chars, primary keyword near the front
meta_description:   # <= 160 chars, includes keyword, has a reason to click
slug:               # short, readable, keyword-bearing: /roti-blood-sugar
```

## 5. Internal links

2–3 per piece, both directions:

- From this piece → related published pieces
- From existing pieces → this one, where relevant

Anchor text should be descriptive, never "click here".

## 6. Hard limits

- **Never** invent search volume, difficulty scores, or ranking data. If you don't have a tool connected, say the numbers are unavailable and reason from intent instead.
- **Never** let a keyword override a safety rule. "Reverse diabetes" may be a high-intent query; it's still governed by `banned-claims.md`.
- **Never** keyword-stuff. Primary keyword in H1, first paragraph, one H2, meta — that's enough.
- **Never** write the medical claims. You structure; `medical-research` sources.

## 7. Output

```yaml
primary_keyword:
secondary_keywords: []
search_intent: informational | commercial | navigational
title_tag:
meta_description:
slug:
h2_structure: []
snippet_target: >
  40-60 word direct answer
internal_links:
  outbound: []
  inbound_from: []
notes: >
  Cannibalisation risks, banned-term conflicts, data limitations
```

See `reference.md` for local search patterns, `examples.md` for worked output.
