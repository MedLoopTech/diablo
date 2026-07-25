"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

async function ctx() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: cohortId } = await supabase.rpc("my_cohort");
  return { supabase, user, cohortId: cohortId as string | null };
}

export async function createPost(body: string): Promise<{ ok: boolean; error?: string }> {
  const text = body.trim();
  if (!text) return { ok: false, error: "Say something first." };
  const { supabase, user, cohortId } = await ctx();
  if (!user || !cohortId) return { ok: false, error: "You're not in a cohort yet." };

  const { error } = await supabase.from("posts").insert({
    cohort_id: cohortId,
    author_id: user.id,
    body: text.slice(0, 1000),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/cohort");
  return { ok: true };
}

export async function toggleReaction(postId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user } = await ctx();
  if (!user) return { ok: false, error: "Sign in again." };

  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("post_reactions").delete().eq("id", existing.id)
    : await supabase.from("post_reactions").insert({ post_id: postId, user_id: user.id, emoji: "❤️" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/cohort");
  return { ok: true };
}

export async function addReply(postId: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const text = body.trim();
  if (!text) return { ok: false, error: "Reply is empty." };
  const { supabase, user } = await ctx();
  if (!user) return { ok: false, error: "Sign in again." };

  const { error } = await supabase.from("post_replies").insert({
    post_id: postId,
    author_id: user.id,
    body: text.slice(0, 500),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/cohort");
  return { ok: true };
}
