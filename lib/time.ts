// Pakistan observes UTC+5 with no DST, so the offset is fixed. We still format
// via Intl to stay correct if that ever changes.
const KARACHI_TZ = "Asia/Karachi";

/** yyyy-mm-dd for "today" in Asia/Karachi. */
export function karachiToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KARACHI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** UTC [start, end) instants bounding today's Karachi calendar day. */
export function karachiTodayRangeUtc(now: Date = new Date()): {
  startISO: string;
  endISO: string;
} {
  const day = karachiToday(now); // yyyy-mm-dd
  const start = new Date(`${day}T00:00:00+05:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

/** Hour-of-day (0–24, fractional) for an instant, in Asia/Karachi. */
export function karachiHour(iso: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KARACHI_TZ,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h + m / 60;
}

/**
 * Position on the dial's 6am→10pm arc as a 0–1 fraction, matching the
 * prototype's horizon (readings outside the window clamp to the ends).
 */
export function dialFraction(iso: string): number {
  const hour = karachiHour(iso);
  const frac = (hour - 6) / 16; // 06:00 → 0, 22:00 → 1
  return Math.max(0, Math.min(1, frac));
}

/** Short time label like "7:10am" in Asia/Karachi. */
export function karachiClock(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: KARACHI_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(iso))
    .toLowerCase()
    .replace(/\s/g, "");
}
