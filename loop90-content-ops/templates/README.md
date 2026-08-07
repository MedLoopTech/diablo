# Channel Templates

Output scaffolds for the `writing` skill. Each template sets structure, length, required elements, and the disclaimer form for that channel.

Ranked by `CONSTITUTION.md` §7 channel priority.

| ★ | Template | Channel |
|---|----------|---------|
| ★★★★★ | [whatsapp.md](whatsapp.md) | WhatsApp templates, nudges, lead capture |
| ★★★★★ | [landing-page.md](landing-page.md) | Landing pages / website |
| ★★★★★ | [in-app.md](in-app.md) | Learn tab, announcements, coach copy |
| ★★★★★ | [email.md](email.md) | Weekly digest, onboarding sequences |
| ★★★★ | [linkedin.md](linkedin.md) | Professional / B2B recruitment |
| ★★★★ | [short-video.md](short-video.md) | Reels / Shorts scripts |
| ★★★★ | [blog-seo.md](blog-seo.md) | Blog / SEO articles |
| ★★★ | [instagram.md](instagram.md) | Instagram posts and carousels |
| — | [lead-magnet.md](lead-magnet.md) | Downloadable guides (the Desi Plate Guide) |

## Using a template

```yaml
channel: whatsapp
persona: patient
domain: diabetes-remission
pillar: 2            # from topic-pillars.md
funnel_stage: nurture
```

`writing` loads the template + the persona file + the research memo, then drafts. Every template's **Required elements** section maps to rubric criteria — skipping one costs points at `editing`.

## Universal rules (all channels)

- Desi food examples, never Western defaults
- One practical takeaway
- Disclaimer per this channel's rule
- Banned-claims clean for this channel
- Reading level per persona
