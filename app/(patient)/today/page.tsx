import { getTranslations } from "next-intl/server";
import { Card, Eyebrow } from "@/components/ui";
import { getCurrentProfile } from "@/lib/profile";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: { denied?: string };
}) {
  const t = await getTranslations("today");
  const te = await getTranslations("errors");
  const profile = await getCurrentProfile();
  const firstName = profile?.full_name?.split(" ")[0] ?? "friend";

  return (
    <div className="flex flex-col gap-4">
      {searchParams.denied && (
        <div className="rounded-[12px] bg-coral-soft px-3 py-2 font-body text-[12.5px] text-coral">
          {te("notAuthorized")}
        </div>
      )}

      <div>
        <Eyebrow className="text-primary">{t("notEnrolled")}</Eyebrow>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight text-ink">
          {t("greeting", { name: firstName })}
        </h1>
      </div>

      <Card>
        <Eyebrow>{t("emptyTitle")}</Eyebrow>
        <p className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-soft">
          {t("emptyBody")}
        </p>
      </Card>
    </div>
  );
}
