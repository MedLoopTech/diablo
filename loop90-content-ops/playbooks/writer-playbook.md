# Playbook — Writer

For a human writing inside this system, or reviewing what the `writing` skill produced.

---

## Before you write a word

You need three things. Missing any one means stop:

| Need | Where |
|------|-------|
| Brief | `chief-content-strategist` output |
| Channel template | `templates/<channel>.md` |
| Research memo | `medical-research` output — **required** if `medical_content: true` |

Writing without a memo means writing from memory. That's the single most common way an unsourced claim ships.

---

## The rule that trips everyone

**Every number must be in the research memo's numbers table, with the exact wording approved there.**

Not "roughly the number I remember". Not a rounded version. Not a figure from a general GI table you've seen before.

If the memo has no entry, write directionally — "gentler than", "slower than", "many people" — or leave it out and flag it in `wanted_but_unsupported`.

---

## Write to one takeaway

The brief's `single_takeaway` is the destination. Test each paragraph: does it move toward that sentence? If not, cut it.

If you finish and the takeaway isn't obvious, the structure is wrong. Don't add a summary paragraph to compensate.

---

## Voice, in five rules

1. **Hope over fear.** Never scare, never shame.
2. **Action over theory.** One thing to do today.
3. **Two sentences of mechanism, then what it means.** Not a lecture.
4. **Desi kitchen first.** Roti, chawal, daal, biryani, chai. Never quinoa by default.
5. **Second person, present tense, short sentences.**

The tone test: read it as a 52-year-old in Karachi, diagnosed six years ago, told to "avoid sugar" at every appointment since. Does this feel like a plan, or another lecture?

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Opening with "In today's fast-paced world" | Open with the reader's own observation |
| Three paragraphs of mechanism | Two or three sentences |
| "Eat more fibre" as the action | "Add kachumber to tonight's rice" |
| A number that felt right | Check the memo |
| "Studies prove" on Level B evidence | "Studies suggest" |
| Fixing a claim by softening it until defensible | That changes the claim — flag it instead |
| Western food examples | Desi, always |
| Guilt for a missed log | "Koi baat nahi. Aaj se dobara shuru." |

---

## When the topic touches medication

Route, warmly:

> As your numbers improve, your doctor may adjust your medication. That's their call, made with your full history in front of them — never something to change on your own.

Never: a dose, a timeline, "many patients come off", or "you may be able to reduce".

---

## Use `wanted_but_unsupported` honestly

This field tells the strategist what the next research brief should cover. If you wanted a statistic and the memo forbade it, say so. That's how the evidence base grows.

Hiding it just means the next writer hits the same wall.

---

## What happens after you hand off

`editing` scores you on evidence, voice, clarity, and actionability. `medical-safety` scores safety and issues the verdict.

You don't score yourself, and you don't clear yourself. If you find yourself thinking "safety will probably let this through" — that's the moment to rewrite it.
