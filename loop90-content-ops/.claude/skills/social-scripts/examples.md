# Social Scripts — Examples

## Example 1 — Short video, derived

```yaml
format: short-video
source: 2026-08-blog-roti-glycemic-load (published)
persona: patient
takeaway: "Pairing your rice changes the curve — the rice itself doesn't have to."
hook: "Two plates. Same rice."

beats:
  - time: "0:00-0:03"
    on_screen: "Same rice. Two plates."
    voice: "Do plate. Chawal wahi hai."
    broll: "Two thalis side by side — one plain rice, one rice + daal + kachumber"

  - time: "0:03-0:15"
    on_screen: "One is just rice"
    voice: "Ek mein sirf chawal hai. Doosre mein daal aur kachumber bhi."
    broll: "Slow pan across both plates"

  - time: "0:15-0:40"
    on_screen: "Protein + fibre = slower rise"
    voice: >
      Doosri plate sugar ko zyada halke se barhati hai. Chawal nahi
      badla — plate badli. Protein aur fibre sab kuch dheema kar dete hain.
    broll: "Hand adding kachumber to the rice plate"

  - time: "0:40-0:52"
    on_screen: "Tonight: don't let rice sit alone"
    voice: "Aaj raat chawal ke saath kachumber zaroor rakhein."
    broll: "Finished plate, close up"

  - time: "0:52-1:00"
    on_screen: "General information, not medical advice. Talk to your doctor."
    voice: "Yeh general information hai — medical advice nahi. Apne doctor se zaroor baat karein."
    broll: "Loop/90 mark"

caption: >
  Chawal chhorne ki zaroorat nahi. Sirf plate badlein. 🍽️

  Daal, sabzi ya kachumber saath ho to sugar ka rise halka hota hai.
  Chawal wahi rehta hai — meal badal jati hai.

  Aaj try karein aur batayein kaisa laga.

  General information, not medical advice — talk to your doctor.

hashtags: ["#sugarcontrol", "#diabetespakistan", "#desidiet", "#loop90", "#healthyeating"]

new_claims: []
requires_safety_review: true
status: scripted
```

**Note:** on-screen disclaimer in English (screenshots get shared), spoken in Urdu (matches the voiceover). 8 seconds budgeted before writing.

---

## Example 2 — Format refused

```yaml
request: "60-second Reel explaining what remission means"
status: refused
format_fit_test:
  one_idea: yes
  visual_hook: weak
  honest_version_fits: NO

reason: >
  The honest version needs four things: the definition (HbA1c under
  6.5%, three months, no glucose-lowering medication), the not-a-cure
  caveat, the impermanence caveat, and the disclaimer. That's roughly
  55 seconds of a 60-second budget with no hook and no room to breathe.

  Every version that fits drops a caveat. Whichever caveat gets dropped,
  the piece drifts toward "you can beat diabetes" — which is exactly
  what remission content exists to prevent.

alternative: >
  Carousel, 7 slides — each caveat gets its own slide with room to
  land. That's a brief, not a derivation, because the structure is
  entirely different from the article.

  Or: a Reel on ONE piece of it — "Remission isn't a cure. Here's the
  difference." Single idea, fits the budget, honest.

routed_to: chief-content-strategist
```

---

## Example 3 — LinkedIn, doctor persona

```yaml
format: linkedin
source: standalone brief
persona: doctor
takeaway: "The monitoring gap between visits is where deterioration hides."

hook: >
  Your diabetic patients are seen every 3–6 months.
  A lot goes wrong in three months.

post: |
  Your diabetic patients are seen every 3–6 months.
  A lot goes wrong in three months.

  The ones who are deteriorating rarely call. They wait until it's bad
  enough to justify a visit. And when they arrive, there's no glucose
  history — just what they remember.

  Medication changes happen verbally. Nothing is logged. If something
  goes wrong later, there's no trail.

  Loop/90 closes that gap: patients log from their phone, you see the
  trend flagged by severity, and every medication change carries a
  timestamp and an author.

  The AI layer handles routine lifestyle questions. Anything clinical —
  medication, symptoms, pregnancy — routes to you with context attached.
  It never touches medication.

  Clinical decisions remain yours.

  30-day trial. We onboard your first 10 patients on the call.

disclaimer: "Clinical decisions remain yours."   # inline, per doctor channel rule
hashtags: ["#diabetescare", "#digitalhealth", "#pakistanhealthcare"]

new_claims: []
notes: >
  No pricing stated — it changes and would need verification at
  publishing. The trial offer is stable and stated.
requires_safety_review: true
status: scripted
```

---

## Example 4 — Carousel

```yaml
format: carousel
source: 2026-08-blog-roti-glycemic-load (published)
persona: prediabetic-family
takeaway: "Six pairings that flatten the curve, using food you already cook."

slides:
  - n: 1
    text: "Same rice. Different number."
    visual: "Two thalis, split frame"
    note: "Must work as a thumbnail"
  - n: 2
    text: "It's not the grain. It's what's next to it."
    visual: "Close-up, plain rice"
  - n: 3
    text: "Rice alone → fast rise"
    visual: "Plain rice plate"
  - n: 4
    text: "Rice + daal → protein slows it"
    visual: "Rice with daal"
  - n: 5
    text: "Rice + daal + kachumber → fibre slows it more"
    visual: "Full thali"
  - n: 6
    text: "Try tonight: add kachumber. That's it."
    visual: "Kachumber bowl"
  - n: 7
    text: "General information, not medical advice. Talk to your doctor."
    visual: "Loop/90 mark"

caption: >
  You've probably noticed biryani hits differently than daal chawal.
  Here's why — and it isn't about giving up rice.

  Protein and fibre slow down how fast your stomach empties. Same rice,
  arriving more gradually, gentler rise.

  Tonight: don't let the rice sit alone on the plate.

  Full explainer linked in bio.

  General information, not medical advice — talk to your doctor.

new_claims: []
requires_safety_review: true
status: scripted
notes: >
  No GI/GL figures on any slide — memo forbids. Slides 3-5 use
  directional language only, which also reads better at a glance.
```
