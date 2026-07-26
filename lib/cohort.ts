import { createServerSupabase } from "@/lib/supabase/server";

export type LeaderRow = { patient_id: string; full_name: string | null; points: number; streak: number; you: boolean };
export type PostReply = {
  id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

export type FeedPost = {
  id: string;
  author_id: string;
  author_name: string | null;
  body: string;
  created_at: string;
  reaction_count: number;
  reply_count: number;
  reacted: boolean;
  replies: PostReply[];
};
export type CohortSummary = { cohortId: string | null; name: string | null; memberCount: number };

export async function getCohortSummary(): Promise<CohortSummary> {
  const supabase = createServerSupabase();
  const { data: cohortId } = await supabase.rpc("my_cohort");
  if (!cohortId) return { cohortId: null, name: null, memberCount: 0 };

  const [{ data: cohort }, { count }] = await Promise.all([
    supabase.from("cohorts").select("name").eq("id", cohortId).maybeSingle(),
    supabase.from("cohort_members").select("*", { count: "exact", head: true }).eq("cohort_id", cohortId),
  ]);
  return { cohortId: cohortId as string, name: (cohort?.name as string) ?? null, memberCount: count ?? 0 };
}

export async function getLeaderboard(): Promise<LeaderRow[]> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: cohortId } = await supabase.rpc("my_cohort");
  if (!cohortId) return [];
  const { data } = await supabase.rpc("cohort_leaderboard", { c: cohortId });
  return (data ?? []).map((r: { patient_id: string; full_name: string | null; points: number; streak: number }) => ({
    ...r,
    you: r.patient_id === user?.id,
  }));
}

/** Weekly group challenge: combined cohort points over the last 7 days vs a goal. */
export async function getGroupChallenge(): Promise<{ total: number; goal: number; pct: number } | null> {
  const supabase = createServerSupabase();
  const { data: cohortId } = await supabase.rpc("my_cohort");
  if (!cohortId) return null;

  const { data: members } = await supabase.from("cohort_members").select("patient_id").eq("cohort_id", cohortId);
  const ids = (members ?? []).map((m) => m.patient_id);
  if (!ids.length) return null;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: pts } = await supabase
    .from("points_ledger")
    .select("points")
    .in("patient_id", ids)
    .gte("created_at", weekAgo);
  const total = (pts ?? []).reduce((s, r) => s + (r.points as number), 0);
  const goal = Math.max(500, ids.length * 800); // weekly cohort points target
  return { total, goal, pct: Math.min(100, Math.round((total / goal) * 100)) };
}

export async function getFeed(): Promise<FeedPost[]> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: cohortId } = await supabase.rpc("my_cohort");
  if (!cohortId) return [];

  const { data: posts } = await supabase
    .from("posts")
    .select("id, author_id, body, created_at, profiles:author_id(full_name)")
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (!posts?.length) return [];

  const ids = posts.map((p) => p.id);
  const [{ data: reactions }, { data: replies }] = await Promise.all([
    supabase.from("post_reactions").select("post_id, user_id").in("post_id", ids),
    supabase
      .from("post_replies")
      .select("id, post_id, author_id, body, created_at, profiles:author_id(full_name)")
      .in("post_id", ids)
      .order("created_at", { ascending: true }),
  ]);

  const reactionsByPost = new Map<string, { count: number; mine: boolean }>();
  for (const r of reactions ?? []) {
    const cur = reactionsByPost.get(r.post_id) ?? { count: 0, mine: false };
    cur.count += 1;
    if (r.user_id === user?.id) cur.mine = true;
    reactionsByPost.set(r.post_id, cur);
  }
  const repliesByPost = new Map<string, PostReply[]>();
  for (const r of replies ?? []) {
    const row = r as unknown as {
      id: string; post_id: string; body: string; created_at: string;
      profiles?: { full_name?: string };
    };
    const list = repliesByPost.get(row.post_id) ?? [];
    list.push({ id: row.id, author_name: row.profiles?.full_name ?? null, body: row.body, created_at: row.created_at });
    repliesByPost.set(row.post_id, list);
  }

  return posts.map((p) => ({
    id: p.id as string,
    author_id: p.author_id as string,
    author_name: (p as unknown as { profiles?: { full_name?: string } }).profiles?.full_name ?? null,
    body: p.body as string,
    created_at: p.created_at as string,
    reaction_count: reactionsByPost.get(p.id as string)?.count ?? 0,
    reply_count: repliesByPost.get(p.id as string)?.length ?? 0,
    reacted: reactionsByPost.get(p.id as string)?.mine ?? false,
    replies: repliesByPost.get(p.id as string) ?? [],
  }));
}
