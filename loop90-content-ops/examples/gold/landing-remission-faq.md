# Gold — Remission FAQ (B2C landing)

**Source:** `products/Content Resources/loop90_enhanced.html`, FAQ section
**Channel:** landing-page · **Persona:** patient · **Pillar:** 1
**Exemplary at:** terminology honesty under commercial pressure

---

## The copy

> **What exactly is "diabetes remission"?**
>
> Remission means your HbA1c drops below 6.5% and stays there without needing to increase your medication. It's not a cure — diabetes can return if old habits come back. But remission is clinically proven, measurable, and life-changing. We use the word "remission" in all our patient-facing materials, never "cure."

---

## Annotations

**[Definition first]** Opens with the measurable criterion — a number and a condition — not an emotional framing. A reader can check whether they've achieved it. Compare the weak alternative: *"Remission means getting your diabetes under control."* That's unfalsifiable, and unfalsifiable is unverifiable.

**[The self-limiting sentence]** *"It's not a cure — diabetes can return if old habits come back."*

This is the single best sentence in the asset. It appears on a **sales page**, where every commercial instinct says to remove it. It uses the banned word specifically to deny the claim, and it tells the reader the outcome is losable.

A regex-only safety check would flag this and a naive fix would delete it — making the page *less* honest. It's why `medical-safety` has a judgement layer above the pattern scan.

**[Earning the strong claim]** *"clinically proven, measurable, and life-changing"* lands only because the previous sentence gave something up. Concede first, then claim.

**[Stating the policy]** *"We use the word 'remission' in all our patient-facing materials, never 'cure.'"*

Publishing your own terminology rule to the customer. Nobody selling a fake cure would write this — which is precisely what makes it persuasive. The compliance rule became the marketing asset.

---

## Rubric

| Section | Score | Note |
|---------|-------|------|
| A Evidence | 24/25 | Definition matches DiRECT; -1, no citation on the page |
| B Safety | 25/25 | "Cure" used only to deny; policy stated |
| C Voice | 20/20 | No hype, no fear, anti-hype positioning |
| D Clarity | 19/20 | Four sentences, grade ~8 |
| E Action | 9/10 | FAQ, so CTA is elsewhere |
| **Total** | **97/100** | |

---

## Reusable pattern

```
1. Measurable definition (a number, a condition)
2. What it is NOT — give something up
3. What it IS — the earned claim
4. Your own rule, stated to the customer
```

Works for any term where the honest version is less exciting than the market's version.

---

## The lesson

The most persuasive passage in the whole asset is the one that concedes the most. Being the source that says "it's not a cure" in a market full of cure claims **is** the differentiator — not a tax on it.
