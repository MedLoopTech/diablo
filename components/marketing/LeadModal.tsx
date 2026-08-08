"use client";

import { createContext, useContext, useState } from "react";
import { LeadForm } from "@/components/marketing/LeadForm";
import { ProfessionalLeadForm } from "@/components/marketing/ProfessionalLeadForm";

const LeadModalContext = createContext<{ open: () => void }>({ open: () => {} });

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
  interest = "guide",
  persona = "patient",
}: {
  children: React.ReactNode;
  contactWhatsapp: string;
  variant?: "patient" | "professional";
  interest?: string;
  persona?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LeadModalContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      {variant === "professional" ? (
        <ProfessionalLeadForm open={isOpen} onClose={() => setIsOpen(false)} contactWhatsapp={contactWhatsapp} />
      ) : (
        <LeadForm
          open={isOpen}
          onClose={() => setIsOpen(false)}
          contactWhatsapp={contactWhatsapp}
          interest={interest}
          persona={persona}
        />
      )}
    </LeadModalContext.Provider>
  );
}

/** A button that opens the page's lead modal. Replaces the anchor links that
 *  only scrolled the visitor to a form section. */
export function LeadCta({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useLeadModal();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
