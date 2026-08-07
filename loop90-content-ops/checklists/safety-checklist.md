# Safety Checklist

Run by the `medical-safety` skill on every piece before it reaches `publishing`. Maps to rubric section B. **Any unchecked box blocks publication.**

---

## 1. Banned claims scan

- [ ] `/\bcures?\b/i` — no match
- [ ] `/\bcured\b/i` — no match
- [ ] `/\bmiracle\b/i` — no match
- [ ] `/\b100%\s*(effective|success|results?)\b/i` — no match
- [ ] `/\bguarantee[ds]?\b/i` — no match **unless** channel is B2C landing legal section
- [ ] `/\breverse[sd]?\b/i` — no match **unless** channel is B2C landing or ads, and remission is explained in the same piece
- [ ] `/\bstop\s+(your|taking|the)\s+(medication|metformin|insulin)/i` — no match, any channel

Scan the **full** text: title, headings, body, CTAs, meta description, alt text, image captions.

## 2. Medication boundary

- [ ] No specific drug doses
- [ ] No advice to start, stop, switch, or adjust any medication
- [ ] No drug-efficacy comparison aimed at patient decision-making
- [ ] No diagnosis from described symptoms
- [ ] Medication topics route to the doctor explicitly where they appear
- [ ] GLP-1 / drug-class detail appears only in pharma-persona content

## 3. Escalation thresholds

Where glucose numbers appear:

- [ ] ≥ 250 mg/dL → urgent, contact doctor immediately
- [ ] ≤ 70 mg/dL → urgent, contact doctor immediately
- [ ] ≥ 180 mg/dL → routine flag for doctor review
- [ ] Numbers match `CONSTITUTION.md` §14 exactly — no rounding, no paraphrase

## 4. Disclaimer

- [ ] Present, in the form required for this channel

| Channel | Requirement |
|---------|-------------|
| Blog / guide | Full block at end |
| Landing page | Footer + near health claims |
| WhatsApp | Link to disclaimer page for medical claims |
| In-app announcement | Auto-validated — no banned terms |
| Short video | Verbal + on-screen text |
| Doctor pitch | "Clinical decisions remain yours" |

- [ ] Standard block used verbatim or minimally adapted:

> Loop/90 supports your care team — it does not replace medical advice. Medication changes only ever come from your doctor. This content is for education, not diagnosis or treatment. If you feel unwell or your glucose is very high or very low, contact your doctor or emergency services.

## 5. AI labelling

- [ ] Where the AI coach is mentioned, "not a doctor" appears on first mention
- [ ] No implication that AI makes clinical decisions

## 6. Evidence integrity

- [ ] Every statistic traces to the research memo's numbers table
- [ ] Every medical claim has a citation
- [ ] Hedges preserved exactly as the memo set them
- [ ] Counter-evidence or limits acknowledged where material
- [ ] No named author used as a substitute for evidence

## 7. Tone safety

- [ ] No fear-mongering ("diabetes will destroy your family")
- [ ] No shame for slips, plateaus, or missed logs
- [ ] No guaranteed-outcome implication, including via testimonial
- [ ] Testimonials with specific numbers carry "individual results vary"
- [ ] No before/after imagery implying a typical result

## 8. Special populations

Where fasting, exercise intensity, or dietary restriction is discussed:

- [ ] Insulin / sulfonylurea caveat present
- [ ] Pregnancy caveat where relevant
- [ ] "Check with your doctor before starting" for any protocol change

---

## Verdict

```yaml
safety_check:
  banned_claims: pass
  medication_boundary: pass
  thresholds: pass | n/a
  disclaimer: pass
  ai_labelling: pass | n/a
  evidence: pass
  tone: pass
  special_populations: pass | n/a
  verdict: cleared | blocked
  blockers: []
```

A `blocked` verdict returns the piece to `writing` with the specific blocker — never to `publishing` with a warning.
