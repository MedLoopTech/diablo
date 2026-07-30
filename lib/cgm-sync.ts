/**
 * Shared CGM sync logic used by both the per-patient API route
 * and the cron job that sweeps all active connections.
 */
import { createAdminSupabase } from "@/lib/supabase/admin";
import { decryptToken, libreGetReadings } from "@/lib/cgm";

export type SyncResult = {
  inserted: number;
  error?: string;
};

export async function syncCgmConnection(connectionId: string): Promise<SyncResult> {
  const admin = createAdminSupabase();

  const { data: conn } = await admin
    .from("cgm_connections")
    .select("id, patient_id, provider_user_id, auth_token_enc, token_expires_at")
    .eq("id", connectionId)
    .eq("active", true)
    .single();

  if (!conn) return { inserted: 0, error: "Connection not found" };

  // Check token expiry
  if (conn.token_expires_at && new Date(conn.token_expires_at) < new Date()) {
    await admin
      .from("cgm_connections")
      .update({ active: false, error_message: "Token expired — please reconnect." })
      .eq("id", connectionId);
    return { inserted: 0, error: "Token expired" };
  }

  let token: string;
  try {
    token = decryptToken(conn.auth_token_enc);
  } catch {
    return { inserted: 0, error: "Failed to decrypt token" };
  }

  // Fetch readings from LibreView
  let readings;
  try {
    readings = await libreGetReadings(token, conn.provider_user_id ?? "");
  } catch (e) {
    const msg = (e as Error).message;
    await admin
      .from("cgm_connections")
      .update({ error_message: msg })
      .eq("id", connectionId);
    return { inserted: 0, error: msg };
  }

  if (!readings.length) {
    await admin
      .from("cgm_connections")
      .update({ last_synced_at: new Date().toISOString(), error_message: null })
      .eq("id", connectionId);
    return { inserted: 0 };
  }

  // Upsert into glucose_readings — taken_at + patient_id is our natural dedup key.
  // We don't have a DB unique constraint on (patient_id, taken_at) so we fetch
  // existing CGM readings in the window and skip duplicates.
  const oldest = readings.reduce((a, b) => (a.takenAt < b.takenAt ? a : b)).takenAt;

  const { data: existing } = await admin
    .from("glucose_readings")
    .select("taken_at")
    .eq("patient_id", conn.patient_id)
    .eq("source", "cgm")
    .gte("taken_at", oldest.toISOString());

  const existingSet = new Set((existing ?? []).map((r) => r.taken_at));

  const toInsert = readings
    .filter((r) => !existingSet.has(r.takenAt.toISOString()))
    .map((r) => ({
      patient_id: conn.patient_id,
      value_mgdl: r.valueMgdl,
      context: "random" as const,
      source: "cgm" as const,
      taken_at: r.takenAt.toISOString(),
    }));

  if (toInsert.length === 0) {
    await admin
      .from("cgm_connections")
      .update({ last_synced_at: new Date().toISOString(), error_message: null })
      .eq("id", connectionId);
    return { inserted: 0 };
  }

  const { error: insertErr } = await admin.from("glucose_readings").insert(toInsert);
  if (insertErr) return { inserted: 0, error: insertErr.message };

  await admin.from("cgm_connections").update({
    last_synced_at: new Date().toISOString(),
    readings_synced: (conn as unknown as { readings_synced?: number }).readings_synced ?? 0 + toInsert.length,
    error_message: null,
  }).eq("id", connectionId);

  return { inserted: toInsert.length };
}
