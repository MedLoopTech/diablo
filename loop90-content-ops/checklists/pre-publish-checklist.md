# Pre-Publish Checklist

Final gate, run by the `publishing` skill. Assumes `medical-safety` has already returned `cleared` — this checks everything *else*.

---

## 1. Gates passed

- [ ] Rubric score ≥ 85/100 (or ≥ 64/75 for non-medical content)
- [ ] `safety-checklist.md` verdict is `cleared`
- [ ] No open hard fails

## 2. Brief fidelity

- [ ] Delivers what the brief asked for
- [ ] Correct persona voice
- [ ] Correct channel format and length
- [ ] Correct funnel stage and CTA
- [ ] Topic maps to a pillar in `topic-pillars.md`

## 3. Structure

- [ ] Title works standalone, out of context
- [ ] Opening earns attention in two sentences
- [ ] Headings scannable and in a sensible hierarchy
- [ ] One practical takeaway, clearly marked
- [ ] Ends with a CTA appropriate to the channel

## 4. Language

- [ ] Reading level on target for the persona
- [ ] Desi food examples, not Western defaults
- [ ] Terminology matches `CONSTITUTION.md` §13 ("remission", not "manage" where possible)
- [ ] Greetings natural, not forced
- [ ] Code-switching only where the persona supports it
- [ ] Spelling and grammar clean
- [ ] Currency shown as configured (never hardcoded), amounts accurate

## 5. Facts about Loop/90

Any product claim must match reality, not marketing memory:

- [ ] Pricing accurate (verify against current source, don't recall)
- [ ] Cohort size stated as 30–50
- [ ] Care pod described as one doctor, one nutritionist, one movement coach
- [ ] Program length 90 days
- [ ] Feature claims match what actually ships today
- [ ] Referral/reward terms accurate if mentioned

## 6. Channel-specific

**WhatsApp**
- [ ] Under length limit, scannable on a small screen
- [ ] Link shortened and working
- [ ] No unsupported formatting

**Landing page**
- [ ] Single primary CTA
- [ ] Disclaimer in footer and near health claims
- [ ] Mobile layout checked

**Blog / SEO**
- [ ] Primary keyword in title, H1, first paragraph
- [ ] Meta description written, under 160 characters
- [ ] Internal links added
- [ ] Alt text on images
- [ ] Slug clean and readable

**Email**
- [ ] Subject line and preview text written
- [ ] Single primary CTA
- [ ] Unsubscribe present

**Short video**
- [ ] Hook in first 3 seconds
- [ ] On-screen disclaimer text specified
- [ ] Caption/subtitle text supplied

**In-app**
- [ ] Passes the app's own `checkAnnouncementCopy` validation
- [ ] Strings suitable for `t()` wrapping (no concatenated fragments)

**LinkedIn / professional**
- [ ] Professional register, no patient-facing warmth
- [ ] "Clinical decisions remain yours" where doctor-facing

## 7. Localization readiness

- [ ] User-facing strings are whole sentences, translatable as units
- [ ] No idiom that breaks in Urdu without a note
- [ ] Bilingual pairs documented if this piece is going through `urdu-localization`

## 8. Output

- [ ] Frontmatter complete (evidence level, reference count, review date)
- [ ] Filed in the right folder with a consistent filename
- [ ] Sources archived with the piece
- [ ] Scored ≥ 95? → flag as a candidate for `examples/gold/`

---

## Sign-off

```yaml
pre_publish:
  rubric: 91/100
  safety: cleared
  brief_fidelity: pass
  channel_checks: pass
  facts_verified: pass
  verdict: ship | hold
  notes: ""
```
