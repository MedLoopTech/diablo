import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase, PHOTO_BUCKET } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/env";
import { getProvider } from "@/lib/ai/provider";
import { MEAL_SYSTEM } from "@/lib/ai/prompts";
import { parseJsonLoose, fileToBase64 } from "@/lib/ai/vision-json";

type MealAnalysis = {
  dish_guess: string;
  est_carbs_g: number;
  glycemic_load: "low" | "med" | "high";
  feedback_text: string;
  healthier_swap: string;
  confidence: number;
};

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("image");
  const mealType = String(form?.get("meal_type") ?? "lunch");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "image required" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { base64, mimeType, ext } = await fileToBase64(file);

  // Vision analysis.
  const provider = await getProvider();
  let analysis: MealAnalysis | null = null;
  try {
    const raw = await provider.vision({
      system: MEAL_SYSTEM,
      prompt: "Analyze this meal for a type-2 diabetes patient.",
      imageBase64: base64,
      mimeType,
      json: true,
    });
    analysis = parseJsonLoose<MealAnalysis>(raw);
  } catch (e) {
    return NextResponse.json(
      { error: "analysis failed", detail: e instanceof Error ? e.message : "unknown" },
      { status: 502 }
    );
  }
  if (!analysis) {
    return NextResponse.json({ error: "could not read analysis" }, { status: 502 });
  }

  // Store the photo (service role; path namespaced by user).
  const admin = createAdminSupabase();
  const path = `${user.id}/meals/${Date.now()}.${ext}`;
  await admin.storage
    .from(PHOTO_BUCKET)
    .upload(path, Buffer.from(base64, "base64"), { contentType: mimeType, upsert: false });

  // Persist the meal row as the patient (RLS enforces ownership).
  const { data: meal, error } = await supabase
    .from("meals")
    .insert({
      patient_id: user.id,
      meal_type: mealType,
      photo_url: path,
      ai_analysis: analysis,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ step: "insert", error: error.message }, { status: 500 });
  }

  const lowConfidence = (analysis.confidence ?? 0) < 0.5;
  return NextResponse.json({ id: meal.id, analysis, lowConfidence });
}
