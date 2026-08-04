import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireSupabase, serviceRoleKey } from "@/lib/env";

/**
 * Service-role client — bypasses RLS. Server-only; never import from a client
 * component. Used for privileged operations like Storage writes and signed URLs
 * that are gated by our own session checks at the call site.
 */
export function createAdminSupabase() {
  const { url } = requireSupabase();
  const key = serviceRoleKey();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — see README.md.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const PHOTO_BUCKET = "patient-photos";
export const VOICE_BUCKET = "voice-notes";
