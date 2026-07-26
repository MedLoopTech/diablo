import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { vapidConfigured } from "@/lib/push";

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as {
    endpoint?: string; keys?: { p256dh?: string; auth?: string };
  };
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }

  await supabase.from("push_subscriptions").upsert(
    { patient_id: user.id, endpoint: body.endpoint, p256dh: body.keys.p256dh, auth_key: body.keys.auth },
    { onConflict: "endpoint" }
  );

  return NextResponse.json({ ok: true, vapidConfigured: vapidConfigured() });
}

export async function DELETE(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { endpoint } = await request.json().catch(() => ({})) as { endpoint?: string };
  if (endpoint) await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("patient_id", user.id);

  return NextResponse.json({ ok: true });
}
