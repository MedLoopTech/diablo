"use client";

/**
 * The referral widget used to just show the raw code and say "share via
 * WhatsApp or SMS" — the doctor had to copy the code and write their own
 * message. This builds the actual wa.me deep link (no phone number, so
 * WhatsApp lets the doctor pick who to send it to) with a pre-filled
 * message and a signup link that carries the code via ?ref=, which /login
 * and /onboard now read automatically.
 */
export function ReferralShareButton({ code }: { code: string }) {
  const share = () => {
    const link = `${window.location.origin}/login?ref=${encodeURIComponent(code)}`;
    const message = `Salaam! I've been doing the Loop/90 90-day diabetes remission program with my doctor — sharing in case it helps you too. Sign up here: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={share}
      className="rounded-full bg-[#25D366] px-4 py-2 font-body text-[13px] font-bold text-white hover:brightness-95"
    >
      Share via WhatsApp
    </button>
  );
}
