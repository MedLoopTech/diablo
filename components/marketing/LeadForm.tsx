"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, ModalSuccess } from "@/components/marketing/Modal";

/** Campaign attribution read from the URL at mount. The content-ops system
 *  plans across ten channels and seasonal campaigns — without these, a lead
 *  can't be traced back to the piece that produced it. */
type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  contentAsset: string | null;
  referrer: string | null;
  landingPath: string | null;
};

export type LeadFormVariant = "guide" | "enrollment";

// "Reserve your spot" and "get the free guide" are different intents — a
// visitor who clicked Reserve and lands on a modal titled "Get the Free
// Guide" reads as a bait-and-switch. Same form and endpoint underneath
// (both are just a name+phone WhatsApp handoff), different framing.
const COPY: Record<
  LeadFormVariant,
  { title: string; subtitle: string; submitLabel: string; interest: string; successTitle: string; successBody: string; whatsappText: string }
> = {
  guide: {
    title: "Get the Free Desi Diabetes Plate Guide",
    subtitle: "Practical portion and pairing guidance for everyday Pakistani meals — sent to your WhatsApp.",
    submitLabel: "Send Me the Guide",
    interest: "guide",
    successTitle: "Guide on its way!",
    successBody: "Check your WhatsApp in the next few minutes. If you don't see it, message us directly.",
    whatsappText: "Hi Loop/90, I just requested the Desi Diabetes Plate Guide",
  },
  enrollment: {
    title: "Reserve Your Spot",
    subtitle: "Tell us where to reach you — our team confirms your cohort spot and payment options on WhatsApp.",
    submitLabel: "Reserve My Spot",
    interest: "enrollment",
    successTitle: "You're on the list!",
    successBody: "Our team will message you on WhatsApp shortly to confirm your spot and walk through payment options.",
    whatsappText: "Hi Loop/90, I just reserved my spot in the next cohort",
  },
};

const field =
  "w-full rounded-[10px] border border-line bg-paper px-4 py-3 font-body text-[14px] text-ink outline-none focus:border-primary";
const label = "font-body text-[12px] font-semibold text-ink";

export function LeadForm({
  open,
  onClose,
  variant = "guide",
  persona = "patient",
  contactWhatsapp,
}: {
  open: boolean;
  onClose: () => void;
  variant?: LeadFormVariant;
  persona?: string;
  contactWhatsapp: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attribution = useRef<Attribution | null>(null);
  const copy = COPY[variant];

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    attribution.current = {
      utmSource: p.get("utm_source"),
      utmMedium: p.get("utm_medium"),
      utmCampaign: p.get("utm_campaign"),
      contentAsset: p.get("asset") ?? p.get("utm_content"),
      referrer: document.referrer || null,
      landingPath: window.location.pathname,
    };
  }, []);

  // Reset so a visitor who submits the guide form, closes it, then opens
  // the reserve-spot form doesn't see stale "sent" state under new copy.
  useEffect(() => {
    if (open) setSent(false);
  }, [open, variant]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          city,
          interest: copy.interest,
          persona,
          source: "landing",
          consentMarketing: consent,
          ...attribution.current,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Something went wrong.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={sent ? "" : copy.title} subtitle={sent ? undefined : copy.subtitle}>
      {sent ? (
        <ModalSuccess
          title={copy.successTitle}
          body={copy.successBody}
          whatsappNumber={contactWhatsapp}
          whatsappText={copy.whatsappText}
        />
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lead-name" className={label}>Your name</label>
            <input id="lead-name" type="text" placeholder="e.g. Fatima Ahmed" value={name} onChange={(e) => setName(e.target.value)} required className={field} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lead-phone" className={label}>WhatsApp number</label>
            <input id="lead-phone" type="tel" placeholder="e.g. 03001234567" value={phone} onChange={(e) => setPhone(e.target.value)} required className={field} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lead-city" className={label}>City</label>
            <input id="lead-city" type="text" placeholder="e.g. Karachi, Lahore, Islamabad" value={city} onChange={(e) => setCity(e.target.value)} required className={field} />
          </div>
          <label className="flex items-start gap-2.5 text-left">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
            <span className="font-body text-[11.5px] leading-relaxed text-ink-soft">
              I agree to be contacted on WhatsApp about Loop/90.
            </span>
          </label>
          {error && <p className="font-body text-[12.5px] text-coral">{error}</p>}
          <button type="submit" disabled={pending} className="rounded-full bg-primary px-6 py-3.5 font-body text-[14.5px] font-bold text-white disabled:opacity-50">
            {pending ? "Sending…" : copy.submitLabel}
          </button>
          <p className="font-body text-[11.5px] leading-relaxed text-ink-soft">
            We never spam. Your number is used only to follow up about the program.
          </p>
        </form>
      )}
    </Modal>
  );
}
