"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createBrowserSupabase } from "@/lib/supabase/client";

type Channel = "phone" | "email";
type Step = "identify" | "otp";

/** Normalize a Pakistani phone entry to E.164 (+92…). */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  if (digits.startsWith("92")) return `+${digits}`;
  return `+${digits}`;
}

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [channel, setChannel] = useState<Channel>("phone");
  const [step, setStep] = useState<Step>("identify");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The client is built per-action rather than at render time: these pages
  // are statically prerendered, and a missing/placeholder env would otherwise
  // throw during the build.
  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } =
        channel === "phone"
          ? await supabase.auth.signInWithOtp({ phone: normalizePhone(phone) })
          : await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) {
        setError(error.message || t("errorGeneric"));
        return;
      }
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } =
        channel === "phone"
          ? await supabase.auth.verifyOtp({
              phone: normalizePhone(phone),
              token: otp.trim(),
              type: "sms",
            })
          : await supabase.auth.verifyOtp({
              email: email.trim(),
              token: otp.trim(),
              type: "email",
            });
      if (error) {
        setError(t("errorInvalidCode"));
        return;
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  };

  const switchChannel = () => {
    setChannel(channel === "phone" ? "email" : "phone");
    setStep("identify");
    setOtp("");
    setError(null);
  };

  return (
    <div className="card flex flex-col gap-4">
      {step === "identify" ? (
        <>
          <div>
            <label className="eyebrow" htmlFor="identify">
              {channel === "phone" ? t("phoneLabel") : t("emailLabel")}
            </label>
            <input
              id="identify"
              type={channel === "phone" ? "tel" : "email"}
              inputMode={channel === "phone" ? "tel" : "email"}
              autoComplete={channel === "phone" ? "tel" : "email"}
              value={channel === "phone" ? phone : email}
              onChange={(e) =>
                channel === "phone"
                  ? setPhone(e.target.value)
                  : setEmail(e.target.value)
              }
              placeholder={
                channel === "phone"
                  ? t("phonePlaceholder")
                  : t("emailPlaceholder")
              }
              className="mt-2 w-full rounded-[14px] border-none bg-paper px-4 py-3 font-body text-[15px] text-ink outline-none"
            />
            <p className="mt-2 font-body text-[12px] text-ink-soft">
              {channel === "phone" ? t("phoneHelp") : t("emailHelp")}
            </p>
          </div>
          <button
            onClick={sendCode}
            disabled={busy || (channel === "phone" ? !phone.trim() : !email.trim())}
            className="w-full rounded-full bg-primary px-5 py-3 font-body text-[14px] font-bold text-white disabled:opacity-50"
          >
            {busy ? t("sendingCode") : t("sendCode")}
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="eyebrow" htmlFor="otp">
              {t("otpLabel")}
            </label>
            <input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder={t("otpPlaceholder")}
              maxLength={6}
              className="mt-2 w-full rounded-[14px] border-none bg-paper px-4 py-3 text-center font-display text-2xl font-semibold tracking-[0.3em] text-ink outline-none"
            />
          </div>
          <button
            onClick={verifyCode}
            disabled={busy || otp.length < 6}
            className="w-full rounded-full bg-primary px-5 py-3 font-body text-[14px] font-bold text-white disabled:opacity-50"
          >
            {busy ? t("verifying") : t("verify")}
          </button>
          <div className="flex justify-between">
            <button
              onClick={() => setStep("identify")}
              className="font-body text-[12.5px] font-semibold text-ink-soft"
            >
              {channel === "phone" ? t("changeNumber") : t("changeEmail")}
            </button>
            <button
              onClick={sendCode}
              disabled={busy}
              className="font-body text-[12.5px] font-semibold text-primary-deep"
            >
              {t("resend")}
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="rounded-[12px] bg-coral-soft px-3 py-2 font-body text-[12.5px] text-coral">
          {error}
        </div>
      )}

      <button
        onClick={switchChannel}
        className="font-body text-[13px] font-bold text-primary-deep"
      >
        {channel === "phone" ? t("useEmail") : t("usePhone")}
      </button>
    </div>
  );
}
