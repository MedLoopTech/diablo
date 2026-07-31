/**
 * Apply pending migrations to the remote Supabase project.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxxx node scripts/apply-migrations.mjs
 *
 * Get your personal access token at: https://supabase.com/dashboard/account/tokens
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Error: SUPABASE_ACCESS_TOKEN env var required.");
  console.error("  Get one at: https://supabase.com/dashboard/account/tokens");
  console.error("  Then run: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-migrations.mjs");
  process.exit(1);
}

const PROJECT_REF = "xbbrrhxwdycdntnjdqvh";
const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const __dir = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = [
  "00000000000029_glucose_review_notes.sql",
  "00000000000030_patient_weekly_reviews.sql",
  "00000000000032_medical_intake.sql",
];

for (const file of MIGRATIONS) {
  const sql = readFileSync(join(__dir, "../supabase/migrations", file), "utf8");
  console.log(`\nApplying ${file}…`);
  const resp = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    console.error(`  FAILED (${resp.status}): ${body}`);
  } else {
    console.log("  ✓ Applied.");
  }
}
console.log("\nDone. Now re-run the seed: node scripts/seed.mjs");
