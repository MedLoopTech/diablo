# Medical Safety — Examples

## Example 1 — Cleared

The roti piece, post-editing.

```yaml
safety_check:
  banned_claims: pass          # scanned title, H2s, body, CTA, meta, alt text
  medication_boundary: pass    # topic doesn't touch medication
  thresholds: pass             # "above 180", "above 250 or below 70" — exact
  disclaimer: pass             # full block at end, blog channel
  ai_labelling: n/a            # AI not mentioned
  evidence: pass               # directional only, no numbers, memo honoured
  tone: pass
  special_populations: n/a     # no fasting, no protocol change

b_score: 25/25
final_score: 94/100            # editing 69/75 + B 25/25
verdict: cleared
blockers: []
status: cleared

notes: >
  Counter-evidence section is genuine, not decorative — it names the
  individual-variation finding, which is the honest caveat here.
  Score ≥ 95 would make this a gold-example candidate; it's at 94.
```

---

## Example 2 — Blocked on a conditional term

Landing page draft.

```yaml
safety_check:
  banned_claims: FAIL
  medication_boundary: pass
  thresholds: n/a
  disclaimer: pass
  evidence: pass
  tone: pass

b_score: 17/25
final_score: 84/100
verdict: blocked

blockers:
  - term: "reverse"
    location: "H1 — 'Reverse Your Diabetes in 90 Days'"
    decision_tree:
      in_brief_exceptions: yes
      channel_permits: yes          # B2C landing
      remission_defined_on_page: NO # ← fails here
      legal_block_present: yes
    ruling: >
      Three of four conditions met. Remission is never defined anywhere
      on the page, so "reverse" stands alone as an outcome claim.
      Add the remission definition, or change the H1.

  - term: "guaranteed"
    location: "Hero subhead — 'guaranteed results or your money back'"
    ruling: >
      Ambiguous by construction. "Guaranteed results" reads as a health
      outcome promise; the money-back clause doesn't rescue it because
      the word attaches to "results", not to the refund. Rewrite as
      "30-day money-back guarantee" so the guarantee attaches to the
      refund only.

returned_to: writing
status: blocked
```

---

## Example 3 — Blocked on an implied medication outcome

```yaml
safety_check:
  banned_claims: pass          # no regex hit
  medication_boundary: FAIL
  thresholds: pass
  disclaimer: pass
  evidence: FAIL
  tone: pass

b_score: 12/25
final_score: 78/100
verdict: blocked

blockers:
  - location: "Section 3, para 2"
    text: "Many of our members reduce or stop their metformin by week 10."
    ruling: >
      Two separate blocks in one sentence.

      (1) Medication boundary: presents medication reduction as a
      program outcome with a timeline. Even without instructing the
      reader, it sets an expectation they may act on. CONSTITUTION §14.1.

      (2) Evidence: this is an unpublished Loop/90 outcome claim. No
      data supports "many" or "week 10". Not in the research memo.

    alternative: >
      "As your numbers improve, your doctor reviews your medication.
      That decision is always theirs, made with your full history."

      Says the true thing, sets no expectation, instructs nothing.

returned_to: writing
status: blocked
notes: >
  Regex scan passed cleanly — this needed judgement, not pattern
  matching. Worth noting for the checklist: "reduce or stop their
  [drug]" is a phrasing to watch.
```

---

## Example 4 — Escalated rather than blocked

```yaml
verdict: escalate
issue: >
  Doctor-facing LinkedIn post quotes a published paper whose title
  contains the word "cure". CONSTITUTION §13 permits "cure" in
  attributed quotes from external sources, but banned-claims.md's
  absolute-ban table doesn't carry that exception, and the regex
  can't distinguish a quote from a claim.

recommendation: >
  Allow, with the title in quotation marks and the source named
  inline — the §13 exception is explicit and this is exactly the
  case it exists for.

action_required: >
  banned-claims.md should carry the attributed-quote exception that
  §13 already grants, so the two documents agree. Route through
  sops/terminology-governance-sop.md.

status: escalated_to_user
```

**Why escalate, not block:** the constitution already permits this; the derived document is incomplete. Blocking would enforce a rule that doesn't exist.
