"use client";

import { createContext, useContext, useState } from "react";
import { LeadForm, type LeadFormVariant } from "@/components/marketing/LeadForm";
import { ProfessionalLeadForm } from "@/components/marketing/ProfessionalLeadForm";

const LeadModalContext = createContext<{ open: (variant?: LeadFormVariant) => void }>({ open: () => {} });

export function useLeadModal() {
  return useContext(LeadModalContext);
}

/**
 * Holds the lead-modal state for a marketing page. Static page content stays
 * server-rendered — it's passed through as `children` — while any CTA inside
 * can open the form via `LeadCta`.
 */
export function LeadModalProvider({
  children,
  contactWhatsapp,
  variant = "patient",
  persona = "patient",
}: {
  children: React.ReactNode;
  contactWhatsapp: string;
  variant?: "patient" | "professional";
  persona?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Which CTA opened the modal — "Reserve your spot" and "Get the free
  // guide" are different intents and need different copy, not the same
  // modal wearing whichever label happened to load first.
  const [formVariant, setFormVariant] = useState<LeadFormVariant>("guide");

  return (
    <LeadModalContext.Provider
      value={{
        open: (v = "guide") => {
          // Always set explicitly, even to the default — a CTA that omits
          // `variant` means "this is the guide CTA", not "leave whatever
          // variant was last opened," or the modal gets stuck showing
          // Reserve-Your-Spot copy after a visitor opens it once.
          setFormVariant(v);
          setIsOpen(true);
        },
      }}
    >
      {children}
      {variant === "professional" ? (
        <ProfessionalLeadForm open={isOpen} onClose={() => setIsOpen(false)} contactWhatsapp={contactWhatsapp} />
      ) : (
        <LeadForm
          open={isOpen}
          onClose={() => setIsOpen(false)}
          contactWhatsapp={contactWhatsapp}
          variant={formVariant}
          persona={persona}
        />
      )}
    </LeadModalContext.Provider>
  );
}

/** A button that opens the page's lead modal. Replaces the anchor links that
 *  only scrolled the visitor to a form section. `variant` picks which copy
 *  the modal shows — omit it to default to the guide-request framing. */
export function LeadCta({
  className,
  children,
  variant,
}: {
  className?: string;
  children: React.ReactNode;
  variant?: LeadFormVariant;
}) {
  const { open } = useLeadModal();
  return (
    <button type="button" onClick={() => open(variant)} className={className}>
      {children}
    </button>
  );
}
