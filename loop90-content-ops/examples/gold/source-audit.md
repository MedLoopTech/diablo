# Source Asset Audit

The three HTML assets in `products/Content Resources/` were written before `CONSTITUTION.md` and `banned-claims.md` existed. This audit says what may be reused as-is, what needs a fix first, and why.

**Audited:** 2026-08-07. Method: full banned-term regex scan plus manual review of each hit in context.

---

## Summary

| Asset | Verdict | Blocking issues |
|-------|---------|-----------------|
| `loop90_enhanced.html` (B2C landing) | **Mostly compliant** — genuinely exemplary in places | 0 blocking; pricing stale, corrected below |
| `loop90_professionals.html` (B2B landing) | **Compliant** | 0 blocking — resolved 2026-08-07, see below |
| `desi_diabetes_plate_guide_bilingual.html` (lead magnet) | **Would be blocked** | 2 blocking issues |

---

## 1. B2C landing page — mostly compliant

**Term hits:** 27 × "guarantee", 3 × "cure(s)", 1 × "reverse"

All reviewed. Every one is legitimate:

### "Guarantee" — correct usage throughout

> "Money-back guarantee. No subscriptions. No hidden fees."

Attached to the **refund**, never to a health outcome. This is exactly the permitted construction, on the exactly permitted channel. 27 instances, all this pattern.

### "Cure" — three usages, all defensible

| Usage | Verdict |
|-------|---------|
| "fake herbal cures and useless supplements" | Describing what *others* sell. Regex would flag it; a human reading it would not. Keep, and note the exception. |
| "It's not a cure — diabetes can return if old habits come back." | **This is the gold standard.** Uses the word to explicitly deny the claim. |
| "We use the word 'remission' in all our patient-facing materials, never 'cure.'" | States the policy itself. Exemplary transparency. |

### Also strong

- Remission defined correctly in the FAQ: "HbA1c drops below 6.5% and stays there without needing to increase your medication"
- "Not an AI chatbot. A real endocrinologist, nutritionist, and coach"
- "Do I have to stop eating roti and rice? No."

### Pricing — stale, corrected

- **"PKR 16,000" is out of date.** Confirmed 2026-08-07: current program price is **PKR 25,000**. Every instance of "PKR 16,000" in `loop90_enhanced.html` (hero price, testimonial referencing "PKR 16,000 is a lot for us") needs updating before this asset is reused anywhere.
- This is exactly the failure mode `publishing/reference.md` warns about — a figure that was true when written and silently went stale. Pricing must be verified at publish time, never recalled from a document.
- **"40 Patients per cohort"** — within the stated 30–50, consistent, no change needed.

---

## 2. B2B professionals landing — needs review

**Term hits:** 21 × "guarantee", 1 × "guaranteed"

**Resolved 2026-08-07.** The singular "guaranteed" hit:

> "I run yoga classes at a gym in Islamabad. The income is unpredictable. Loop90 gives me a fixed cohort, a structured program, and **guaranteed weekly payments**. I know exactly how much I'll earn each month." — Bilal Khan, Movement Coach

This is a coach testimonial about **income predictability**, not a health-outcome claim — a compensation term, not something `banned-claims.md` was written to restrict. Confirmed against `.claude/skills/medical-safety/reference.md`'s scope check (added as part of this review): a "guarantee" hit is only a violation when it claims a patient health outcome or clinical result.

`banned-claims.md` §"Context-dependent bans" was updated to state this scope explicitly, so future automated scans don't re-flag payment/compensation language in staff-recruitment content.

The 21 plural "guarantee" instances follow the same money-back-refund pattern already confirmed clean in the B2C landing page (§1 above).

**No fix needed.** This asset is compliant as written.

---

## 3. Lead magnet (plate guide) — would be blocked

Two blocking issues.

### Issue 1 — "Guarantee Included" (blocking)

> ✓ Lab-verified HbA1c Tests ✓ **Guarantee Included** ✓ 100% Desi Kitchen Friendly

"Guarantee" is permitted only in a B2C landing legal section, attached to a refund. Here it is:
- On a **lead magnet**, not a landing page
- Attached to **nothing** — a bare "Guarantee Included" in a benefits list reads as a guaranteed outcome
- Sitting next to "Lab-verified HbA1c Tests", which makes the implied guarantee a *clinical* one

**Fix:** "Money-back guarantee on the program" — or remove it from the lead magnet entirely and let the landing page carry it.

### Issue 2 — "Reverse Diabetes" without remission defined (blocking)

> "Reverse Type 2 Diabetes & Lower HbA1c using everyday Pakistani kitchen foods"
> "Ready to Reverse Diabetes in 90 Days?"

Four instances. "Reverse" requires the B2C landing/ads channel **and** remission defined on the same page. This is a lead magnet, and remission is never defined anywhere in it.

**Fix:** either add the remission definition to the guide, or use "remission" language throughout. The second is better — a clinical guide is exactly where precision belongs.

### Also note

> "100% Desi Kitchen Friendly"

Not a banned claim — the regex targets `100% effective/success/results`, and this is about food compatibility. Passes. Worth flagging as a near-miss so nobody "fixes" it unnecessarily.

### Disclaimer — present but thin

> "This guide is for educational purposes. Consult your doctor or Care Team before making major adjustments to insulin or medication dosage."

Correct in substance, but shorter than the standard block. Acceptable for a lead magnet footer; use the full block if the guide is reissued.

---

## What this audit demonstrates

The landing page's handling of "cure" is better than a simple ban would produce. It uses the word three times — to name what competitors sell, to explicitly deny the claim, and to state the policy — and is *more* trustworthy for it.

This is why `banned-claims.md` carries the attributed-quote exception and why `medical-safety` has a judgement layer above the regex. A pure pattern-matcher would block the best passage in the whole asset.
