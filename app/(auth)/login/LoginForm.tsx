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

export function LoginForm({ showGoogle = true }: { showGoogle?: boolean }) {
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

  const signInWithGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message || t("errorGeneric"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorGeneric"));
      setBusy(false);
    }
    // don't setBusy(false) on success — page is navigating away
  };

  const switchChannel = () => {
    setChannel(channel === "phone" ? "email" : "phone");
    setStep("identify");
    setOtp("");
    setError(null);
  };

  return (
    <div className="card flex flex-col gap-4">
      {showGoogle && (
        <>
          <button
            onClick={signInWithGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-white px-5 py-3 font-body text-[14px] font-semibold text-ink shadow-sm transition hover:bg-paper disabled:opacity-50 dark:bg-ink dark:text-white dark:hover:bg-ink/80"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-body text-[11px] uppercase tracking-widest text-ink-soft">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

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
