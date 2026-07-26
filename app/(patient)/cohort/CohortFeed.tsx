"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { createBrowserSupabase } from "@/lib/supabase/client";
import type { FeedPost } from "@/lib/cohort";
import { createPost, toggleReaction, addReply } from "./actions";

function initials(name: string | null) {
  return (name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

export function CohortFeed({ posts, cohortId }: { posts: FeedPost[]; cohortId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [pending, startTransition] = useTransition();

  // Live feed: refresh server data whenever a post lands in this cohort.
  // Each mount gets a unique channel name so React Strict Mode's double-invoke
  // doesn't collide with an already-subscribed channel.
  // @supabase/ssr doesn't set the realtime socket JWT automatically, so we
  // call setAuth() before subscribing.
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channelName = `cohort-${cohortId}-${Math.random().toString(36).slice(2)}`;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (session) supabase.realtime.setAuth(session.access_token);
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "posts", filter: `cohort_id=eq.${cohortId}` },
          () => router.refresh()
        )
        .subscribe();
    })();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  // router ref is stable; exclude it to prevent re-subscribing on every refresh
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId]);

  const post = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    startTransition(async () => {
      await createPost(body);
      router.refresh();
    });
  };

  const react = (id: string) =>
    startTransition(async () => {
      await toggleReaction(id);
      router.refresh();
    });

  const reply = (id: string) => {
    const body = replyText.trim();
    if (!body) return;
    setReplyText("");
    setReplyOpen(null);
    startTransition(async () => {
      await addReply(id, body);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share a win, a question, or encouragement…"
          rows={2}
          className="w-full resize-none border-none bg-transparent font-body text-[13.5px] text-ink outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={post}
            disabled={pending || !draft.trim()}
            className="rounded-full bg-primary px-5 py-2 font-body text-[13px] font-bold text-white disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </Card>

      {posts.length === 0 ? (
        <Card>
          <p className="font-body text-[13px] text-ink-soft">
            No posts yet — be the first to say salaam to your cohort. 👋
          </p>
        </Card>
      ) : (
        posts.map((p) => (
          <Card key={p.id}>
            <div className="flex gap-3">
              <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-mint font-body text-[12px] font-bold text-primary-deep">
                {initials(p.author_name)}
              </div>
              <div className="flex-1">
                <div className="font-body text-[13px] font-bold text-ink">
                  {p.author_name ?? "Member"}{" "}
                  <span className="font-normal text-ink-soft">
                    · {new Date(p.created_at).toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </div>
                <div className="mt-1 whitespace-pre-wrap font-body text-[13px] leading-relaxed text-ink">
                  {p.body}
                </div>
                <div className="mt-2 flex items-center gap-4 font-body text-[12px] text-ink-soft">
                  <button onClick={() => react(p.id)} disabled={pending} className={p.reacted ? "font-bold text-coral" : ""}>
                    ❤️ {p.reaction_count}
                  </button>
                  <button onClick={() => setReplyOpen(replyOpen === p.id ? null : p.id)}>
                    💬 {p.reply_count} {p.reply_count === 1 ? "reply" : "replies"}
                  </button>
                </div>
                {replyOpen === p.id && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && reply(p.id)}
                      placeholder="Write a reply…"
                      className="flex-1 rounded-full border border-line bg-paper px-3 py-2 font-body text-[12.5px] text-ink outline-none"
                    />
                    <button onClick={() => reply(p.id)} disabled={pending} className="rounded-full bg-primary px-4 font-body text-[12.5px] font-bold text-white disabled:opacity-50">
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
