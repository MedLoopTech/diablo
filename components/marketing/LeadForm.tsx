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

const field =
  "w-full rounded-[10px] border border-line bg-paper px-4 py-3 font-body text-[14px] text-ink outline-none focus:border-primary";
const label = "font-body text-[12px] font-semibold text-ink";

export function LeadForm({
  open,
  onClose,
  interest = "guide",
  persona = "patient",
  contactWhatsapp,
}: {
  open: boolean;
  onClose: () => void;
  interest?: string;
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
          interest,
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
    <Modal
      open={open}
      onClose={onClose}
      title={sent ? "" : "Get the Free Desi Diabetes Plate Guide"}
      subtitle={sent ? undefined : "Practical portion and pairing guidance for everyday Pakistani meals — sent to your WhatsApp."}
    >
      {sent ? (
        <ModalSuccess
          title="Guide on its way!"
          body="Check your WhatsApp in the next few minutes. If you don't see it, message us directly."
          whatsappNumber={contactWhatsapp}
          whatsappText="Hi Loop/90, I just requested the Desi Diabetes Plate Guide"
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
            {pending ? "Sending…" : "Send Me the Guide"}
          </button>
          <p className="font-body text-[11.5px] leading-relaxed text-ink-soft">
            We never spam. Your number is used only to send the guide and follow up about the program.
          </p>
        </form>
      )}
    </Modal>
  );
}
