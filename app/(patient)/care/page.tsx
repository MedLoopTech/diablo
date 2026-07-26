import { getTranslations } from "next-intl/server";
import { Card, Eyebrow } from "@/components/ui";
import { getCarePod, getOpenSlots, getMyMealPlan, podEmoji, type PodMember } from "@/lib/care";
import { CareBooking } from "./CareBooking";

const ROLE_LABEL: Record<PodMember["role"], string> = {
  doctor: "Endocrinologist / GP",
  nutritionist: "Clinical nutritionist",
  coach: "Yoga & movement coach",
};

export default async function CarePage() {
  const t = await getTranslations("care");
  const [pod, slots, mealPlan] = await Promise.all([getCarePod(), getOpenSlots(), getMyMealPlan()]);

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

      {mealPlan && mealPlan.meals.length > 0 && (
        <Card>
          <Eyebrow>Your meal plan · from your nutritionist</Eyebrow>
          <div className="mt-2 flex flex-col gap-1.5">
            {mealPlan.meals.map((m, i) => (
              <div key={i} className="font-body text-[13px] text-ink">
                <span className="font-semibold capitalize">{m.meal}:</span> {m.description}
                {m.carb_target_g ? <span className="text-ink-soft"> · ~{m.carb_target_g}g carbs</span> : null}
              </div>
            ))}
          </div>
          {mealPlan.notes && (
            <p className="mt-2 font-body text-[12px] leading-relaxed text-ink-soft">{mealPlan.notes}</p>
          )}
        </Card>
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
