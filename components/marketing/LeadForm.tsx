"use client";

import { useState } from "react";

export function LeadForm({ interest = "guide" }: { interest?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, interest, source: "landing" }),
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
      <div className="rounded-card border border-line bg-mint p-5 text-center">
        <div className="font-display text-[18px] font-semibold text-primary-deep">Guide sent! ✓</div>
        <p className="mt-1 font-body text-[13px] text-ink-soft">
          Check your WhatsApp in the next few minutes. If you don&apos;t see it, message us directly.
        </p>
      </div>
    );
  }

  const field = "w-full rounded-[10px] border border-line bg-paper px-4 py-3 font-body text-[14px] text-ink outline-none focus:border-primary";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Your name"
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
      {error && <p className="font-body text-[12.5px] text-coral">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-3 font-body text-[14px] font-bold text-white disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send Me the Free Guide"}
      </button>
      <p className="font-body text-[11.5px] text-ink-soft">We never spam. Your number is used only to send you the guide and follow up about the program.</p>
    </form>
  );
}
