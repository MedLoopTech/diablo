import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ messages: [] });

  const { data } = await supabase
    .from("chat_messages")
    .select("id, sender, body, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: true })
    .limit(100);

  return NextResponse.json({ messages: data ?? [] });
}
