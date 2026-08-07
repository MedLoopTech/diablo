# Writing — Examples

## Example 1 — Excerpt from a worked draft

Brief `2026-08-blog-roti-glycemic-load`, patient persona, blog channel, memo attached.

---

**Why daal chawal is gentler than plain rice**

You've probably noticed it yourself. Biryani sends your number up. Daal chawal, somehow, doesn't do it the same way. Same rice. Different meal. Different result.

Here's what's actually happening.

Glycaemic index tells you how fast a food raises your sugar when it's eaten alone. Glycaemic load adds the part that matters more day to day — how much of it you actually ate. But in a real meal, a third thing matters just as much: what's sitting next to it.

Protein, fat, and fibre all slow down how quickly your stomach empties. When rice arrives in your system gradually instead of all at once, the rise is gentler. Daal brings protein and fibre. Kachumber brings more fibre and water. The rice hasn't changed at all — the meal has.

Biryani is the other direction. The portion is usually larger, the rice is refined, and while the fat does slow the peak, the total load is higher. It's not that biryani is forbidden. It's that biryani is a bigger ask of your body than the same rice served with daal and salad.

### The one change to make tonight

Add kachumber to your rice. That's it — sliced onion, tomato, cucumber, a squeeze of lemon.

You don't need to measure anything or swap your rice for something else. Just don't let the rice sit on the plate alone.

### When to talk to your doctor

If your post-meal readings are regularly above 180 mg/dL, bring that pattern to your pod doctor at your next review — a few readings tell a story that one reading can't. If you ever see a reading above 250 or below 70, contact your doctor immediately.

---

```yaml
draft_notes:
  flagged_for_editing:
    - "Para 3 (GI vs GL) may sit at grade 9-10 — check Flesch"
    - "Biryani paragraph does two jobs (portion + refinement); may want splitting"
  wanted_but_unsupported:
    - >
      Wanted to give approximate GL numbers for roti vs rice vs biryani.
      Memo explicitly forbids: no validated Pakistani GI database, and
      Indian values don't transfer across preparation methods. Kept
      directional. Worth a future research brief if a local dataset exists.
  template_deviations: []
status: drafted
```

**Why this passes:** no numbers outside the memo, mechanism in three sentences, one action, thresholds exact, desi throughout, no guilt, medication untouched.

---

## Example 2 — Refusing to draft

**Input:** "Draft the metformin weight-loss blog post. Memo isn't ready yet, just use what you know."

```yaml
status: refused
reason: >
  medical_content: true with no research memo. Every claim in a piece
  like this — what metformin does, what weight loss does, how they
  interact — needs a sourced, levelled statement with approved wording.
  Drafting "from what I know" means drafting from training data, which
  is exactly the unsourced-claim failure the memo exists to prevent.

  It would also fail rubric A1 and A3 at editing, so the cycle is wasted.
returned_to: ceo
next: medical-research
```

---

## Example 3 — WhatsApp draft (different register, same rules)

Brief: patient, WhatsApp, Pillar 2, nurture stage, derived from the roti anchor.

```
*Chawal ke saath ek cheez add karein.*

Plain chawal akela sugar tezi se barhata hai. Lekin saath mein daal,
sabzi ya kachumber ho — to woh rise halka ho jata hai.

Chawal wahi hai. Plate badal gayi.

Aaj lunch mein kachumber try karein — pyaz, tamatar, kheera, lemon.

Yeh general guidance hai, medical advice nahi: loop90.com/disclaimer
```

```yaml
draft_notes:
  flagged_for_editing:
    - "Code-switching density — check it reads natural, not performed"
  wanted_but_unsupported: []
  template_deviations: []
status: drafted
```

**Note:** same takeaway as the blog, same evidence boundary, entirely different register. The disclaimer is a link (WhatsApp rule), not a block.
