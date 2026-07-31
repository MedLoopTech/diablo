import { createClient } from "@supabase/supabase-js";

const url = "https://xbbrrhxwdycdntnjdqvh.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
if (!serviceKey) { console.error("SUPABASE_SERVICE_KEY required"); process.exit(1); }
const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// Find Sana (nutritionist) and Imran (patient)
const { data: sana } = await admin.from("profiles").select("id").eq("email", "demo.nutritionist@sehat90.app").maybeSingle();
const { data: imran } = await admin.from("profiles").select("id").eq("email", "demo.patient@sehat90.app").maybeSingle();
const { data: faisal } = await admin.from("profiles").select("id").eq("email", "demo.coach@sehat90.app").maybeSingle();

console.log("Nutritionist:", sana?.id);
console.log("Patient:", imran?.id);
console.log("Coach:", faisal?.id);

if (!sana || !imran) { console.error("Could not find users"); process.exit(1); }

// Insert a demo nutrition question escalation assigned to Sana
const { error: e1 } = await admin.from("escalations").insert({
  patient_id: imran.id,
  kind: "ai_routed",
  payload: {
    message: "Should I eat dal roti before or after exercise? My blood sugar keeps spiking after meals.",
    triage: { class: "route_nutritionist", confidence: 0.9, routed_to: "nutritionist", deterministic: false }
  },
  assigned_to: sana.id,
  status: "open",
});
if (e1) { console.error("Nutritionist escalation failed:", e1.message); } else { console.log("✓ Nutrition escalation inserted for Sana"); }

// Insert a demo movement question escalation assigned to coach
if (faisal) {
  const { data: bilal } = await admin.from("profiles").select("id").eq("full_name", "Bilal Tariq").maybeSingle();
  const patientId = bilal?.id ?? imran.id;
  const { error: e2 } = await admin.from("escalations").insert({
    patient_id: patientId,
    kind: "ai_routed",
    payload: {
      message: "My knees hurt when I do squats. Can I modify the movement plan?",
      triage: { class: "route_coach", confidence: 0.85, routed_to: "coach", deterministic: false }
    },
    assigned_to: faisal.id,
    status: "open",
  });
  if (e2) { console.error("Coach escalation failed:", e2.message); } else { console.log("✓ Movement escalation inserted for Faisal"); }
}
