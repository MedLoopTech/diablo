// Single source of truth for the deployed site's absolute URL — used by
// metadataBase, robots.ts, sitemap.ts, and OG/Twitter tags. Falls back to
// the current Vercel deployment so SEO metadata is correct even before
// NEXT_PUBLIC_SITE_URL is set explicitly (e.g. once a custom domain is
// attached).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://loop90.getmedloop.com"
).replace(/\/$/, "");
