# SOPs

Standard operating procedures for decisions that recur and must stay consistent over time.

| SOP | Covers | Cadence |
|-----|--------|---------|
| [terminology-governance-sop.md](terminology-governance-sop.md) | Adding/changing controlled terms; app ↔ repo sync | Quarterly + on change |
| [content-calendar-sop.md](content-calendar-sop.md) | Monthly planning, pillar/funnel/persona balance | Monthly |
| [evidence-review-sop.md](evidence-review-sop.md) | Keeping published claims true as evidence moves | Annual + triggered |
| [correction-incident-sop.md](correction-incident-sop.md) | When something wrong ships — P0–P3 response | On incident |
| [gold-example-promotion-sop.md](gold-example-promotion-sop.md) | What earns a place in `examples/gold/` | On nomination |

## The two that must actually run

Most of these are reactive. Two are not, and the system degrades without them:

1. **Quarterly terminology sync** — the content repo and the app's `BANNED_CLAIMS` array drift apart silently
2. **Annual evidence review** — claims that were true when published stop being true

## The principle behind the correction SOP

When something ships wrong, the question is never "who made the error" — it's **"which gate should have caught it, and why didn't it?"** Then fix the gate, not just the piece.
