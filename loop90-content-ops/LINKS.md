# Links to Sehat/90 App Repository

This content-ops repo connects to the Sehat/90 application codebase. Keep these in sync.

## App repo location

```
../   (sehat90-claude-code-handoff_1 — parent directory when cloned alongside)
```

If repos are cloned separately, set `SEHAT90_APP_ROOT` to the app path when invoking skills.

## Authoritative sources (app repo)

| Asset | Path (relative to app root) | What to sync |
|-------|----------------------------|--------------|
| Product definition | `CLAUDE.md` | Safety rules, roles, conventions |
| AI coach prompts | `lib/ai/prompts.ts` | Coaching philosophy, SAFETY_RULES |
| Banned claims | `lib/announcements-shared.ts` | Regex patterns for patient announcements |
| Product copy | `messages/en.json`, `messages/ur.json` | Approved UI strings |
| Pitches | `products/pitches/PITCHES.md` | Audience hooks, objections |
| Design tokens | `design-reference/sehat-90-prototype.jsx` | Colors, fonts for landing content |
| Content Resources | `products/Content Resources/` | Gold HTML exemplars |

## Gold example files (Content Resources)

| File | Use as exemplar for |
|------|---------------------|
| `loop90_enhanced.html` | Patient B2C landing page |
| `loop90_professionals.html` | B2B care network recruitment |
| `desi_diabetes_plate_guide_bilingual.html` | Lead magnet / educational guide |
| `PITCHES.md` (in `products/pitches/`) | Doctor, patient, pharma pitch copy |

Annotated copies live in [`examples/gold/`](examples/gold/).

## Sync policy

1. **Safety rules**: When `CLAUDE.md` or `lib/ai/prompts.ts` SAFETY_RULES change, update `CONSTITUTION.md` § Medical Safety and `domains/diabetes-remission/banned-claims.md`.
2. **Banned claims**: When `lib/announcements-shared.ts` BANNED_CLAIMS changes, mirror patterns in `domains/diabetes-remission/banned-claims.md`.
3. **Product copy**: When `messages/en.json` tagline or disclaimer changes, update `CONSTITUTION.md` § Brand Identity.
4. **Frequency**: Review sync on every app release that touches AI prompts or patient-facing copy.

## Optional CI (future)

Hash `SAFETY_RULES` from `lib/ai/prompts.ts` and compare to `CONSTITUTION.md` safety section hash. Fail build if diverged.

## Contacts

- Content: hello@loop90.pk
- Partnerships: partners@loop90.pk
- WhatsApp: +92 345 2739406
