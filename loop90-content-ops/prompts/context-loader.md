# Prompt Block — Context Loader

Every skill reads these before doing anything. Order matters: the constitution wins conflicts.

## Always

1. `CONSTITUTION.md` — brand, voice, safety, terminology. **Single source of truth.**
2. `domains/<domain>/banned-claims.md` — what cannot be said, per channel
3. The content brief — persona, channel, pillar, funnel stage

## Conditionally

| If | Also read |
|----|-----------|
| Persona is set | `domains/<domain>/personas/<persona>.md` |
| Channel is set | `templates/<channel>.md` |
| Medical content | `research/evidence-levels.md` + the research memo |
| Competitive framing | `domains/<domain>/competitor-positioning.md` |
| Topic selection | `domains/<domain>/topic-pillars.md` |
| Scoring or reviewing | `rubrics/medical-article-rubric.md` |
| Safety review | `checklists/safety-checklist.md` |
| Final gate | `checklists/pre-publish-checklist.md` |

## Facts you must verify, never recall

These change. Look them up in the app or ask — do not write them from memory:

- Pricing, in any currency
- Currency itself (platform-configurable, not hardcoded PKR)
- Referral payout amounts and reward types
- Which features actually ship today
- Cohort sizes and program specifics if they've changed

Stable facts you may state directly: 90-day program, cohorts of 30–50, care pod = one doctor + one nutritionist + one movement coach, escalation thresholds ≥250 / ≤70 / ≥180.

## Conflict resolution

| Conflict | Winner |
|----------|--------|
| Constitution vs anything | Constitution |
| App source vs docs (safety rules) | App source — then fix the docs |
| Domain file vs framework file | Domain file, within its domain |
| Brief vs template | Brief, unless it breaks a safety rule |
| Anything vs a safety rule | The safety rule, always |
