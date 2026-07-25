import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui";
import { getCarePod, getOpenSlots, podEmoji, type PodMember } from "@/lib/care";
import { CareBooking } from "./CareBooking";

const ROLE_LABEL: Record<PodMember["role"], string> = {
  doctor: "Endocrinologist / GP",
  nutritionist: "Clinical nutritionist",
  coach: "Yoga & movement coach",
};

export default async function CarePage() {
  const t = await getTranslations("care");
  const [pod, slots] = await Promise.all([getCarePod(), getOpenSlots()]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">{t("title")}</h1>

      {pod.length === 0 ? (
        <Card>
          <p className="font-body text-[13.5px] leading-relaxed text-ink-soft">
            {t("emptyBody")}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {pod.map((m) => (
            <Card key={m.role} className="px-3.5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-mint text-[20px]">
                  {podEmoji(m.role)}
                </div>
                <div className="flex-1">
                  <div className="font-body text-[14px] font-bold text-ink">
                    {m.name ?? "To be assigned"}
                  </div>
                  <div className="font-body text-[11.5px] text-ink-soft">
                    {ROLE_LABEL[m.role]}
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {pod.length > 0 && <CareBooking slots={slots} />}

      <div className="rounded-card bg-primary-deep p-4 font-body text-[13px] leading-relaxed text-[#DCEDE4]">
        <span className="font-bold text-white">Medication safety.</span>{" "}
        Dose changes only ever happen through a doctor-approved plan in this app —
        never from AI suggestions.
      </div>
    </div>
  );
}
