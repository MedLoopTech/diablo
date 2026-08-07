# Workflow — Localization Pipeline

Takes a cleared English piece to Urdu or Roman Urdu. **Not a translation step bolted on the end — a full pipeline with its own gate.**

---

## Shape

```
1. entry check       source must be PUBLISHED, not drafted
2. script decision   Roman Urdu / Urdu script / decline
3. urdu-localization transcreate
4. medical-safety    re-gate — mandatory, no exceptions
5. publishing        format + ship
```

---

## 1. Entry check

The source must be **published** — cleared and shipped. Localizing a draft means adapting something that may still change.

Also confirm the persona permits localization at all:

| Persona | Localize? |
|---------|-----------|
| Patient | Yes — Roman Urdu preferred on phone channels |
| Prediabetic / family | Yes — either script |
| Doctor | **No** — professional English only |
| Nutritionist / coach | **No** — professional English only |
| Pharma | **No** |

A request to localize doctor content isn't a translation job; it's a new persona and needs a strategist brief.

---

## 2. Script decision

| Script | Channels |
|--------|----------|
| Roman Urdu | WhatsApp, in-app nudges, short video, Instagram captions |
| Urdu script | Formal guides, print, landing pages with a toggle |

Roman Urdu is right for most phone-first patient content — it's what people type and read daily.

---

## 3. Transcreation

Per `urdu-localization/SKILL.md`. The three things that decide quality:

- **Loanwords stay** — reading, sugar, walk, doctor, test, report
- **Foods stay Urdu** — never "lentil curry" for daal
- **Remission stays a loanword, then gets defined** — every natural Urdu alternative drifts to "cure"

---

## 4. Safety re-gate — the reason this is a pipeline

A clean English source can produce unsafe Urdu. The three failure modes:

| Failure | What happens |
|---------|--------------|
| Hedge loss | Casual Urdu drops modals; "may reduce" becomes "reduces" |
| Remission drift | *Ilaj*, *khatma*, *theek ho gaya* — all cure claims |
| Warmth → promise | Encouraging phrasing slides into guaranteed outcome |

`medical-safety` runs the full checklist against the **Urdu text**, not the English source. Scanning the English and assuming the Urdu is fine defeats the point.

Thresholds must survive numerically exact: 250, 70, 180, mg/dL — Western numerals, never spelled out.

---

## 5. Publishing

- Bilingual pairs documented (en/ur side by side) for the app's `t()` files
- Whole sentences, never concatenated fragments
- On-screen video disclaimers in English even when spoken in Urdu — screenshots get shared
- Archive both versions together

---

## Gates

- [ ] Source published, not drafted
- [ ] Persona permits localization
- [ ] Remission handled as loanword + definition
- [ ] Every hedge from the English survives in the Urdu
- [ ] Thresholds numerically exact
- [ ] Foods kept in Urdu
- [ ] `medical-safety` run against the Urdu text specifically
- [ ] Bilingual pairs documented

---

## What this pipeline refuses

- Localizing a blocked or draft piece
- Localizing professional-persona content
- Machine translation with a human skim
- Any output where a hedge was lost and "cleaned up" rather than restored
