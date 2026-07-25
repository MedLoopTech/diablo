"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 py-12">
      <div className="font-display text-xl font-semibold text-ink">Couldn&apos;t load the dashboard</div>
      <p className="font-body text-[13px] text-ink-soft">A transient error occurred. Try again.</p>
      <button onClick={reset} className="rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-bold text-white">
        Try again
      </button>
    </div>
  );
}
