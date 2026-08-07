import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { isAdminRole } from "@/lib/roles";

type MealItem = { meal: string; description: string; carb_target_g: number | null };

/**
 * Nutritionist-only meal-plan endpoint — the diet-plan mirror of /api/medication.
 * Non-nutritionists get 403 (belt); RLS (is_pod_nutritionist) blocks the write
 * regardless (suspenders). Every write fires the meal-plan audit trigger.
 */
export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? "patient";
  if (role !== "nutritionist" && !isAdminRole(role)) {
    return NextResponse.json({ error: "Only a nutritionist can edit meal plans." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    patient_id?: string;
    meals?: MealItem[];
    notes?: string;
  };
  if (!body.patient_id || !Array.isArray(body.meals)) {
    return NextResponse.json({ error: "patient_id and meals required" }, { status: 400 });
  }

  const fields = {
    meals: body.meals,
    notes: body.notes ?? null,
    effective_from: new Date().toISOString().slice(0, 10),
  };

  const { data: existing } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("patient_id", body.patient_id)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  const res = existing
    ? await supabase.from("meal_plans").update(fields).eq("id", existing.id).select("id").single()
    : await supabase
        .from("meal_plans")
        .insert({ patient_id: body.patient_id, created_by: user.id, ...fields })
        .select("id")
        .single();

  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 403 });
  return NextResponse.json({ ok: true, id: res.data.id });
}
