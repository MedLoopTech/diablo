"use client";

import { useState, useTransition } from "react";
import {
  checkAnnouncementCopy,
  safeHref,
  type Announcement,
} from "@/lib/announcements-shared";
import {
  createAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
} from "./actions";

type Status = { label: string; className: string };

/** Published alone doesn't mean visible — the date window decides. */
function statusOf(a: Announcement): Status {
  if (!a.published) {
    return { label: "Hidden", className: "border border-line bg-paper text-ink-soft" };
  }
  const today = new Date().toISOString().slice(0, 10);
  if (a.starts_on && a.starts_on > today) {
    return { label: "Scheduled", className: "bg-sky text-primary" };
  }
  if (a.ends_on && a.ends_on < today) {
    return { label: "Ended", className: "border border-line bg-paper text-ink-soft" };
  }
  return { label: "Live", className: "bg-mint text-primary-deep" };
}

function windowLabel(a: Announcement): string | null {
  if (!a.starts_on && !a.ends_on) return null;
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  if (a.starts_on && a.ends_on) return `${fmt(a.starts_on)} – ${fmt(a.ends_on)}`;
  if (a.starts_on) return `From ${fmt(a.starts_on)}`;
  return `Until ${fmt(a.ends_on!)}`;
}

export function AnnouncementEditor({
  cohortId,
  announcements,
}: {
  cohortId: string;
  announcements: Announcement[];
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  // Same rule the server action enforces — shown as you type so the wording
  // can be fixed before submitting rather than bouncing back as an error.
  const claimWarning = checkAnnouncementCopy(title, body, ctaLabel);
  const previewHref = safeHref(ctaUrl);
  const hasPreview = title.trim().length > 0;

  const reset = () => {
    setTitle("");
    setBody("");
    setCtaLabel("");
    setCtaUrl("");
    setStartsOn("");
    setEndsOn("");
  };

  const add = () =>
    start(async () => {
      setError("");
      try {
        await createAnnouncement({
          cohortId,
          title: title.trim(),
          body: body.trim() || null,
          ctaLabel: ctaLabel.trim() || null,
          ctaUrl: ctaUrl.trim() || null,
          startsOn: startsOn || null,
          endsOn: endsOn || null,
        });
        reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save. Please try again.");
      }
    });

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-card border border-line bg-card p-5">
        <h2 className="mb-1 font-body text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
          New announcement
        </h2>
        <p className="mb-4 font-body text-[13px] text-ink-soft">
          A workshop, a group walk, a schedule change, a challenge kickoff — anything you&apos;d
          otherwise post in the cohort&apos;s WhatsApp group.
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-[11px] uppercase tracking-wide text-ink-soft">
              Headline
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="e.g. Group walk this Saturday, 7am at F-9 Park"
              className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-body text-[11px] uppercase tracking-wide text-ink-soft">
              Details (optional)
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Where, when, who it's for, how to join."
              className="resize-none rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-primary"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="font-body text-[11px] uppercase tracking-wide text-ink-soft">
                Button text (optional)
              </span>
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                maxLength={30}
                placeholder="RSVP"
                className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-[11px] uppercase tracking-wide text-ink-soft">
                Link (optional)
              </span>
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://…"
                className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="font-body text-[11px] uppercase tracking-wide text-ink-soft">
                Show from (optional)
              </span>
              <input
                type="date"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
                className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-[11px] uppercase tracking-wide text-ink-soft">
                Hide after (optional)
              </span>
              <input
                type="date"
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
                className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-primary"
              />
            </label>
          </div>

          {ctaUrl.trim() && !previewHref && (
            <p className="font-body text-[13px] text-amber">
              That link doesn&apos;t look like a web address — patients won&apos;t see a button
              unless it starts with http:// or https://
            </p>
          )}
          {claimWarning && <p className="font-body text-[13px] text-red">{claimWarning}</p>}
          {error && <p className="font-body text-[13px] text-red">{error}</p>}

          <button
            onClick={add}
            disabled={pending || !title.trim() || Boolean(claimWarning)}
            className="self-start rounded-lg bg-primary px-4 py-2 font-body text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save as hidden"}
          </button>
          <p className="font-body text-[11px] text-ink-soft">
            Saved hidden so you can check it first — publish it from the list below.
          </p>
        </div>
      </section>

      {hasPreview && (
        <section className="rounded-card border border-line bg-card p-5">
          <h2 className="mb-3 font-body text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
            How patients will see it
          </h2>
          <div className="rounded-card border border-sky bg-sky/50 p-4">
            <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-wide text-primary">
              From your care pod
            </p>
            <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
            {body.trim() && (
              <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
            )}
            {previewHref && (
              <span className="mt-3 inline-block font-body text-[13px] font-semibold text-primary">
                {ctaLabel.trim() || "Learn more"} →
              </span>
            )}
          </div>
        </section>
      )}

      <section className="rounded-card border border-line bg-card p-5">
        <h2 className="mb-3 font-body text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
          Your announcements{announcements.length > 0 && ` · ${announcements.length}`}
        </h2>

        {announcements.length === 0 ? (
          <p className="font-body text-[13px] text-ink-soft">
            Nothing yet. Anything you publish here appears on every patient&apos;s Today screen,
            just below their tasks.
          </p>
        ) : (
          <ul className="flex flex-col">
            {announcements.map((a) => {
              const status = statusOf(a);
              const window = windowLabel(a);
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-3 border-b border-line py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-semibold text-ink">{a.title}</p>
                    {a.body && (
                      <p className="line-clamp-2 font-body text-[13px] text-ink-soft">{a.body}</p>
                    )}
                    {window && (
                      <p className="mt-0.5 font-body text-[11px] text-ink-soft">{window}</p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>

                  <button
                    onClick={() => start(() => toggleAnnouncement(a.id, cohortId, !a.published))}
                    disabled={pending}
                    className="shrink-0 rounded-lg border border-line px-2.5 py-1 font-body text-[12px] font-semibold text-ink disabled:opacity-50"
                  >
                    {a.published ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => start(() => deleteAnnouncement(a.id, cohortId))}
                    disabled={pending}
                    aria-label={`Delete ${a.title}`}
                    className="shrink-0 px-1 font-body text-ink-soft hover:text-red disabled:opacity-50"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
