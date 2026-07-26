import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Sehat/90 to access your 90-day diabetes remission program.",
};

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div className="text-center">
        <div className="font-display text-3xl font-semibold text-ink">
          {tc("appName").split("/")[0]}
          <span className="text-marigold">/90</span>
        </div>
        <div className="eyebrow mt-1">{tc("tagline")}</div>
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-soft">
          {t("subtitle")}
        </p>
      </div>

      <LoginForm />

      <p className="text-center font-body text-[11.5px] leading-relaxed text-ink-soft">
        {tc("disclaimer")}
      </p>
    </main>
  );
}
