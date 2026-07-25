import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui";

export default async function LogPage() {
  const t = await getTranslations("log");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("title")}
      </h1>
      <Card>
        <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">
          {t("emptyBody")}
        </p>
      </Card>
    </div>
  );
}
