// Types and constants safe to import in both server and client components.

export type ResourceType = "book" | "research" | "video" | "exercise_plan" | "article" | "recipe";

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  book: "Book",
  research: "Research",
  video: "Video",
  exercise_plan: "Exercise plan",
  article: "Article",
  recipe: "Recipe",
};

export const RESOURCE_EMOJI: Record<ResourceType, string> = {
  book: "📖",
  research: "🔬",
  video: "▶",
  exercise_plan: "🏃",
  article: "📄",
  recipe: "🥗",
};

export type Resource = {
  id: string;
  title: string;
  type: ResourceType;
  description: string | null;
  url: string | null;
  tags: string[];
  created_at: string;
};
