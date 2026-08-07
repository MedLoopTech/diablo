# Banned Claims & Terminology — Diabetes Remission

Synced with Sehat/90 `lib/announcements-shared.ts` and `CONSTITUTION.md` §10–13.

## Absolute bans (all channels)

| Pattern | Term | Use instead |
|---------|------|-------------|
| `/\bcures?\b/i` | cure | remission |
| `/\bcured\b/i` | cured | in remission |
| `/\bmiracle\b/i` | miracle | describe the actual service |
| `/\b100%\s*(effective\|success\|results?)\b/i` | 100% effective | many people improve significantly |

## Context-dependent bans

| Pattern | Term | Allowed where | Rule |
|---------|------|---------------|------|
| `/\bguarantee[ds]?\b/i` | guaranteed | B2C landing legal section only | Never in-app, announcements, blog, email body |
| `/\breverse[sd]?\b/i` | reverse/reversal | B2C landing, ads with remission context | Never in-app announcements, medical articles, doctor pitches |
| `/\bstop\s+(your\|taking\|the)\s+(medication\|metformin\|insulin)/i` | stop medication | Never | Route to doctor; content educates only |

## AI and medication bans (content + coach copy)

Never publish content that:
- Recommends specific drug doses
- Suggests starting, stopping, or switching medications without doctor
- Compares drug efficacy for patient decision-making
- Diagnoses conditions from symptoms described in content

**Safe framing:** "Your doctor may adjust your medication as your glucose improves — that's a conversation for your care pod doctor, not something to do on your own."

## Fear and shame bans

Never:
- "You're killing yourself with every roti"
- "Diabetes will destroy your family if you don't act now"
- Guilt for slips, missed logs, or weight plateaus
- Before/after photos implying guaranteed results

**Safe framing:** "One heavy meal doesn't undo your progress. Log tomorrow's breakfast and take a short walk after dinner."

## Hype bans

Never:
- "Doctors don't want you to know"
- "Secret remedy"
- "Big Pharma conspiracy"
- Celebrity endorsement without verified consent
- Testimonials with specific HbA1c numbers without "individual results vary" disclaimer

## Required disclaimers by channel

| Channel | Disclaimer required |
|---------|---------------------|
| Blog / guide | Full block at end |
| Landing page | Footer + near health claims |
| WhatsApp | Link to disclaimer page for medical claims |
| In-app announcement | Auto-validated — no banned terms |
| Short video | Verbal + on-screen text |
| Doctor pitch | "Clinical decisions remain yours" |

## Scan procedure (medical-safety skill)

1. Run all absolute-ban patterns against full text (title, body, CTAs, meta).
2. Check context-dependent terms against channel type in brief.
3. Verify medication boundary (no dosing, no stop/start advice).
4. Verify disclaimer present.
5. Flag any unsourced medical statistics.

## Regex reference (for automation)

```javascript
const BANNED_CLAIMS = [
  { pattern: /\bcures?\b/i, term: "cure", suggestion: 'say "remission" instead' },
  { pattern: /\bcured\b/i, term: "cured", suggestion: 'say "in remission" instead' },
  { pattern: /\bmiracle\b/i, term: "miracle", suggestion: "describe the actual service" },
  { pattern: /\bguarantee[ds]?\b/i, term: "guaranteed", suggestion: "outcomes can't be promised" },
  { pattern: /\b100%\s*(effective|success|results?)\b/i, term: "100% effective", suggestion: "outcomes can't be promised" },
];
```

In-app announcements use this exact list. Content repo adds marketing-context rules above.
