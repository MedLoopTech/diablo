// Sehat/90 demo seed. Creates a realistic active cohort (day ~34) with a full
// care pod, 6 patients, and ~5 weeks of data so the app looks like the
// prototype. Idempotent: clears the prior seed first.
//
//   node scripts/seed.mjs
//
// Reads Supabase creds from .env.local (service role key required). Safe to
// re-run. Prints demo account emails at the end.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const COHORT_NAME = "Sunrise cohort";
const START_DAYS_AGO = 33; // -> cohort day 34 today

const STAFF = [
  { email: "demo.doctor@sehat90.app", role: "doctor", name: "Dr. Ayesha Rahman" },
  { email: "demo.nutritionist@sehat90.app", role: "nutritionist", name: "Sana Iqbal" },
  { email: "demo.coach@sehat90.app", role: "coach", name: "Faisal Khan" },
  { email: "demo.admin@sehat90.app", role: "admin", name: "Program Admin" },
];
const PATIENTS = [
  { email: "demo.imran@sehat90.app", name: "Imran Ali", baseHba1c: 8.2, baseWeight: 86.2, lead: true },
  { email: "demo.nadia@sehat90.app", name: "Nadia Saeed", baseHba1c: 7.9, baseWeight: 72.4 },
  { email: "demo.bilal@sehat90.app", name: "Bilal Tariq", baseHba1c: 8.6, baseWeight: 94.1 },
  { email: "demo.hina@sehat90.app", name: "Hina Raza", baseHba1c: 7.5, baseWeight: 68.9 },
  { email: "demo.usman@sehat90.app", name: "Usman Sheikh", baseHba1c: 9.1, baseWeight: 101.3 },
  { email: "demo.fatima@sehat90.app", name: "Fatima Noor", baseHba1c: 7.7, baseWeight: 64.7 },
];

const dayISO = (daysAgo, hour = 8, min = 0) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour - 5, min, 0, 0); // Karachi hour -> UTC
  return d.toISOString();
};
const dateOnly = (daysAgo) => dayISO(daysAgo, 12).slice(0, 10);
const rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));

async function ensureUser(email, role, name) {
  const { data: list } = await admin.auth.admin.listUsers();
  let u = list.users.find((x) => x.email === email);
  if (!u) u = (await admin.auth.admin.createUser({ email, email_confirm: true })).data.user;
  await admin.from("profiles").update({ role, full_name: name }).eq("id", u.id);
  return u;
}

async function clearSeed() {
  const { data: list } = await admin.auth.admin.listUsers();
  for (const u of list.users) {
    if (u.email?.endsWith("@sehat90.app")) await admin.auth.admin.deleteUser(u.id); // cascades most rows
  }
  await admin.from("cohorts").delete().eq("name", COHORT_NAME);
}

async function seed() {
  console.log("Clearing prior seed…");
  await clearSeed();

  console.log("Creating staff + patients…");
  const staff = {};
  for (const s of STAFF) staff[s.role] = await ensureUser(s.email, s.role, s.name);
  const patients = [];
  for (const p of PATIENTS) patients.push({ ...p, user: await ensureUser(p.email, "patient", p.name) });

  console.log("Cohort, memberships, pod…");
  const { data: cohort } = await admin.from("cohorts")
    .insert({ name: COHORT_NAME, start_date: dateOnly(START_DAYS_AGO), status: "active" })
    .select("id").single();
  for (const p of patients) {
    await admin.from("cohort_members").insert({
      cohort_id: cohort.id, patient_id: p.user.id,
      baseline_hba1c: p.baseHba1c, baseline_weight_kg: p.baseWeight,
      baseline_fasting_glucose: rint(140, 165),
    });
  }
  await admin.from("care_pods").insert({
    cohort_id: cohort.id,
    doctor_id: staff.doctor.id, nutritionist_id: staff.nutritionist.id, coach_id: staff.coach.id,
  });

  console.log("Consult windows…");
  await admin.from("consult_windows").insert([
    { staff_id: staff.doctor.id, date: dateOnly(0), start_time: "12:30:00", end_time: "13:00:00", slot_minutes: 10 },
    { staff_id: staff.doctor.id, date: dateOnly(0), start_time: "16:00:00", end_time: "16:30:00", slot_minutes: 10 },
  ]);

  console.log("Readings, meals, tasks…");
  for (let pi = 0; pi < patients.length; pi++) {
    const p = patients[pi];
    // 34 days of readings, trending down. Lead patient a touch higher early.
    const readings = [];
    for (let d = START_DAYS_AGO; d >= 0; d--) {
      const progress = (START_DAYS_AGO - d) / START_DAYS_AGO; // 0 -> 1
      const fastBase = 150 - progress * 30 + (p.lead ? 5 : 0);
      const fasting = Math.max(85, Math.round(fastBase + rint(-8, 8)));
      const postBase = 175 - progress * 25;
      const post = Math.max(110, Math.round(postBase + rint(-12, 18)));
      readings.push({ patient_id: p.user.id, value_mgdl: fasting, context: "fasting", taken_at: dayISO(d, 7, rint(0, 40)) });
      readings.push({ patient_id: p.user.id, value_mgdl: post, context: "post_meal", taken_at: dayISO(d, 14, rint(0, 50)) });
    }
    // Insert in chunks (trigger fires per row -> flags, escalations, points).
    for (let i = 0; i < readings.length; i += 100) {
      await admin.from("glucose_readings").insert(readings.slice(i, i + 100));
    }
    // A couple of analyzed meals.
    await admin.from("meals").insert([
      { patient_id: p.user.id, meal_type: "lunch", eaten_at: dayISO(1, 13),
        ai_analysis: { dish_guess: "Chicken karahi + white rice", est_carbs_g: 62, glycemic_load: "high",
          feedback_text: "High glycemic load from the rice.", healthier_swap: "Half rice + salad.", confidence: 0.9 } },
      { patient_id: p.user.id, meal_type: "dinner", eaten_at: dayISO(0, 20),
        ai_analysis: { dish_guess: "Daal + sabzi + roti", est_carbs_g: 38, glycemic_load: "med",
          feedback_text: "Balanced, good fibre.", healthier_swap: "Add a side of yoghurt.", confidence: 0.85 } },
    ]);
    // Completed tasks to build streaks (>=2 done/day + a reading exists). Vary
    // streak length per patient so the leaderboard isn't a tie.
    const streakDays = [8, 5, 6, 3, 7, 4][pi] ?? 5;
    for (let d = streakDays - 1; d >= 0; d--) {
      const cohortDay = START_DAYS_AGO - d + 1;
      await admin.from("tasks").insert([
        { patient_id: p.user.id, for_date: dateOnly(d), cohort_day: cohortDay, kind: "glucose", title: "Log fasting glucose", subtitle: "Track the morning trend", done_at: dayISO(d, 7, 30) },
        { patient_id: p.user.id, for_date: dateOnly(d), cohort_day: cohortDay, kind: "walk", title: "30-min movement target", subtitle: "Any brisk activity counts", done_at: dayISO(d, 17) },
        { patient_id: p.user.id, for_date: dateOnly(d), cohort_day: cohortDay, kind: "glucose", title: "Evening glucose reading", subtitle: "Two hours after dinner", done_at: d > 0 ? dayISO(d, 21) : null },
      ]);
    }
    // A challenge bonus so leaderboard totals differ.
    await admin.from("points_ledger").insert({ patient_id: p.user.id, points: rint(20, 320), reason: "challenge" });
    // One patient gets a recent urgent spike so the demo shows the urgent flow
    // (escalation to the doctor + an urgent notification).
    if (pi === 2) {
      await admin.from("glucose_readings").insert({ patient_id: p.user.id, value_mgdl: 254, context: "post_meal", taken_at: dayISO(0, 15) });
    }
    // Weekly weigh-ins trending down (real logged data, not a fabricated delta).
    const totalLoss = 4.8 - pi * 0.4; // varies per patient
    for (let w = 0; w <= 4; w++) {
      await admin.from("weigh_ins").insert({
        patient_id: p.user.id,
        weight_kg: Math.round((p.baseWeight - (totalLoss * w) / 4 + rint(-3, 3) / 10) * 10) / 10,
        taken_at: dayISO(28 - w * 7, 7),
      });
    }
    // A weekly progress snapshot rollup.
    await admin.from("progress_snapshots").insert({
      patient_id: p.user.id, week: 5,
      weight_kg: Math.round((p.baseWeight - totalLoss) * 10) / 10,
      est_hba1c: Math.round((p.baseHba1c - 1.2) * 10) / 10,
    });
  }

  console.log("Feed posts + reactions…");
  const lead = patients[0], nadia = patients[1];
  const { data: post1 } = await admin.from("posts")
    .insert({ cohort_id: cohort.id, author_id: nadia.user.id, body: "Fasting 108 today — first time under 110 in 6 years. This cohort is everything 🥹" })
    .select("id").single();
  await admin.from("posts").insert({ cohort_id: cohort.id, author_id: patients[3].user.id, body: "Anyone else walking after dinner? The evening numbers really do drop." });
  for (const p of [lead, patients[2], patients[4], patients[5]]) {
    await admin.from("post_reactions").insert({ post_id: post1.id, user_id: p.user.id, emoji: "❤️" });
  }
  await admin.from("post_replies").insert({ post_id: post1.id, author_id: lead.user.id, body: "So happy for you Nadia! 🎉" });

  console.log("Today's tasks + medication plan…");
  for (const p of patients) {
    await admin.rpc("ensure_daily_tasks", { p: p.user.id });
  }
  // Mark 2 of the lead patient's tasks today done (nice "2/4 done" + keeps streak).
  const { data: todays } = await admin.from("tasks").select("id").eq("patient_id", lead.user.id).eq("for_date", dateOnly(0)).limit(2);
  for (const t of todays ?? []) await admin.from("tasks").update({ done_at: dayISO(0, 9) }).eq("id", t.id);

  // A doctor-authored medication plan for the lead patient (fires audit trigger).
  await admin.from("medication_plans").insert({
    patient_id: lead.user.id, created_by: staff.doctor.id,
    medications: [{ name: "Metformin", dose: "1000mg", schedule: "twice daily with meals" }],
    effective_from: dateOnly(20), notes: "Day-45 review scheduled.",
  });

  // A nutritionist-authored meal plan for the lead patient (fires audit trigger).
  await admin.from("meal_plans").insert({
    patient_id: lead.user.id, created_by: staff.nutritionist.id,
    meals: [
      { meal: "breakfast", description: "2 egg omelette + 1 whole-wheat roti + tea (no sugar)", carb_target_g: 25 },
      { meal: "lunch", description: "Chicken/daal + 1 roti + big salad + yoghurt", carb_target_g: 40 },
      { meal: "dinner", description: "Sabzi + 1 roti or half-cup brown rice + salad", carb_target_g: 35 },
      { meal: "snack", description: "Handful of nuts or an apple", carb_target_g: 15 },
    ],
    effective_from: dateOnly(18),
    notes: "Keep rice to post-walk days. Water before every meal. Aim ~115g carbs/day.",
  });

  console.log("Resource library…");
  await admin.from("resources").insert([
    {
      title: "Life Without Diabetes",
      type: "book",
      description: "Prof. Roy Taylor's research on diabetes remission through calorie restriction — the science this program is built on.",
      url: "https://www.amazon.com/Life-Without-Diabetes-Definitive-Remission/dp/0349422001",
      tags: ["science", "remission", "nutrition", "calorie-restriction"],
    },
    {
      title: "The Diabetes Code",
      type: "book",
      description: "Dr. Jason Fung explains why type 2 diabetes is a dietary disease and how fasting and low-carb eating reverse it.",
      url: "https://www.amazon.com/Diabetes-Code-Prevent-Reverse-Naturally/dp/1771642653",
      tags: ["science", "remission", "fasting", "low-carb", "nutrition"],
    },
    {
      title: "DiRECT Trial: Diabetes Remission through Dietary Intervention",
      type: "research",
      description: "Landmark UK clinical trial — 46% of participants achieved full remission at 1 year through a structured low-calorie diet. The evidence behind this program.",
      url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(17)33102-1/fulltext",
      tags: ["science", "remission", "clinical-trial", "weight-loss", "calorie-restriction"],
    },
    {
      title: "Post-Meal Walking: Lower Blood Sugar in 10 Minutes",
      type: "article",
      description: "A 10-minute walk after eating can cut postprandial glucose by up to 22%. Learn when and how to make it a habit that stacks with your meal plan.",
      url: null,
      tags: ["exercise", "glucose", "lifestyle", "walking"],
    },
    {
      title: "30-Minute Morning Walk Plan (Weeks 1–12)",
      type: "exercise_plan",
      description: "Week-by-week progression: start at 10 min easy, build to 30 min brisk. Best done fasted. Each 5 mg/dL drop in fasting glucose adds years — this is how.",
      url: null,
      tags: ["exercise", "walking", "morning", "glucose", "lifestyle"],
    },
    {
      title: "Bodyweight Circuit for Blood Sugar Control",
      type: "exercise_plan",
      description: "Squats, push-ups, plank, lunges — 3×/week, no gym. Muscle is the body's largest glucose sink. More muscle = better insulin sensitivity. Beginner-friendly.",
      url: null,
      tags: ["exercise", "strength", "muscle", "glucose", "insulin"],
    },
    {
      title: "Understanding the Glycemic Index for Pakistani Foods",
      type: "video",
      description: "Clear explanation of GI vs glycemic load and how roti, rice, daal, and common Pakistani foods rank — so you can make smarter swaps.",
      url: "https://www.youtube.com/watch?v=XTZpJY4O0bk",
      tags: ["nutrition", "glycemic-index", "glucose", "education", "pakistan"],
    },
    {
      title: "Low-Carb Pakistani Recipes (5 Favourites)",
      type: "recipe",
      description: "Daal, sabzi, and egg dishes adapted for lower carb — same flavour and spice, better glucose response. Includes portion guidance and carb counts.",
      url: null,
      tags: ["recipes", "nutrition", "low-carb", "pakistan", "education"],
    },
    {
      title: "Stress, Cortisol & Blood Sugar",
      type: "article",
      description: "Cortisol raises blood glucose even when you haven't eaten. Learn how chronic stress sabotages glucose control and 3 practical techniques to break the cycle.",
      url: null,
      tags: ["lifestyle", "stress", "cortisol", "glucose", "mindset"],
    },
    {
      title: "Reading Pakistani Food Labels",
      type: "article",
      description: "How to decode packaged-food labels — total carbs vs sugar vs fibre, serving sizes, hidden starches, and what 'sugar-free' actually means in Pakistan.",
      url: null,
      tags: ["nutrition", "food-labels", "education", "pakistan", "carbs"],
    },
  ]);

  console.log("\nDone. Demo accounts (all @sehat90.app):");
  for (const s of STAFF) console.log(`  ${s.role.padEnd(12)} ${s.email}  (${s.name})`);
  console.log(`  patient      ${PATIENTS[0].email}  (${PATIENTS[0].name}, lead)`);
  for (const p of PATIENTS.slice(1)) console.log(`  patient      ${p.email}  (${p.name})`);
}

seed().catch((e) => { console.error("SEED FAILED:", e.message); process.exit(1); });
