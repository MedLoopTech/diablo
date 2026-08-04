import { safeHref, type Announcement } from "@/lib/announcements-shared";

/**
 * Cohort announcements on Today. Styled off the brand blue rather than
 * amber/red — those carry clinical meaning everywhere else in this app
 * (flagged and urgent readings), and a workshop notice must never read as a
 * health alert. The "From your care pod" eyebrow keeps the source unambiguous.
 */
export function AnnouncementCards({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) return null;

  return (
    <section aria-label="Announcements from your care pod" className="flex flex-col gap-3">
      {announcements.map((a) => {
        const href = safeHref(a.cta_url);
        return (
          <article key={a.id} className="rounded-card border border-sky bg-sky/50 p-4">
            <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-wide text-primary">
              From your care pod
            </p>
            <h3 className="font-display text-[15px] font-semibold text-ink">{a.title}</h3>
            {a.body && (
              <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-soft">{a.body}</p>
            )}
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-block font-body text-[13px] font-semibold text-primary hover:underline"
              >
                {a.cta_label?.trim() || "Learn more"} →
              </a>
            )}
          </article>
        );
      })}
    </section>
  );
}
