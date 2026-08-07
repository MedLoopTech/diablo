import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { isAdminRole } from "@/lib/roles";

type MovementExercise = {
  name: string;
  category: string;
  duration_min: number | null;
  sets: number | null;
  reps: string | null;
  notes: string | null;
};

/**
 * Coach-only movement-plan endpoint — the exercise mirror of /api/meal-plan.
 * Non-coaches get 403 (belt); RLS (is_pod_coach) blocks the write regardless
 * (suspenders). Every write fires the movement-plan audit trigger.
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
  if (role !== "coach" && !isAdminRole(role)) {
    return NextResponse.json({ error: "Only a fitness coach can edit movement plans." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    patient_id?: string;
    exercises?: MovementExercise[];
    notes?: string;
  };
  if (!body.patient_id || !Array.isArray(body.exercises)) {
    return NextResponse.json({ error: "patient_id and exercises required" }, { status: 400 });
  }

  const fields = {
    exercises: body.exercises,
    notes: body.notes ?? null,
    effective_from: new Date().toISOString().slice(0, 10),
  };

  const { data: existing } = await supabase
    .from("movement_plans")
    .select("id")
    .eq("patient_id", body.patient_id)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  const res = existing
    ? await supabase.from("movement_plans").update(fields).eq("id", existing.id).select("id").single()
    : await supabase
        .from("movement_plans")
        .insert({ patient_id: body.patient_id, created_by: user.id, ...fields })
        .select("id")
        .single();

  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 403 });
  return NextResponse.json({ ok: true, id: res.data.id });
}
