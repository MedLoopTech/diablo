/**
 * Single source of truth for "is this environment actually configured?".
 *
 * .env.local ships with placeholder values, and a half-filled file is the
 * common state during setup. Treating a placeholder as a real value sends
 * requests with bogus credentials, which fails in confusing ways — so every
 * getter here returns null unless the value is genuinely set.
 */

const PLACEHOLDERS = new Set([
  "your-anon-key",
  "your-service-role-key",
  "sk-ant-...",
  "your-gemini-key",
]);

function real(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (PLACEHOLDERS.has(trimmed)) return null;
  if (trimmed.includes("YOUR-PROJECT")) return null;
  return trimmed;
}

// NEXT_PUBLIC_* must be referenced statically so Next.js can inline them
// into the client bundle at build time.
export function supabaseUrl(): string | null {
  return real(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabaseAnonKey(): string | null {
  return real(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function serviceRoleKey(): string | null {
  return real(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function anthropicKey(): string | null {
  return real(process.env.ANTHROPIC_API_KEY);
}

export function geminiKey(): string | null {
  return real(process.env.GEMINI_API_KEY);
}

/**
 * Which AI provider to use. Production default is Anthropic (the decided stack);
 * set AI_PROVIDER=gemini in .env.local for free interactive dev testing;
 * set AI_PROVIDER=ollama + OLLAMA_BASE_URL for self-hosted (Pakistan PDPB compliant).
 */
export function aiProvider(): "anthropic" | "gemini" | "ollama" {
  const v = process.env.AI_PROVIDER;
  if (v === "gemini") return "gemini";
  if (v === "ollama") return "ollama";
  return "anthropic";
}

/**
 * Whether /demo and /api/demo-login exist. Those sign into a seeded account
 * with no password, so the demo-login route's own docstring already promised
 * it was "DISABLED in production" — nothing actually enforced that, so this
 * makes the code match the contract.
 *
 * Off in production, on everywhere else. Set DEMO_MODE=true to deliberately
 * re-enable it on a production build (a sales/demo deployment), or
 * DEMO_MODE=false to force it off anywhere.
 */
export function demoModeEnabled(): boolean {
  const flag = process.env.DEMO_MODE;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

/** True only when both values needed for any Supabase call are present. */
export function supabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/** Throws with an actionable message — use at call sites that cannot degrade. */
export function requireSupabase(): { url: string; anonKey: string } {
  const url = supabaseUrl();
  const anonKey = supabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local — see README.md."
    );
  }
  return { url, anonKey };
}
