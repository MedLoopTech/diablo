# CEO — Reference

## Routing edge cases

| Situation | Route |
|-----------|-------|
| Request spans two personas | Split into two pieces. One brief, one persona. |
| Request spans two channels | One brief per channel, or one source piece → `repurposing-engine` |
| "Make it shorter for WhatsApp" on a published blog | `repurposing-engine`, not `writing` |
| Doctor pitch needed | `chief-content-strategist` with `persona: doctor` — check `PITCHES.md` exists first |
| Someone pastes a competitor's article | Never adapt it. Brief a fresh piece on the same topic. |
| Urgent/reactive (news, seasonal) | Same pipeline. Urgency doesn't remove gates. |
| Correction to a published piece | `editing` → `medical-safety` → `publishing`, plus a note in the piece |

## Which channels need SEO

| Channel | SEO stage |
|---------|-----------|
| blog-seo | Required |
| landing-page | Required |
| lead-magnet | Optional — discoverability of the download page |
| Everything else | Skip |

## Which content is "medical"

`medical_content: true` when the piece makes any claim about:
- What a food, drug class, or behaviour does physiologically
- Outcomes, remission, risk, or prognosis
- Numbers of any kind about health

**Not medical:** program mechanics, care pod structure, pricing, recruitment copy, brand story. These still get the rubric (rebased to 75) but skip `medical-research`.

Borderline → treat as medical. The cost of an unnecessary memo is small; the cost of an unsourced claim is not.

## Skill ownership map

| Skill | Owns | Never does |
|-------|------|------------|
| `ceo` | Routing, gates, status | Writing, scoring |
| `chief-content-strategist` | Brief, angle, calendar | Drafting |
| `medical-research` | Evidence, memo, hedges | Drafting, opinions on voice |
| `seo` | Keywords, structure, meta | Medical claims |
| `writing` | Draft | Self-scoring, self-clearing |
| `editing` | Rubric A/C/D/E, clarity | Safety verdict |
| `medical-safety` | Rubric B, safety checklist, verdict | Rewriting |
| `publishing` | Final gate, format, export | Overriding a block |

A skill that scores its own work is not a gate. `writing` never clears itself.

## Parallelism

`medical-research` and `seo` can run at the same time — they don't depend on each other. Everything else is strictly sequential.

## Failure loops

If a piece bounces between `writing` and `editing` three times without reaching 85:

1. The brief is probably wrong, not the draft
2. Return to `chief-content-strategist` to re-brief
3. Don't keep patching

If a piece is blocked twice by `medical-safety` on the same issue, escalate to the user — there may be a genuine conflict between what's wanted and what's sayable.
