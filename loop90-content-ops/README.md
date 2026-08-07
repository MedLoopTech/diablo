# Loop/90 Content Operations

Enterprise-grade AI Content Operating System for Loop/90. Disease-agnostic at the framework layer; **diabetes remission** is the first content domain.

## What this is

Not a prompt collection — a full editorial department encoded as skills, SOPs, templates, rubrics, and workflows. Eleven Cursor/Claude skills chain together like a 20-person content team.

## Quick start

1. Read [`CONSTITUTION.md`](CONSTITUTION.md) — brand, medical philosophy, voice (single source of truth).
2. Pick a workflow from [`workflows/`](workflows/) (e.g. blog post pipeline).
3. Invoke the **CEO skill** (`.claude/skills/ceo/SKILL.md`) with your content request.
4. CEO routes through strategist → research → SEO → writing → editing → safety → publishing.

## Repository layout

| Folder | Purpose |
|--------|---------|
| `.claude/skills/` | 11 agent skills (8 core + 3 extensions) |
| `domains/` | Disease/vertical modules (diabetes-remission first) |
| `templates/` | Channel-specific output scaffolds |
| `prompts/` | Reusable prompt blocks |
| `playbooks/` | Stakeholder how-tos |
| `workflows/` | Multi-skill chains |
| `sops/` | Standard operating procedures |
| `research/` | Evidence levels, citation style, memo template |
| `checklists/` | Pre-publish, SEO, safety, Urdu quality |
| `rubrics/` | Scoring matrices (min 85/100 to publish medical content) |
| `examples/` | Gold exemplars and before/after edits |

## Adding a new disease domain

Framework skills stay unchanged. Add a new folder under `domains/`:

```
domains/hypertension/
├── README.md
├── medical-philosophy.md
├── topic-pillars.md
├── banned-claims.md
├── personas/
└── competitor-positioning.md
```

Skills reference `domains/<domain>/` via the content brief's `domain` field. No skill rewrites required.

## Sync with Sehat/90 app

See [`LINKS.md`](LINKS.md). App safety rules in the Sehat/90 repo (`CLAUDE.md`, `lib/ai/prompts.ts`) are authoritative for in-app AI. This repo's constitution must stay aligned.

## Skills index

| Skill | Role |
|-------|------|
| `ceo` | Orchestrates workflows, routes to specialists |
| `chief-content-strategist` | Briefs, calendar, repurposing maps |
| `medical-research` | Evidence, citations, claim verification |
| `seo` | Keywords, structure, meta |
| `writing` | First drafts per channel template |
| `editing` | Voice, clarity, reading level |
| `medical-safety` | Claim audit, disclaimers, rubric scoring |
| `publishing` | Final format, export, checklist |
| `urdu-localization` | Bilingual adaptation (not literal translation) |
| `repurposing-engine` | 1 article → 5 channel variants |
| `social-scripts` | Shorts/Reels/LinkedIn from long-form |

## License

Proprietary — Loop/90 Health Technologies. Internal use only.
