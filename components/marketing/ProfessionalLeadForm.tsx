"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, ModalSuccess } from "@/components/marketing/Modal";

/** Role → the persona bucket the leads table segments on, and whether a
 *  practising licence is relevant. Referral-only partners don't join a pod,
 *  so we don't gate them behind credentialing fields. */
const ROLES = [
  { id: "doctor", label: "Doctor (Endocrinologist / GP)", persona: "doctor", interest: "clinic", licence: "PMDC registration number" },
  { id: "nutritionist", label: "Clinical Nutritionist / Dietitian", persona: "nutritionist_coach", interest: "clinic", licence: "RD / certification number" },
  { id: "coach", label: "Fitness / Movement Coach", persona: "nutritionist_coach", interest: "clinic", licence: "Certification number" },
  { id: "other", label: "Other healthcare professional", persona: "nutritionist_coach", interest: "clinic", licence: "Registration / certification number" },
  { id: "referrer", label: "Referral partner only", persona: "doctor", interest: "partnership", licence: null },
] as const;

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

export function ProfessionalLeadForm({
  open,
  onClose,
  contactWhatsapp,
}: {
  open: boolean;
  onClose: () => void;
  contactWhatsapp: string;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("doctor");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attribution = useRef<Attribution | null>(null);

  const selected = ROLES.find((r) => r.id === role)!;

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
          name: `${firstName} ${lastName}`.trim(),
          phone,
          email,
          city,
          licenseNumber: selected.licence ? licenceNumber : null,
          persona: selected.persona,
          interest: selected.interest,
          source: `professionals:${role}`,
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
      title={sent ? "" : "Apply to the Loop/90 Care Network"}
      subtitle={sent ? undefined : "Takes a few minutes. We review your credentials and arrange a short video interview."}
    >
      {sent ? (
        <ModalSuccess
          title="Application received!"
          body="Our team will review your details and reach out on WhatsApp to arrange your interview."
          whatsappNumber={contactWhatsapp}
          whatsappText="Hi Loop/90, I just submitted my care network application"
        />
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pro-role" className={label}>Your role</label>
            <select id="pro-role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} className={field}>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pro-first" className={label}>First name</label>
              <input id="pro-first" type="text" placeholder="e.g. Asif" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={field} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pro-last" className={label}>Last name</label>
              <input id="pro-last" type="text" placeholder="e.g. Khan" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={field} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pro-email" className={label}>Email</label>
            <input id="pro-email" type="email" placeholder="e.g. dr.asif@clinic.pk" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pro-phone" className={label}>WhatsApp number</label>
            <input id="pro-phone" type="tel" placeholder="e.g. 03001234567" value={phone} onChange={(e) => setPhone(e.target.value)} required className={field} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pro-city" className={label}>City</label>
            <input id="pro-city" type="text" placeholder="e.g. Karachi, Lahore, Islamabad" value={city} onChange={(e) => setCity(e.target.value)} required className={field} />
          </div>
          {selected.licence && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pro-licence" className={label}>{selected.licence}</label>
              <input
                id="pro-licence"
                type="text"
                placeholder="e.g. PMDC-12345"
                value={licenceNumber}
                onChange={(e) => setLicenceNumber(e.target.value)}
                required
                className={field}
              />
            </div>
          )}
          <label className="flex items-start gap-2.5 text-left">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
            <span className="font-body text-[11.5px] leading-relaxed text-ink-soft">
              I agree to be contacted about joining the Loop/90 care network.
            </span>
          </label>
          {error && <p className="font-body text-[12.5px] text-coral">{error}</p>}
          <button type="submit" disabled={pending} className="rounded-full bg-primary px-6 py-3.5 font-body text-[14.5px] font-bold text-white disabled:opacity-50">
            {pending ? "Sending…" : "Submit Application"}
          </button>
          <p className="font-body text-[11.5px] leading-relaxed text-ink-soft">
            Your details are shared only with our credentialing team. Applying doesn&apos;t commit you to anything.
          </p>
        </form>
      )}
    </Modal>
  );
}
