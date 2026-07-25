# Sehat/90 — Claude Code handoff bundle

## What's in here
- `CLAUDE.md` — project memory. Claude Code reads this automatically every session.
- `SPEC.md` — full data model, AI triage design, screens, safety rules.
- `ROADMAP.md` — phased build order with acceptance checklists.
- `design-reference/sehat-90-prototype.jsx` — the approved clickable prototype.
  Source of truth for palette, typography, components, and copy voice.

## How to start
1. Create an empty project folder and copy these four items into its root.
2. Create a Supabase project (supabase.com) — grab the URL + anon key + service key.
3. Get an Anthropic API key (console.anthropic.com).
4. Open the folder in Claude Code and paste the kickoff prompt below.

## Kickoff prompt (paste into Claude Code)

Read CLAUDE.md, SPEC.md, and ROADMAP.md fully, and skim
design-reference/sehat-90-prototype.jsx to absorb the design system.
Then execute Phase 0 of ROADMAP.md. Ask me for the Supabase and Anthropic
env values when you need them. After Phase 0 passes its checklist, stop
and show me the running app before starting Phase 1.

## Suggested per-phase prompts after that
- "Phase 0 approved. Build Phase 1. Port the glucose dial SVG from the prototype
  exactly — same arc geometry and colors."
- "Build Phase 2. Write the triage tests first, then the implementation."
- "Build Phase 3. Prove the RLS: show me a failing request when a nutritionist
  tries to edit a medication plan."

## Tips
- Keep phases in separate git branches/commits so you can review each one.
- Run `npm run build` before accepting any phase as done.
- If Claude Code proposes swapping the stack (e.g., Firebase), say no — the
  stack in CLAUDE.md is decided.
