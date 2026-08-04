/**
 * Playback for a voice note. The signed URL is resolved server-side (this
 * codebase never gives a client direct access to storage.objects), so this
 * is a plain presentational component — no client-side Supabase call.
 */
export function VoicePlayer({ url, light = false }: { url: string | null; light?: boolean }) {
  if (!url) {
    return (
      <p className={`font-body text-[12px] italic ${light ? "text-white/70" : "text-ink-soft"}`}>
        Voice message unavailable
      </p>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true">🎤</span>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio controls preload="none" src={url} className="h-8 max-w-[220px]" />
    </div>
  );
}
