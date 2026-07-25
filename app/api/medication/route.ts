import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { isStaffRole } from "@/lib/roles";

type Medication = { name: string; dose: string; schedule: string };

/**
 * Doctor-only medication endpoint. SPEC/CLAUDE rule 1: only a doctor may create
 * or edit a medication plan. Non-doctors get 403 here (belt) and RLS blocks the
 * write regardless (suspenders). Every write fires the audit trigger.
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "patient";

  // 403 for any non-doctor (nutritionist/coach/patient included).
  if (role !== "doctor" && role !== "admin") {
    return NextResponse.json(
      { error: "Only a doctor can change medication plans." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    patient_id?: string;
    medications?: Medication[];
    effective_from?: string;
    notes?: string;
  };
  if (!body.patient_id || !Array.isArray(body.medications)) {
    return NextResponse.json({ error: "patient_id and medications required" }, { status: 400 });
  }

  const fields = {
    medications: body.medications,
    effective_from: body.effective_from || new Date().toISOString().slice(0, 10),
    notes: body.notes ?? null,
  };

  // Update the current plan if one exists, else create it. Either way RLS
  // enforces pod-doctor ownership and the trigger writes the audit row.
  const { data: existing } = await supabase
    .from("medication_plans")
    .select("id")
    .eq("patient_id", body.patient_id)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  const res = existing
    ? await supabase.from("medication_plans").update(fields).eq("id", existing.id).select("id").single()
    : await supabase
        .from("medication_plans")
        .insert({ patient_id: body.patient_id, created_by: user.id, ...fields })
        .select("id")
        .single();

  if (res.error) {
    // RLS denial surfaces here for a non-pod doctor.
    return NextResponse.json({ error: res.error.message }, { status: 403 });
  }
  return NextResponse.json({ ok: true, id: res.data.id });
}
