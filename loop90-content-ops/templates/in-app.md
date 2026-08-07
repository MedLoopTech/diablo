# Template — In-App

★★★★★ The strictest channel. Copy here is validated at runtime by the app itself.

## Constraints

| Field | Value |
|-------|-------|
| Reading level | Grade 6–8 |
| Banned claims | **Zero tolerance** — enforced by `checkAnnouncementCopy()` |
| Disclaimer | Announcements: none inline, but no banned terms. Learn content: full block |
| Localization | Whole sentences only — must survive `t()` wrapping |
| Currency | Never hardcode — always the configured platform currency |

## Content types

### 1. Cohort announcement

Validated by the app. Rejected at save time if any banned term appears.

| Field | Limit |
|-------|-------|
| Title | ~60 chars |
| Body | 2–4 short sentences |
| CTA label | 2–4 words |

> **Week 5 starts Monday**
>
> New movement sessions unlock tomorrow. Your coach has added two 12-minute routines you can do at home.
>
> *See this week's plan*

### 2. Learn tab article

Longer educational content. Full disclaimer required.

```
Title
2-sentence intro (why this matters to you today)
2–4 sections with subheads
"Try this today" box
Disclaimer block
```

### 3. AI coach copy

- First mention of the coach in any session: **"AI coach — not a doctor"**
- Never phrases medication guidance, even conditionally
- Routes clinical questions with warmth, not a cold refusal:

> That's a medication question, so I'm passing it to Dr. Ayesha — she'll see it with your recent readings attached. In the meantime, here's what I *can* help with…

### 4. Nudge / notification

| Field | Limit |
|-------|-------|
| Title | ~40 chars |
| Body | ~120 chars |

> **Log before breakfast**
> 30 seconds. Your fasting number tells the clearest story.

### 5. Escalation guidance

Wording must match `CONSTITUTION.md` §14 thresholds exactly.

> **This reading needs a doctor now**
>
> Your reading is above 250 mg/dL. Contact your pod doctor immediately. If you feel unwell — chest pain, confusion, vomiting — call emergency services.

## Required elements

- [ ] Passes `checkAnnouncementCopy()` — no cure/cured/miracle/guaranteed/100% effective
- [ ] Thresholds exact: ≥250 urgent, ≤70 urgent, ≥180 routine
- [ ] "AI coach — not a doctor" on first coach mention
- [ ] No medication instruction anywhere
- [ ] Strings are whole sentences, not concatenated fragments
- [ ] Currency and amounts read from config, never written inline

## Localization notes

Bad — breaks under translation:

```
"You have " + count + " tasks left today"
```

Good:

```
t("tasksRemaining", { count })
```

Write copy as complete sentences with named placeholders. Avoid idioms that don't survive Urdu (see `urdu-localization`).

## Never

- Any banned term, in any field, including CTA labels
- Marketing language ("reverse", "guaranteed") — this is not a marketing surface
- Countdown/scarcity pressure
- Guilt framing for missed logs or streaks lost
