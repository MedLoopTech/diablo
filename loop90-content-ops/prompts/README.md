# Prompt Blocks

Reusable fragments the skills compose into their working prompts. Edit here once; every skill picks it up.

| File | Used by |
|------|---------|
| [context-loader.md](context-loader.md) | All skills — what to read before starting |
| [brand-voice-block.md](brand-voice-block.md) | `writing`, `editing`, `repurposing-engine`, `social-scripts` |
| [safety-block.md](safety-block.md) | `writing`, `medical-safety`, `urdu-localization` |
| [evidence-block.md](evidence-block.md) | `medical-research`, `writing`, `editing` |
| [content-brief.md](content-brief.md) | `chief-content-strategist` output; input to everything downstream |

## Composition order

```
context-loader
  + brand-voice-block
  + safety-block
  + evidence-block   (medical content only)
  + channel template
  + persona file
  + research memo
= the writing prompt
```
