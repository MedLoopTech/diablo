import { createServerSupabase } from "@/lib/supabase/server";
export type { ResourceType, Resource } from "@/lib/resources-shared";
export { RESOURCE_LABELS, RESOURCE_EMOJI } from "@/lib/resources-shared";
import type { ResourceType, Resource } from "@/lib/resources-shared";

export async function getResources(type?: ResourceType): Promise<Resource[]> {
  const supabase = createServerSupabase();
  let q = supabase
    .from("resources")
    .select("id, title, type, description, url, tags, created_at")
    .eq("is_active", true)
    .order("type", { ascending: true })
    .order("created_at", { ascending: false });
  if (type) q = q.eq("type", type);
  const { data } = await q;
  return (data as Resource[]) ?? [];
}

export async function getAllResourcesAdmin(): Promise<(Resource & { is_active: boolean })[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("resources")
    .select("id, title, type, description, url, tags, is_active, created_at")
    .order("created_at", { ascending: false });
  return (data as (Resource & { is_active: boolean })[]) ?? [];
}

// Known tag vocabulary for keyword matching.
const ALL_TAGS = [
  "nutrition", "exercise", "science", "recipes", "lifestyle", "mindset",
  "fasting", "glucose", "weight-loss", "remission", "walking", "morning",
  "stress", "cortisol", "low-carb", "glycemic-index", "food-labels",
  "strength", "muscle", "clinical-trial", "calorie-restriction", "pakistan",
  "education", "sleep", "insulin", "carbs",
];

/** Extract tag-vocabulary words present in a patient message for resource matching. */
export function extractTags(message: string): string[] {
  const lower = message.toLowerCase();
  return ALL_TAGS.filter((tag) => lower.includes(tag.replace("-", " ")) || lower.includes(tag));
}

/** Fetch active resources whose tags overlap with the given keyword list (for AI context). */
export async function getRelevantResources(
  supabase: ReturnType<typeof createServerSupabase>,
  keywords: string[],
  limit = 3
): Promise<Resource[]> {
  if (!keywords.length) return [];
  const { data } = await supabase
    .from("resources")
    .select("id, title, type, description, url, tags")
    .eq("is_active", true)
    .overlaps("tags", keywords)
    .limit(limit);
  return (data as Resource[]) ?? [];
}
