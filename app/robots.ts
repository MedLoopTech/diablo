import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Everything except the two public marketing pages requires a login and
// resolves to nothing crawlable anyway (middleware bounces anonymous
// requests to /login) — disallowing it explicitly keeps crawlers from
// wasting budget on redirect chains and stops /login itself, staff/patient
// app routes, and API routes from being indexed as thin or duplicate pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/professionals"],
      disallow: [
        "/login",
        "/onboard",
        "/auth",
        "/today",
        "/log",
        "/care",
        "/cohort",
        "/progress",
        "/resources",
        "/staff",
        "/demo",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
