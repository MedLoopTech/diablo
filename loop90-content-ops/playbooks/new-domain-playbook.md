# Playbook — Adding a New Disease Domain

Hypertension, PCOS, fatty liver, CKD. **The framework skills don't change.** You add a domain module; everything else keeps working.

---

## What you build

```
domains/<new-domain>/
├── README.md
├── medical-philosophy.md
├── topic-pillars.md
├── banned-claims.md
├── competitor-positioning.md
└── personas/
    ├── README.md
    └── <persona>.md × N
```

Copy the structure from `domains/diabetes-remission/`. Six files plus personas.

---

## What you do NOT touch

| Stays unchanged | Why |
|-----------------|-----|
| All 11 skills | They read `domains/<domain>/` from the brief's `domain` field |
| `templates/` | Channels are domain-agnostic |
| `prompts/` | Voice and safety blocks are brand-level |
| `rubrics/` | Same quality bar |
| `checklists/` | Same gates |
| `research/evidence-levels.md` | Same evidence standard |
| `CONSTITUTION.md` | Brand-level, not disease-level |

If you find yourself editing a skill to support a new domain, the domain module is missing something.

---

## Order of work

### 1. `medical-philosophy.md`

The domain's clinical stance. What outcome are we pursuing, what's the evidence spine, what do we explicitly not claim?

For diabetes it's remission via DiRECT. For hypertension it might be sustained BP reduction — with a different definition, different thresholds, different medication boundary.

### 2. `banned-claims.md` — do this second, before any content

The terminology traps differ per domain:

| Domain | The trap |
|--------|----------|
| Diabetes | "Cure" and "reverse"; remission has a precise definition |
| Hypertension | "Normal BP" implying medication can stop |
| PCOS | "Fertility guaranteed" |
| Fatty liver | "Detox", "cleanse" |

Also set the **escalation thresholds** for this domain here — they're different numbers and they must match the app.

### 3. `personas/`

Some transfer with edits (the doctor persona is similar across domains). Some are new. Don't reuse a persona file that doesn't fit — a PCOS patient is not a T2D patient with the label changed.

### 4. `topic-pillars.md`

Ranked, tiered, with channel mapping and seasonal hooks.

### 5. `competitor-positioning.md`

Different reference set per domain. Same rules: admire don't copy, never name negatively.

### 6. `README.md`

Index the above.

---

## Cultural layer carries over

The desi-first principle isn't diabetes-specific. Whatever the domain:

- Pakistani food, habits, and constraints as the default frame
- Roman Urdu code-switching in patient content
- Warm greetings, no shame, hope over fear
- Never mock traditional remedies

---

## Safety sync

New domain, new thresholds. Before publishing anything:

1. Confirm the app's escalation logic for this condition
2. Mirror those exact numbers in `banned-claims.md` and the domain philosophy
3. Add any domain-specific terms to the app's `BANNED_CLAIMS` if they should block in-app
4. Record it in `sops/terminology-governance-sop.md`

**Never** publish domain content before the thresholds are confirmed against the app.

---

## First content

Run `workflows/blog-post-pipeline.md` with `domain: <new-domain>` in the brief. If a skill asks for something the domain module doesn't have, that's your gap list.

Your first piece is also a test of the module. Expect to fill gaps.

---

## The test that it's done

Someone unfamiliar with the domain should be able to brief, research, write, and clear a piece using only the module plus the framework — without asking you a question.
