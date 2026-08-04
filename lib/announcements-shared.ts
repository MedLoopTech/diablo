/**
 * Types and validators safe to import from client components (no server-only
 * Supabase client pulled into the browser bundle — same split as
 * lib/care.ts vs the server actions that call it).
 */

export type Announcement = {
  id: string;
  cohort_id: string;
  title: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  starts_on: string | null;
  ends_on: string | null;
  published: boolean;
};

/**
 * CLAUDE.md safety rule 4: "remission" in all user-facing copy, never "cure".
 * A free-text announcement box aimed at patients is exactly where that slips
 * in, so the rule is enforced in code rather than left to whoever is typing.
 * Same reasoning covers the other absolute-outcome claims — a pod advertising
 * a guaranteed result to diabetes patients is a regulatory problem, not just
 * an off-brand word choice.
 */
const BANNED_CLAIMS: { pattern: RegExp; term: string; suggestion: string }[] = [
  { pattern: /\bcures?\b/i, term: "cure", suggestion: 'say "remission" instead' },
  { pattern: /\bcured\b/i, term: "cured", suggestion: 'say "in remission" instead' },
  { pattern: /\bmiracle\b/i, term: "miracle", suggestion: "describe the actual service" },
  { pattern: /\bguarantee[ds]?\b/i, term: "guaranteed", suggestion: "outcomes can't be promised" },
  { pattern: /\b100%\s*(effective|success|results?)\b/i, term: "100% effective", suggestion: "outcomes can't be promised" },
];

/** Returns a human-readable problem, or null when the copy is acceptable. */
export function checkAnnouncementCopy(...texts: (string | null | undefined)[]): string | null {
  const joined = texts.filter(Boolean).join(" ");
  for (const { pattern, term, suggestion } of BANNED_CLAIMS) {
    if (pattern.test(joined)) {
      return `Announcements can't claim "${term}" — ${suggestion}.`;
    }
  }
  return null;
}

/**
 * Staff-supplied URLs end up in an href shown to every patient in the
 * cohort. Anything but http/https (notably `javascript:`) is a stored-XSS
 * vector, so unknown schemes are dropped rather than rendered.
 */
export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? trimmed : null;
  } catch {
    // Bare domains ("sehat90.app/workshop") are a realistic thing to type —
    // accept them by assuming https, but only when they look like a hostname.
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(trimmed)) return `https://${trimmed}`;
    return null;
  }
}

/** True when today falls inside the announcement's optional start/end window. */
export function isLive(a: Pick<Announcement, "published" | "starts_on" | "ends_on">): boolean {
  if (!a.published) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (a.starts_on && a.starts_on > today) return false;
  if (a.ends_on && a.ends_on < today) return false;
  return true;
}
