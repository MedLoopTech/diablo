import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase, PHOTO_BUCKET } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/env";
import { getProvider } from "@/lib/ai/provider";
import { GLUCOSE_PHOTO_SYSTEM } from "@/lib/ai/prompts";
import { parseJsonLoose, fileToBase64 } from "@/lib/ai/vision-json";

type Reading = { value_mgdl: number | null; unit: string | null; confidence: number };

/**
 * Reads the number off a glucometer photo and stores the photo. Does NOT save a
 * glucose reading — it returns the read value for the patient to confirm or
 * correct first (a wrong auto-logged glucose value would be dangerous).
 */
export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "image required" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { base64, mimeType, ext } = await fileToBase64(file);

  const provider = await getProvider();
  let read: Reading | null = null;
  try {
    const raw = await provider.vision({
      system: GLUCOSE_PHOTO_SYSTEM,
      prompt: "Read the glucose value on this meter.",
      imageBase64: base64,
      mimeType,
      json: true,
    });
    read = parseJsonLoose<Reading>(raw);
  } catch (e) {
    return NextResponse.json(
      { error: "read failed", detail: e instanceof Error ? e.message : "unknown" },
      { status: 502 }
    );
  }

  // Store the photo regardless so it can be attached when the reading is saved.
  const admin = createAdminSupabase();
  const path = `${user.id}/glucometer/${Date.now()}.${ext}`;
  await admin.storage
    .from(PHOTO_BUCKET)
    .upload(path, Buffer.from(base64, "base64"), { contentType: mimeType, upsert: false });

  const value =
    read && typeof read.value_mgdl === "number" && read.value_mgdl > 0 && read.value_mgdl < 1000
      ? Math.round(read.value_mgdl)
      : null;

  return NextResponse.json({
    value,
    confidence: read?.confidence ?? 0,
    photoPath: path,
    // The client always shows this for the patient to confirm/correct.
    needsConfirm: true,
  });
}
