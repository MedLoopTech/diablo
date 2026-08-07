"use client";

import { useEffect, useRef, useState } from "react";

/** Role → the persona bucket the leads table segments on. Doctors get their
 *  own follow-up track; nutritionists and coaches share one. */
const ROLES = [
  { id: "doctor", label: "Doctor (Endocrinologist / GP)", persona: "doctor", interest: "clinic" },
  { id: "nutritionist", label: "Clinical Nutritionist", persona: "nutritionist_coach", interest: "clinic" },
  { id: "coach", label: "Fitness / Movement Coach", persona: "nutritionist_coach", interest: "clinic" },
  { id: "referral", label: "Referral partner only", persona: "doctor", interest: "partnership" },
] as const;

type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  contentAsset: string | null;
  referrer: string | null;
  landingPath: string | null;
};

export function ProfessionalLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("doctor");
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
    const selected = ROLES.find((r) => r.id === role)!;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
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

  if (sent) {
    return (
      <div className="rounded-card border border-line bg-mint p-6 text-center">
        <div className="font-display text-[19px] font-semibold text-primary-deep">Application received ✓</div>
        <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-soft">
          Our team will contact you on WhatsApp to arrange a short interview and verify your credentials.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-[10px] border border-line bg-paper px-4 py-3 font-body text-[14px] text-ink outline-none focus:border-primary";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className={field}>
        {ROLES.map((r) => (
          <option key={r.id} value={r.id}>{r.label}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={field}
      />
      <input
        type="tel"
        placeholder="WhatsApp number (03XX XXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        className={field}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={field}
      />
      <label className="flex items-start gap-2.5 text-left">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span className="font-body text-[11.5px] leading-relaxed text-ink-soft">
          I agree to be contacted about joining the Loop/90 care network.
        </span>
      </label>
      {error && <p className="font-body text-[12.5px] text-coral">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-3.5 font-body text-[14.5px] font-bold text-white disabled:opacity-50"
      >
        {pending ? "Sending…" : "Apply to Join"}
      </button>
      <p className="font-body text-[11.5px] leading-relaxed text-ink-soft">
        Applying doesn&apos;t commit you to anything. We verify credentials before any placement.
      </p>
    </form>
  );
}
