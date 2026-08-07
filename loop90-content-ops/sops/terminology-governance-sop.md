# SOP — Terminology Governance

Referenced by `CONSTITUTION.md` §13. Owns the decision process for adding, changing, or retiring a controlled term, and keeps the content repo in sync with the Sehat/90 app.

---

## Why this exists

Terminology rules live in **three** places and can drift apart:

| Location | What it holds | Authority |
|----------|---------------|-----------|
| `CONSTITUTION.md` §13 | The governance table | Source of truth for content |
| `domains/*/banned-claims.md` | Per-domain patterns + channel rules | Derived from §13 |
| Sehat/90 `lib/announcements-shared.ts` | `BANNED_CLAIMS` regex array | Enforced in the running app |

The app's array is enforced at runtime on in-app announcements. The content repo's rules are broader — they cover marketing channels the app never touches. **The app list must always be a subset of the content list.**

---

## Roles

| Role | Owns |
|------|------|
| Super admin / founder | Final approval on any term change |
| `medical-safety` skill | Detection, enforcement, escalation |
| `chief-content-strategist` | Raises a request when a rule blocks legitimate work |

---

## Procedure — adding or changing a term

1. **Raise.** Write the proposed term, the reason, and the channels affected.
2. **Classify.** Absolute ban, context-dependent, or preferred-usage guidance?
3. **Check the medical claim.** If it implies an outcome, get the evidence level first. If no Level A/B evidence supports it, it's banned by default.
4. **Check the legal exposure.** "Guaranteed" and "reverse" are permitted only where a legal disclaimer sits on the same page. If there's no disclaimer, there's no exception.
5. **Approve.** Founder sign-off, recorded in the changelog below.
6. **Propagate — in this order:**
   - `CONSTITUTION.md` §13 table
   - `domains/*/banned-claims.md` (pattern + channel rule + regex block)
   - App `lib/announcements-shared.ts`, **only** if the term should block in-app announcements
   - `checklists/safety-checklist.md` scan list
7. **Verify.** Grep the repo for existing uses of the term and fix them. A new ban with legacy violations still in the repo is worse than no ban.

---

## Procedure — quarterly sync audit

Run every quarter, or after any app release that touches announcements.

1. Read the live `BANNED_CLAIMS` array from the app source — don't recall it.
2. Diff against the regex block in `banned-claims.md`.
3. Any term in the app but not in the content repo → add to the content repo.
4. Any term in the content repo marked "all channels" but absent from the app → decide whether the app should enforce it too.
5. Record the audit date and outcome in the changelog.

**Never** edit the app array to match the docs without checking whether the app change breaks existing announcements.

---

## Escalation — a rule blocks legitimate work

If a writer needs a banned term for accuracy (e.g. quoting a study that says "cure"):

1. Quoting an external source **with attribution** is allowed for `cure`/`cured` per §13 — use quotation marks and name the source
2. For anything else, route to the founder before drafting around it
3. Never silently paraphrase a medical claim to dodge a rule — that changes the claim

---

## The four decisions this SOP has already made

| Term | Rule | Rationale |
|------|------|-----------|
| **remission** | Preferred everywhere | Defined, measurable, defensible: HbA1c < 6.5% for 3+ months without glucose-lowering medication |
| **cure / cured** | Banned, except attributed quotes | T2D is not cured; the claim is medically false and creates legal exposure |
| **reverse / reversal** | B2C landing and ads only, with remission explained on the same page | Consumer-comprehensible, but imprecise — never acceptable in clinical or in-app contexts |
| **guaranteed** | B2C landing legal section only | Refers to the money-back term, never to a health outcome |

---

## Changelog

| Date | Change | Approved by |
|------|--------|-------------|
| 2026-08-07 | Initial governance table established (`CONSTITUTION.md` §13) | Founder |
| 2026-08-07 | Verified content repo regex matches app `BANNED_CLAIMS` — 5/5 identical | — |
