import Link from "next/link";

export const metadata = {
  title: "Resources",
  description: "Curated books, research, and videos for your diabetes remission journey.",
};
import { getResources } from "@/lib/resources";
import { RESOURCE_LABELS, RESOURCE_EMOJI, type ResourceType } from "@/lib/resources-shared";
import { Card } from "@/components/ui";

const TYPES: { key: ResourceType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "book", label: "Books" },
  { key: "research", label: "Research" },
  { key: "video", label: "Videos" },
  { key: "exercise_plan", label: "Exercise" },
  { key: "article", label: "Articles" },
  { key: "recipe", label: "Recipes" },
];

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const activeType = (searchParams.type as ResourceType | undefined) ?? undefined;
  const resources = await getResources(activeType);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink">Resource library</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TYPES.map((t) => {
          const active = (t.key === "all" && !activeType) || t.key === activeType;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/resources" : `/resources?type=${t.key}`}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 font-body text-[12.5px] font-semibold transition-colors ${
                active
                  ? "bg-primary-deep text-white"
                  : "border border-line bg-card text-ink-soft"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {resources.length === 0 ? (
        <Card>
          <p className="font-body text-[13.5px] text-ink-soft">
            No resources in this category yet — check back soon.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {resources.map((r) => (
            <Card key={r.id} className="px-4 py-3.5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-mint text-[18px]">
                  {RESOURCE_EMOJI[r.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[10.5px] font-semibold uppercase tracking-wider text-primary-deep">
                      {RESOURCE_LABELS[r.type]}
                    </span>
                  </div>
                  <div className="font-body text-[14px] font-bold text-ink leading-snug mt-0.5">
                    {r.title}
                  </div>
                  {r.description && (
                    <p className="mt-1 font-body text-[12.5px] leading-relaxed text-ink-soft">
                      {r.description}
                    </p>
                  )}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-body text-[12.5px] font-bold text-primary-deep underline-offset-2 hover:underline"
                    >
                      Open →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
