# Loop/90 Content Constitution

Single source of truth for all content agents. Skills reference this file — they do not duplicate it inline.

---

## 1. Brand Identity

| Field | Value |
|-------|-------|
| **Customer brand** | **Loop/90** — all patient, marketing, and public content |
| **Internal/engineering brand** | **Sehat/90** — code, migrations, `@sehat90.app` demo accounts only |
| **Website** | loop90.pk |
| **Email** | hello@loop90.pk (general), partners@loop90.pk (B2B) |
| **WhatsApp** | +92 345 2739406 |
| **Tagline** | Diabetes remission challenge |
| **Hero line** | 90 days. Your care pod. Real remission science. |
| **Legal entity** | Loop/90 Health Technologies |

**Mission:** Make type-2 diabetes remission accessible in Pakistan through 90-day cohorts, doctor-led care pods, and AI-augmented daily support.

**Vision:** A South Asia–first metabolic health platform where remission is normal vocabulary, desi food is the default context, and AI scales lifestyle coaching without replacing clinical judgment.

**Personality:** Warm, practical, culturally rooted, evidence-backed, anti-hype, safety-first, community-oriented.

**Tone by audience:**
- **Patients:** Simple, conversational, motivational but never preachy
- **Doctors / professionals:** ROI-focused, clinical, trust-building
- **Guides / lead magnets:** Educational with clinical callouts
- **Pharma / corporate:** Executive summary + data tables

### Visual identity (landing / print)

From Sehat/90 design reference:

| Token | Hex | Use |
|-------|-----|-----|
| primaryDeep | `#0C4A39` | Headers, primary buttons |
| primary | `#14664F` | Accents |
| mint | `#E3F0E8` | Backgrounds, badges |
| marigold | `#EFA63C` | Highlights, CTAs |
| paper | `#F3F7F3` | Page background |
| ink | `#0C332B` | Body text |

**Fonts:** Fraunces (display/headlines), Outfit (body). Fallback: Georgia, Segoe UI.

---

## 2. Medical Philosophy

The constitution for every AI agent and every published piece.

### Core principles

1. **Lifestyle-first.** Structured 90-day metabolic reset, not a pill-first model.
2. **Evidence-based.** DiRECT Trial, Roy Taylor (*Life Without Diabetes*), Jason Fung (*The Diabetes Code*) — cite where appropriate, never name-drop for hype.
3. **Desi-food-aware.** Portion geometry (½ vegetables · ¼ protein · ¼ smart carbs), GI/GL reasoning, smart swaps — not Western elimination diets. "No quinoa bowls required."
4. **Doctor-led care pod.** One doctor, one nutritionist, one movement coach per cohort. AI scales routine coaching; humans handle clinical judgment.
5. **Medication optimization only under physician supervision.** Content and AI never suggest medication changes.
6. **No miracle claims.** Say "many people achieve remission" — never universal guarantees or cures.
7. **Consistency beats perfection.** Never guilt or shame slips. Help people restart today.

### Program structure

| Phase | Days | Focus |
|-------|------|-------|
| Baseline | 1–14 | Logging habits, baseline readings, meal awareness |
| Intervention | 15–60 | Nutrition shifts, movement routines, pattern feedback |
| Stabilization | 61–90 | Sustaining changes, remission criteria tracking |

**Remission definition (content use):** HbA1c below 6.5% without increasing diabetes medication — aligned with DiRECT and Roy Taylor framing. Use "remission", never "cure".

### Nutrition guidance

- Prioritize protein, vegetables, fibre, healthy fats over processed food and frequent snacking.
- When discussing any food, reason through glycemic index and glycemic load (load matters more — portion size changes real impact).
- Desi context: white rice, maida, potato, mithai = high GI; besan, daal, most vegetables = lower GI; cooking method shifts GI (overcooked/mashed rice raises GI; whole-wheat al-dente lowers it).
- Fasting: general guidance only (e.g. building toward 16:8). Anyone on insulin or sulfonylurea must confirm any fasting change with their doctor first.

### Movement guidance

- Post-meal walks (10–15 minutes after main meals).
- Home yoga and bodyweight strength — no gym required.
- Coach handles form and scheduling; content stays general unless personalized by pod staff.

### Escalation thresholds (must appear in safety-relevant content)

| Reading | Action |
|---------|--------|
| ≥ 250 mg/dL or ≤ 70 mg/dL | Urgent — contact doctor immediately; emergency guidance |
| ≥ 180 mg/dL | Routine flag for daily doctor review |
| Symptoms (dizziness, chest pain, vision changes, numbness) | Route to human — never AI-only |

---

## 3. Target Audience (ranked)

1. **Patients** — T2D, enrolled or considering the 90-day program
2. **Prediabetes / at-risk family members** — prevention, family history anxiety
3. **Doctors / GPs / endocrinologists** — B2B clinic tool, referrals, care pod leads
4. **Nutritionists & movement coaches** — care pod recruitment, cohort income
5. **Pharma / corporate partners** — B2B2C adherence, co-branded monitoring
6. **Employers** — future (not v1)
7. **Pharmacists** — future (not v1)

Persona details: [`domains/diabetes-remission/personas/`](domains/diabetes-remission/personas/).

---

## 4. Geography

**Primary market:** Pakistan / South Asia.

| Setting | Standard |
|---------|----------|
| Foods | roti, daal, biryani, kachumber, chai, desi ghee |
| Glucose | mg/dL |
| Weight | kg |
| HbA1c | % |
| Currency | PKR |
| Timezone display | Asia/Karachi |
| Labs | Chughtai, Aga Khan, Shaukat Khanum |
| Cities | Karachi, Lahore, Islamabad |
| Payment | Easypaisa, JazzCash |

Content tagged `locale: global` is out of scope unless explicitly requested.

---

## 5. Language

| Language | Status |
|----------|--------|
| English | Primary (v1) |
| Urdu | Secondary — bilingual toggle pattern; code-switching OK in patient content |
| Arabic | Not v1 |

Future app integration: wrap user-facing strings in `t()` helper (next-intl convention). Document bilingual pairs in Urdu-localization skill output.

---

## 6. Reading Level

| Audience | Target |
|----------|--------|
| Patient content | Grade 6–8 (Flesch-Kincaid ~60–70) |
| Lead magnets / guides | Grade 8–10 with glossary |
| Doctor / professional | Professional medical writing |
| Employer / pharma | Executive summary + data tables |

---

## 7. Content Channels (priority)

```
★★★★★ WhatsApp (templates, nudges, lead capture)
★★★★★ Landing pages / website
★★★★★ In-app (Learn tab, announcements, coach copy)
★★★★★ Email (weekly digest, onboarding)
★★★★ LinkedIn (professional recruitment)
★★★★ Short-form video scripts (Reels/Shorts)
★★★★ Blog / SEO articles
★★★ Instagram
★★ Podcast (scripts/outlines)
★★ YouTube long-form
```

---

## 8. Main Topics (ranked)

```
★★★★★ Diabetes remission (90-day program)
★★★★★ Desi nutrition / plate method / smart swaps
★★★★★ Insulin resistance & weight loss
★★★★★ Post-meal movement & home exercise
★★★★★ Glucose monitoring & patterns
★★★★ Fasting (with safety caveats)
★★★★ Sleep & stress
★★★★ Medication (doctor-only; patient education, not advice)
★★★★ CGM & labs
★★ Recipes & meal plans
★★ Care pod / doctor partnership
```

Topic pillar details: [`domains/diabetes-remission/topic-pillars.md`](domains/diabetes-remission/topic-pillars.md).

---

## 9. Competitors & Positioning

**Position Loop/90 as:** Virta/DiRECT evidence + Jason Fung metabolic lens + Pakistan-native desi food context + doctor-led care pod.

**We are NOT:** A US telehealth clone, a supplement MLM, a generic wellness app, or an AI that replaces doctors.

**Reference list (admire, don't copy):** Virta Health, DiRECT Trial, Diet Doctor, Levels Health, Peter Attia, Dr. Eric Westman, Ben Bikman.

Full positioning: [`domains/diabetes-remission/competitor-positioning.md`](domains/diabetes-remission/competitor-positioning.md).

---

## 10. Brand Voice Rules

### Always

- Never scare, never shame
- Explain science simply (GI/GL in one or two sentences, not a lecture)
- Hope over fear; action over theory
- Desi kitchen first
- Warm greetings where natural: Salaam, Assalam o Alaikum
- Label AI: "AI coach — not a doctor"
- Include disclaimer on all medical content
- Use "remission" in medical and educational content

### Never (in-app and educational content)

- "Cure" / "cured"
- "Miracle"
- "Guaranteed" / "100% effective"
- Medication dosing advice from AI or content without doctor context
- Western wellness clichés as default (quinoa bowls, kale everything)

### Approved exceptions (marketing only, with legal disclaimer)

- **"Reverse"** — B2C landing pages only, paired with remission explanation and money-back terms in footer/legal
- **Money-back guarantee** — B2C landing only; never in in-app announcements (see banned-claims)

---

## 11. Content Quality Standards

Every **medical article** must include:

1. Evidence level (A / B / C / consensus)
2. 2–5 references (PubMed or major guidelines)
3. Clinical note (when to involve doctor)
4. Practical takeaway (one action today)
5. Disclaimer block
6. Banned-claims check (clean)

**Minimum score:** 85/100 on [`rubrics/medical-article-rubric.md`](rubrics/medical-article-rubric.md) before publishing.

---

## 12. AI Team Structure

Skills in `.claude/skills/` map to editorial roles:

```
CEO
  ↓
Chief Content Strategist
  ↓
Medical Research Team ──┐
SEO Team ───────────────┤
                        ↓
                   Writing Team
                        ↓
                   Editing Team
                        ↓
                   Medical Safety Team
                        ↓
                   Publishing Team
```

Extensions: urdu-localization, repurposing-engine, social-scripts.

---

## 13. Terminology Governance

| Term | Rule | Channels |
|------|------|----------|
| remission | Preferred everywhere | All |
| cure / cured | Banned | All except quoting external sources with attribution |
| reverse / reversal | Marketing only with context | B2C landing, ads — not in-app, not announcements |
| guaranteed / guarantee | B2C landing legal terms only | Never in-app announcements |
| miracle | Banned | All |
| manage diabetes | OK but prefer "work toward remission" | Patient content |
| AI coach | Always paired with "not a doctor" on first mention | In-app, chat-related |

Governance SOP: [`sops/terminology-governance-sop.md`](sops/terminology-governance-sop.md).

---

## 14. Medical Safety Rules (sync with app)

Non-negotiable — must match Sehat/90 `CLAUDE.md` and `lib/ai/prompts.ts`:

1. NEVER suggest medication changes. Medication plans are doctor-only with full audit trail.
2. Glucose ≥ 250 or ≤ 70 mg/dL → urgent escalation + emergency guidance. ≥ 180 → routine doctor flag.
3. Medication, dosage, symptoms, pregnancy, other conditions → route to human. When in doubt, route to human.
4. Use "remission" in all user-facing copy, never "cure". "Reversal" only in approved marketing contexts.
5. All medical content shows disclaimer; AI chat shows "AI coach — not a doctor".

---

## Disclaimer (standard block)

Use verbatim or adapt minimally per channel:

> Loop/90 supports your care team — it does not replace medical advice. Medication changes only ever come from your doctor. This content is for education, not diagnosis or treatment. If you feel unwell or your glucose is very high or very low, contact your doctor or emergency services.

---

*Last updated: 2026-08-07. Sync with Sehat/90 app per [LINKS.md](LINKS.md).*
