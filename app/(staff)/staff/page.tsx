import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui";
import { getCurrentProfile } from "@/lib/profile";

export default async function StaffHome() {
  const t = await getTranslations("staff");
  const profile = await getCurrentProfile();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("welcome", { name: firstName })}
      </h1>
      <Card>
        <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">
          {t("emptyBody")}
        </p>
      </Card>
    </div>
  );
}
