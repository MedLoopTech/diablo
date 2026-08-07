# Publishing — Examples

## Example 1 — Ship

```yaml
pre_publish:
  rubric: 94/100
  safety: cleared
  brief_fidelity: pass
  channel_checks: pass
  facts_verified: pass
  facts_checked:
    - fact: "cohort size 30-50"
      source: "stable — CONSTITUTION"
      status: ok
    - fact: "care pod composition"
      source: "stable — CONSTITUTION"
      status: ok
    - fact: "escalation thresholds 180/250/70"
      source: "stable — CONSTITUTION §14"
      status: ok
    - note: "No pricing, currency, or referral figures in this piece"
  verdict: ship

deliverable:
  frontmatter: complete
  slug: /rice-blood-sugar-pairing
  meta_description: 148 chars
  internal_links: 2 outbound
  alt_text: 3 images, all captioned
  disclaimer: full block, end of article

archive:
  brief: 2026-08-blog-roti-glycemic-load
  memo: attached
  sources:
    - "PMID 24787496 — abstract saved, accessed 2026-08-07"
    - "PMID 26590418 — abstract saved, accessed 2026-08-07"
    - "ADA Standards of Care — current year, saved"

gold_candidate: false      # 94, threshold is 95
status: published
```

---

## Example 2 — Hold on unverifiable facts

```yaml
pre_publish:
  rubric: 91/100
  safety: cleared
  brief_fidelity: pass
  channel_checks: pass
  facts_verified: FAIL
  verdict: hold

facts_checked:
  - fact: "PKR 4,500/month for 1 doctor + 50 patients"
    source: "PITCHES.md"
    status: STALE_RISK
    note: >
      PITCHES.md is a document, not the live config. Pricing may have
      changed since it was written. Cannot verify from here.

  - fact: "Referral partners earn PKR 2,000 per enrolled patient"
    source: recalled
    status: UNVERIFIABLE
    note: >
      Referral payouts are per-code and admin-configurable — cash codes
      can carry their own amount that overrides the platform default.
      There is no single universal figure. This sentence is wrong by
      construction, not just possibly out of date.

  - fact: "amounts shown in PKR"
    status: UNVERIFIABLE
    note: >
      Platform currency is admin-configurable. Hardcoding PKR in
      marketing copy breaks if it's changed.

action_required: >
  Two options:
  (a) User confirms current pricing and currency, and I remove the
      referral figure entirely (it cannot be stated as one number)
  (b) Cut all three sentences and publish without figures — the piece
      works without them; the pricing block can link to a live page

status: held
returned_to: user
```

**Why this matters:** the piece was cleared on safety and scored 91. It would have shipped a number that is *structurally* wrong — not out of date, but wrong in principle, because referral payouts vary per code. Recall would never have caught that.

---

## Example 3 — Refusing to override a block

**Input:** "Safety blocked it on the 'reverse' thing but the campaign launches tomorrow. Ship it."

```yaml
verdict: refused
reason: >
  A blocked verdict cannot be overridden at this stage, by me or by
  schedule pressure. There is no "publish with a warning" state.

  The specific blocker is fixable in about ten minutes: "reverse" is
  permitted on this channel (B2C landing) as long as remission is
  defined on the same page. Adding the definition clears it properly.

path_to_ship:
  - writing: add the remission definition near the H1
  - medical-safety: re-verify all four conditions
  - publishing: re-run pre-publish
estimated: same day

escalation: >
  If the launch genuinely cannot wait for that, the decision to publish
  non-compliant medical marketing is the founder's to make explicitly —
  not mine to make silently. Ask them.

status: refused
```

---

## Example 4 — Gold candidate

```yaml
pre_publish:
  rubric: 96/100
  safety: cleared
  verdict: ship

gold_candidate: true
gold_notes: >
  Strong on C2 (desi specificity — every example is a real dish with a
  real preparation) and E1 (the action is a single ingredient, not a
  behaviour change). The counter-evidence section is a good model:
  it caveats honestly without undermining the takeaway.

  Flagged for annotation into examples/gold/ — do not self-promote.

status: published
```
