# Prompt Block — Content Brief

Output of `chief-content-strategist`; input to `medical-research`, `seo`, `writing`, `editing`, `medical-safety`, `publishing`.

One brief per piece. Everything downstream reads from it.

---

```yaml
# ─── Identity ────────────────────────────────────────────
id: 2026-08-blog-roti-glycemic-load
title_working: "What one roti actually does to your glucose"

# ─── Routing ─────────────────────────────────────────────
domain: diabetes-remission
persona: patient              # patient | prediabetic-family | doctor
                              # | nutritionist-coach | pharma-corporate
channel: blog-seo             # matches a file in templates/
pillar: 2                     # from topic-pillars.md
funnel_stage: awareness       # awareness | nurture | conversion | retention

# ─── The job ─────────────────────────────────────────────
objective: >
  One sentence: what this piece must achieve.

reader_question: >
  The actual question in the reader's head, in their words.

single_takeaway: >
  The one thing they should do or believe after reading.

# ─── Constraints ─────────────────────────────────────────
length: 1200-1500 words
reading_level: grade 8-10
medical_content: true         # true → research memo + full rubric required
evidence_required: true

# ─── SEO (if applicable) ─────────────────────────────────
primary_keyword:
secondary_keywords: []
internal_links: []

# ─── Safety flags ────────────────────────────────────────
touches_medication: false
touches_fasting: false        # true → insulin/sulfonylurea caveat required
shows_glucose_numbers: true   # true → thresholds must be exact
banned_term_exceptions: []    # e.g. ["reverse"] on B2C landing only

# ─── Angle ───────────────────────────────────────────────
lead_with: >
  The hook or opening angle.

objections_to_preempt:
  - from the persona file
  - 2-4 of them

do_not_include:
  - anything explicitly out of scope

# ─── Pipeline ────────────────────────────────────────────
research_memo:               # filled by medical-research
rubric_score:                # filled by editing
safety_verdict:              # filled by medical-safety
status: briefed              # briefed | researched | drafted | edited
                             # | cleared | published | blocked
```

---

## Rules

- **A brief with `medical_content: true` cannot skip the research memo.** `writing` refuses to draft without one.
- **`single_takeaway` is one sentence.** If it needs two, it's two pieces.
- **`banned_term_exceptions` is the only way** a conditionally-banned term enters a draft, and `medical-safety` re-validates it against the channel regardless.
- **`do_not_include`** exists to stop scope creep mid-draft. Use it.
