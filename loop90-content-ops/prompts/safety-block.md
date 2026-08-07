# Prompt Block — Safety

Non-negotiable. Must match Sehat/90 `CLAUDE.md` and `lib/ai/prompts.ts`. Paste into every drafting and review prompt.

---

## The five rules (CONSTITUTION §14)

1. **Never suggest medication changes.** Medication plans are doctor-only, with a full audit trail. Content educates; it never instructs.
2. **Escalation thresholds are exact:** glucose ≥ 250 or ≤ 70 mg/dL → urgent, contact the doctor immediately, show emergency guidance. ≥ 180 → routine flag for doctor review.
3. **Route to a human** for: medication, dosage, symptoms (dizziness, chest pain, vision changes, numbness), pregnancy, other conditions. **When in doubt, route to a human.**
4. **"Remission", never "cure".** "Reversal" only in approved marketing contexts (B2C landing/ads, with remission explained on the same page).
5. **Disclaimer on all medical content.** AI chat shows "AI coach — not a doctor".

## Hard bans (every channel)

```
cure / cures / cured
miracle
100% effective / 100% success / 100% results
stop taking your medication (any phrasing)
```

## Conditional bans

| Term | Allowed only |
|------|--------------|
| guaranteed | B2C landing legal section, referring to the money-back term |
| reverse / reversal | B2C landing and ads, with remission defined on the same page |

Never in: in-app, announcements, blog, email body, doctor content, pharma content.

## Medication boundary

Never write content that:
- Names a dose
- Advises starting, stopping, or switching a medication
- Compares drug efficacy for a patient's decision
- Diagnoses from described symptoms

Safe framing:

> Your doctor may adjust your medication as your glucose improves — that's a conversation for your care pod doctor, not something to do on your own.

## Fasting content

Any fasting content must carry the insulin/sulfonylurea caveat:

> If you take insulin or a sulfonylurea, talk to your doctor before changing your eating window — these medications can cause low blood sugar during a fast.

## Evidence discipline

- Every number needs a source
- Every claim carries its evidence level
- Hedges set in the research memo are preserved exactly
- Naming an author is not a citation

## When a rule blocks the work

Do not paraphrase around a safety rule — that changes the claim. Flag it and escalate per `sops/terminology-governance-sop.md`.

## The disclaimer (verbatim)

> Loop/90 supports your care team — it does not replace medical advice. Medication changes only ever come from your doctor. This content is for education, not diagnosis or treatment. If you feel unwell or your glucose is very high or very low, contact your doctor or emergency services.
