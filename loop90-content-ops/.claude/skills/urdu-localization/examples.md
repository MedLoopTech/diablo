# Urdu Localization — Examples

## Example 1 — WhatsApp nudge

```yaml
source: 2026-08-wa-rice-pairing (cleared)
script: roman_urdu

pairs:
  - en: "Add one thing to your rice."
    ur: "Chawal ke saath ek cheez add karein."
    note: "Direct — works as-is"

  - en: >
      Plain white rice raises sugar quickly. But with daal, sabzi or
      kachumber alongside, that rise is gentler.
    ur: >
      Plain chawal akela sugar tezi se barhata hai. Lekin saath mein
      daal, sabzi ya kachumber ho — to woh rise halka ho jata hai.
    note: >
      "Rise" kept as loanword — "izafa" is formal and less clear here.
      Hedge preserved: "halka ho jata hai" not "khatam ho jata hai".

  - en: "The rice hasn't changed. The plate has."
    ur: "Chawal wahi hai. Plate badal gayi."
    note: "Rhythm preserved — short, parallel, memorable"

  - en: "Try kachumber with today's lunch."
    ur: "Aaj lunch mein kachumber try karein."
    note: ""

terms_kept_english: [rice→chawal (Urdu), sugar, plate, lunch, try, add]

safety_flags:
  - "No medical claim beyond the source's directional comparison"
  - "Disclaimer link unchanged"

requires_safety_review: true
status: localized
```

---

## Example 2 — The remission trap

```yaml
source: 2026-08-blog-what-remission-means (cleared)
script: roman_urdu

pairs:
  - en: >
      Remission means an HbA1c below 6.5% sustained for at least three
      months without glucose-lowering medication.
    ur: >
      "Remission" ka matlab hai ke aapka HbA1c 6.5% se neeche aa jaye,
      aur kam az kam teen mahine tak wahan rahe — bagair sugar ki dawai
      ke.
    note: >
      CRITICAL. "Remission" kept as a loanword and then defined. Every
      natural Urdu alternative drifts to "cure":
        - "ilaj" = cure → banned
        - "khatma" = elimination → banned
        - "theek ho gaya" = became fine → implies permanence → banned
      The loanword carries no false promise, and the definition
      immediately after does the work.

  - en: >
      Remission is not the same as a cure. It can be lost, and it needs
      maintaining.
    ur: >
      Remission aur "ilaj" ek cheez nahi hai. Yeh wapas bhi ja sakti
      hai, isliye ise maintain karna zaroori hai.
    note: >
      Uses "ilaj" here deliberately — to name what remission is NOT.
      This is the one safe use of the word in Urdu content.

terms_kept_english: [remission, HbA1c, sugar, maintain]

safety_flags:
  - "HIGH ATTENTION: remission handling — loanword + definition + explicit not-a-cure"
  - "Percentage and duration numerals preserved exactly"
  - "'wapas bhi ja sakti hai' preserves the impermanence caveat"

requires_safety_review: true
status: localized
```

---

## Example 3 — Hedge loss caught in review

```yaml
issue: hedge_dropped

original_en: >
  Pairing carbohydrates with protein is associated with a lower
  post-meal glucose rise.

first_draft_ur: >
  Carbs ke saath protein khane se sugar kam barhti hai.

problem: >
  "kam barhti hai" is a flat assertion. The English "is associated
  with" is a Level B hedge — it says correlation, not causation. The
  Urdu says it plainly happens.

  This is the most common translation safety failure: casual Urdu
  naturally drops modal hedging, and the claim strengthens silently.

corrected_ur: >
  Carbs ke saath protein khane se sugar ka rise aam tor par halka
  hota hai.

note: >
  "aam tor par" (generally / typically) restores the hedge without
  sounding academic. "halka hota hai" keeps it directional rather
  than absolute.

status: corrected_before_review
```

---

## Example 4 — Refused

```yaml
request: "Urdu version of the doctor LinkedIn post"
status: refused

reason: >
  Doctor-facing content is professional register, English only per
  CONSTITUTION §5 and the doctor persona file. Roman Urdu in a post
  aimed at endocrinologists reads as unprofessional rather than warm,
  and undermines the clinical positioning that persona depends on.

exception: >
  If the target is a Urdu-medium clinic audience specifically, that's
  a different persona and needs a strategist brief — not a translation
  of the existing post.

routed_to: chief-content-strategist
```
