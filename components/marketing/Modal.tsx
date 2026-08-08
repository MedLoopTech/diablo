"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Dialog used by the marketing lead forms. Restores the modal pattern from
 * the original marketing pages — any CTA anywhere on the page opens the form,
 * rather than scrolling the visitor to a section and hoping they fill it in.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Where focus was before we opened, so it can be handed back on close.
  const restoreRef = useRef<HTMLElement | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Keep tabbing inside the dialog while it's open.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      restoreRef.current?.focus?.();
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-frame-dark/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-md rounded-card border border-line bg-card p-6 shadow-[0_30px_70px_rgba(6,35,29,0.35)] sm:p-7"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[20px] leading-none text-ink-soft hover:bg-paper hover:text-ink"
        >
          &times;
        </button>
        <h3 id="modal-title" className="pr-8 font-display text-[21px] font-semibold leading-snug text-ink">
          {title}
        </h3>
        {subtitle && <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-soft">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/** Shared success panel — the direct-WhatsApp fallback the original pages had.
 *  This is the only working contact path when notification credentials aren't
 *  configured, so it must not be dropped. */
export function ModalSuccess({
  title,
  body,
  whatsappNumber,
  whatsappText,
}: {
  title: string;
  body: string;
  whatsappNumber: string;
  whatsappText: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint text-[26px] text-primary-deep">✓</div>
      <div className="mt-4 font-display text-[19px] font-semibold text-primary-deep">{title}</div>
      <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-soft">{body}</p>
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 block rounded-full bg-primary px-6 py-3 font-body text-[14px] font-bold text-white"
      >
        Message Us on WhatsApp
      </a>
    </div>
  );
}
