import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase, PHOTO_BUCKET } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/env";
import { fileToBase64 } from "@/lib/ai/vision-json";
import { z } from "zod";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const taskId = z.string().uuid().safeParse(params.id);
  if (!taskId.success) {
    return NextResponse.json({ error: "invalid task id" }, { status: 400 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "image required" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or HEIC images are accepted." },
      { status: 415 }
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image must be under 5 MB." },
      { status: 413 }
    );
  }

  const { base64, mimeType, ext } = await fileToBase64(file);

  // Store photo under a task-namespaced path.
  const admin = createAdminSupabase();
  const path = `${user.id}/tasks/${taskId.data}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await admin.storage
    .from(PHOTO_BUCKET)
    .upload(path, Buffer.from(base64, "base64"), {
      contentType: mimeType,
      upsert: false,
    });
  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  // Record evidence, complete task, award bonus — all in one security-definer fn.
  const { error: rpcErr } = await supabase.rpc("set_task_evidence", {
    task_id: taskId.data,
    url: path,
  });
  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 });
  }

  // Return a short-lived signed URL so the client can display a thumbnail immediately.
  const { data: signed } = await admin.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(path, 3600);

  return NextResponse.json({ ok: true, path, signedUrl: signed?.signedUrl ?? null });
}
