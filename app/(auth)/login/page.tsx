import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LoginForm } from "./LoginForm";
import { demoModeEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Loop/90 to access your 90-day diabetes remission program.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { portal?: string };
}) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const isStaffPortal = searchParams?.portal === "staff";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div className="text-center">
        <div className="font-display text-3xl font-semibold text-ink">
          Loop<span className="text-marigold">/90</span>
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

      <LoginForm showGoogle={!isStaffPortal} />

      {demoModeEnabled() && (
        <Link
          href="/demo"
          className="rounded-2xl border border-line bg-card px-4 py-3 text-center font-body text-[13px] font-semibold text-primary-deep hover:border-primary"
        >
          Just here to look around? Try the demo →
        </Link>
      )}

      <p className="text-center font-body text-[11.5px] leading-relaxed text-ink-soft">
        {tc("disclaimer")}
      </p>
    </main>
  );
}
