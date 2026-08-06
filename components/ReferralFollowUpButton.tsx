"use client";

/**
 * A referred-but-unconverted row needs one thing: a fast way to nudge that
 * specific patient to finish enrolling. wa.me/<digits> opens a chat with
 * that number pre-filled — unlike the code-share button, there's no need
 * to ask WhatsApp "pick a contact" since we already know who this is.
 */
export function ReferralFollowUpButton({ name, phone }: { name: string | null; phone: string | null }) {
  const digits = phone?.replace(/[^\d]/g, "") ?? "";

  if (!digits) {
    return <span className="font-body text-[11.5px] text-ink-soft">no phone on file</span>;
  }

  const message = `Salaam${name ? " " + name.split(" ")[0] : ""}! Just checking in — ready to get you enrolled in Loop/90? Let me know if you have any questions.`;
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="rounded-full bg-[#25D366] px-3 py-1 font-body text-[11.5px] font-bold text-white hover:brightness-95"
    >
      Follow up on WhatsApp
    </a>
  );
}
