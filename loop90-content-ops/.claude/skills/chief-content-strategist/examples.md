# Chief Content Strategist — Examples

## Example 1 — Vague request → complete brief

**Input:** "Something about roti."

```yaml
id: 2026-08-blog-roti-glycemic-load
title_working: "Why daal chawal spikes you less than plain rice"

domain: diabetes-remission
persona: patient
channel: blog-seo
pillar: 2
funnel_stage: awareness

objective: >
  Replace "avoid carbs" with "pair and portion carbs" as the reader's
  working model, using foods they eat every day.

reader_question: >
  "Why does my sugar go up after biryani but not so much after daal chawal?"

single_takeaway: >
  Pairing a carbohydrate with protein, fibre, or fat lowers its glycaemic
  load — so change what's *next to* the rice before you change the rice.

length: 1200-1500 words
reading_level: grade 8-10
medical_content: true
evidence_required: true

primary_keyword: "glycemic load roti rice"
secondary_keywords: ["daal chawal blood sugar", "biryani diabetes", "GI vs GL"]
internal_links: ["/plate-method-guide", "/post-meal-walk"]

touches_medication: false
touches_fasting: false
shows_glucose_numbers: true
banned_term_exceptions: []

lead_with: >
  The specific, familiar contrast — same rice, different meal, different
  number — then explain why.

objections_to_preempt:
  - "I can't give up roti and rice"
  - "Brown rice is the only answer"
  - "This is too complicated to do daily"

do_not_include:
  - Medication interactions
  - Full 7-day meal plan (that's a separate lead magnet)
  - CGM data interpretation

status: briefed
```

**Rationale:** Pillar 2 is Tier 1 and directly answers the #1 patient objection ("I can't give up roti"). Blog channel because the mechanism needs 1200 words to land properly and the search intent exists. Patient persona over prediabetic because the phrasing of the reader question is a diagnosed person's question.

**Alternatives considered:** WhatsApp first — rejected, the mechanism doesn't compress to 600 characters without becoming "eat less rice," which is the advice we're trying to replace.

---

## Example 2 — Request that needs splitting

**Input:** "A Ramadan guide for our patients and their doctors."

**Response:** That's three briefs, not one.

```yaml
- id: 2026-ramadan-patient-safety
  persona: patient
  channel: blog-seo
  pillar: 6
  touches_fasting: true      # insulin/sulfonylurea caveat required
  single_takeaway: >
    Before you fast, ask your doctor about your specific medications —
    then use these three habits to keep suhoor and iftar steady.

- id: 2026-ramadan-iftar-plate
  persona: patient
  channel: instagram
  pillar: 2
  touches_fasting: true
  single_takeaway: >
    Break your fast with protein and water before the carbohydrates.

- id: 2026-ramadan-doctor-brief
  persona: doctor
  channel: linkedin
  pillar: 6
  touches_medication: true
  single_takeaway: >
    Loop/90 flags fasting-period readings so you can adjust before
    a hypo, not after.
```

**Why split:** patient and doctor framings of fasting are medically and tonally different — one needs "ask your doctor", the other *is* the doctor. Combining them would produce a piece that serves neither.

---

## Example 3 — Request refused

**Input:** "A post about how our program beats Virta."

**Response:**

```yaml
status: refused
reason: >
  Named negative comparison is banned per competitor-positioning.md.
  We have no published head-to-head data, so any superiority claim
  would also fail rubric A1.
alternative_brief:
  id: 2026-blog-why-built-for-pakistan
  persona: prediabetic-family
  channel: blog-seo
  pillar: 2
  single_takeaway: >
    A remission program built on Western food data has a gap where
    your kitchen is — here's what changes when the plate is a thali.
  notes: >
    Makes the same competitive point through differentiation rather
    than disparagement. Cites DiRECT honestly, names no competitor.
```

---

## Example 4 — Repurposing map at brief time

For the roti anchor above:

```yaml
anchor: 2026-08-blog-roti-glycemic-load
derivatives:
  - channel: short-video
    idea: "Same rice, two plates, two numbers" — visual side-by-side
  - channel: instagram
    idea: 6-slide carousel of pairing swaps with real thali photos
  - channel: whatsapp
    idea: "Aaj chawal ke saath kachumber try karein" — one action
  - channel: email
    idea: GL mechanism expanded, links to the anchor
```

Mapping these before drafting forces the anchor to contain one strong visual contrast and one crisp action — which makes the anchor better, not just the derivatives.
