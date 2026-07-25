"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="text-[32px]">🌱</div>
      <div className="font-display text-xl font-semibold text-ink">Something hiccuped</div>
      <p className="max-w-xs font-body text-[13px] text-ink-soft">
        We couldn&apos;t load this just now. Your data is safe — please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
