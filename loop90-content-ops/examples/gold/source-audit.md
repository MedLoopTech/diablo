# Source Asset Audit

The three HTML assets in `products/Content Resources/` were written before `CONSTITUTION.md` and `banned-claims.md` existed. This audit says what may be reused as-is, what needs a fix first, and why.

**Audited:** 2026-08-07. Method: full banned-term regex scan plus manual review of each hit in context.

---

## Summary

| Asset | Verdict | Blocking issues |
|-------|---------|-----------------|
| `loop90_enhanced.html` (B2C landing) | **Mostly compliant** — genuinely exemplary in places | 0 blocking, 1 to verify |
| `loop90_professionals.html` (B2B landing) | **Needs review** | "guaranteed" usage to check in context |
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

### To verify before reuse

- **PKR 16,000** program price — a document, not live config. Verify.
- **"40 Patients per cohort"** — within the stated 30–50, consistent.

---

## 2. B2B professionals landing — needs review

**Term hits:** 21 × "guarantee", 1 × "guaranteed"

The plural "guarantee" instances are likely the same money-back construction. The singular **"guaranteed"** needs checking in context — on doctor-facing content, "guaranteed" is banned outright, with no money-back exception, because there's no consumer refund being described.

**Action:** review that one instance before reusing this asset.

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
