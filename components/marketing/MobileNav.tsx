"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type MobileNavLink = { label: string; href: string };

/**
 * Hamburger menu for the marketing headers. The desktop nav row is hidden
 * below the `md` breakpoint (`hidden md:flex`), which left small-screen
 * visitors with no way to reach section links or "For clinicians" at all —
 * this is the mobile equivalent, not decoration.
 */
export function MobileNav({ links, extra }: { links: MobileNavLink[]; extra?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const panel = open && (
    // Portalled to document.body rather than rendered where the trigger
    // button lives. The header uses `backdrop-blur` (backdrop-filter), which
    // most browsers treat as creating a containing block for `position:
    // fixed` descendants — so without the portal, this panel was being sized
    // and positioned relative to the ~68px-tall header instead of the
    // viewport, rendering as an empty sliver with nothing visible to tap.
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-card">
      <div className="flex items-center justify-end px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="flex h-9 w-9 items-center justify-center text-[26px] leading-none text-ink"
        >
          &times;
        </button>
      </div>
      <nav className="flex flex-col gap-1 px-5 pb-6">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="rounded-[10px] px-3 py-3 font-body text-[16px] font-semibold text-ink hover:bg-paper"
          >
            {link.label}
          </a>
        ))}
        {extra && <div className="mt-3 flex flex-col gap-3 border-t border-line pt-5">{extra}</div>}
      </nav>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
      >
        <span className={`block h-[2px] w-5 bg-ink transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`block h-[2px] w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
        <span className={`block h-[2px] w-5 bg-ink transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
