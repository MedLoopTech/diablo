# Workflow — Blog Post Pipeline

The canonical chain. Referenced by `README.md`'s Quick Start.

**Input:** a topic or request. **Output:** a published, cleared article with its provenance archived.

---

## Stages

```
1. ceo                        route + classify
2. chief-content-strategist   brief
3. medical-research  ─┐       memo (if medical_content: true)
   seo               ─┘       keywords + structure    [parallel]
4. writing                    draft
5. editing                    rubric A/C/D/E
6. medical-safety             rubric B + verdict
7. publishing                 pre-publish + ship
```

Steps 3a and 3b run in parallel — they don't depend on each other.

---

## Stage detail

### 1. CEO — route

- Classify: new medical content
- Confirm no existing brief
- Set the chain, flag gates

**Exit:** routing plan.

### 2. Strategist — brief

- Persona, channel (`blog-seo`), pillar, funnel stage
- `reader_question` in the reader's words
- `single_takeaway` in one sentence
- Objections from the persona file
- Safety flags set
- `do_not_include` populated
- Repurposing map (do this now — it improves the anchor)

**Exit:** complete brief, `status: briefed`.
**Gate:** no unanswered fields.

### 3a. Medical Research — memo (parallel)

- Answer the brief's `reader_question`, not the general topic
- Grade every claim
- Build the **numbers table** with exact approved wording
- Desi context: what transfers from Western research, what doesn't
- Counter-evidence — mandatory
- Safety boundaries for this topic
- 2–5 references with levels

**Exit:** memo, `status: researched`.
**Gate:** if no claim can be supported, refuse and route back to the strategist.

### 3b. SEO — structure (parallel)

- One primary keyword, 3–6 secondary
- H2s as real queries; local vocabulary ("sugar", Roman Urdu)
- Title tag ≤ 60, meta ≤ 160, slug
- Snippet target, 40–60 words
- Internal links both directions
- Cannibalisation check

**Exit:** SEO block appended to the brief.
**Gate:** never target a banned term.

### 4. Writing — draft

- Refuse if no memo and `medical_content: true`
- Every number from the memo's table only
- Channel template's required elements, all present
- Full disclaimer block (blog rule)
- Log `wanted_but_unsupported`

**Exit:** draft, `status: drafted`.

### 5. Editing — score

- Sections A, C, D, E
- Fix mechanical issues in place
- Return evidence problems to research, structural problems to writing

**Exit:** `subtotal ≥ 66/75` and zero hard fails → `pass_to_safety`.

### 6. Medical Safety — verdict

- Scan the whole surface, including meta and alt text
- Banned claims, medication boundary, thresholds, disclaimer
- Section B scored, combined into the final total

**Exit:** `cleared` and `final ≥ 85/100` → publishing. Otherwise `blocked` → writing.

### 7. Publishing — ship

- Entry check: cleared, ≥ 85, zero hard fails
- **Verify product facts against source** — never recall pricing, currency, referral amounts, or feature availability
- Pre-publish checklist, all sections
- Format: frontmatter, slug, meta, internal links, alt text
- Archive brief + memo + sources (PMID/DOI, not just URLs)
- Flag ≥ 95 as a gold candidate

**Exit:** `status: published`.

---

## Typical timeline

| Stage | Effort |
|-------|--------|
| Brief | 15 min |
| Research | 45–90 min |
| SEO | 20 min (parallel) |
| Draft | 45 min |
| Edit | 30 min |
| Safety | 20 min |
| Publish | 20 min |

Roughly 3–4 hours for a 1400-word medical article with real research. Faster is usually a gate being skipped.

---

## Failure paths

| Failure | Goes to |
|---------|---------|
| Unsourced number | `medical-research` |
| Hard fail on voice | `writing` |
| Below 70 total | `writing` |
| Safety block | `writing` |
| Unverifiable pricing at publish | User |
| Three bounces without reaching 85 | `chief-content-strategist` — the brief is wrong |

---

## Worked instance

See `.claude/skills/*/examples.md` — the roti piece (`2026-08-blog-roti-glycemic-load`) runs end to end across all seven stages, including the returns.
