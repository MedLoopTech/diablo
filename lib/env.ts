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
