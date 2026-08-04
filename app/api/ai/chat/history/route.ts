import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase, VOICE_BUCKET } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ messages: [] });

  const { data } = await supabase
    .from("chat_messages")
    .select("id, sender, body, audio_path, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: true })
    .limit(100);

  const rows = data ?? [];
  const withAudio = rows.filter((m) => m.audio_path);
  if (withAudio.length === 0) return NextResponse.json({ messages: rows });

  const admin = createAdminSupabase();
  const signedByPath = new Map<string, string | null>();
  await Promise.all(
    withAudio.map(async (m) => {
      const { data: signed } = await admin.storage.from(VOICE_BUCKET).createSignedUrl(m.audio_path!, 3600);
      signedByPath.set(m.audio_path!, signed?.signedUrl ?? null);
    })
  );

  const messages = rows.map((m) => ({
    ...m,
    signedAudioUrl: m.audio_path ? signedByPath.get(m.audio_path) ?? null : null,
  }));
  return NextResponse.json({ messages });
}
