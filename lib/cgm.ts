/**
 * Freestyle Libre / LibreView CGM integration.
 *
 * Uses the LibreLinkUp API — the same endpoints used by Abbott's own
 * LibreLinkUp mobile app for sharing CGM readings. This is an unofficial
 * (but stable) API; for production scale, replace with the official
 * Abbott developer API once a partnership is established.
 *
 * Patient flow:
 *   1. Patient installs LibreLink (Abbott) on their phone.
 *   2. Patient adds Loop90 as a "connection" in LibreLinkUp (or themselves).
 *   3. Patient enters their LibreView credentials in the app.
 *   4. We auth once, store the encrypted token, and sync every 15 min.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// ── Encryption ────────────────────────────────────────────────────────────────
// CGM_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

function getKey(): Buffer {
  const hex = process.env.CGM_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) throw new Error("CGM_ENCRYPTION_KEY must be 64 hex chars");
  return Buffer.from(hex, "hex");
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptToken(ciphertext: string): string {
  const key = getKey();
  const buf = Buffer.from(ciphertext, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

// ── LibreView API client ──────────────────────────────────────────────────────

const LIBRE_API = "https://api.libreview.io";
const LIBRE_HEADERS = {
  "Content-Type": "application/json",
  "product": "llu.android",
  "version": "4.7",
  "Accept-Encoding": "gzip",
};

export type LibreAuth = {
  token: string;
  userId: string;
  expiresAt: Date;
};

export async function libreLogin(email: string, password: string): Promise<LibreAuth> {
  const res = await fetch(`${LIBRE_API}/lsl/api/login`, {
    method: "POST",
    headers: LIBRE_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();

  // LibreView may return a redirect to a regional server
  if (json.status === 2 && json.data?.redirect) {
    const regionalApi = `https://${json.data.region}.libreview.io`;
    const res2 = await fetch(`${regionalApi}/lsl/api/login`, {
      method: "POST",
      headers: LIBRE_HEADERS,
      body: JSON.stringify({ email, password }),
    });
    return parseLoginResponse(await res2.json());
  }

  return parseLoginResponse(json);
}

function parseLoginResponse(json: Record<string, unknown>): LibreAuth {
  const ticket = (json.data as Record<string, Record<string, unknown>>)?.authTicket;
  const user = (json.data as Record<string, Record<string, unknown>>)?.user;
  if (!ticket?.token) throw new Error("LibreView login failed — check credentials");
  return {
    token: ticket.token as string,
    userId: (user?.id as string) ?? "",
    expiresAt: new Date(Date.now() + (ticket.duration as number) * 1000),
  };
}

export type LibreReading = {
  takenAt: Date;
  valueMgdl: number;
};

export async function libreGetReadings(
  token: string,
  patientId: string
): Promise<LibreReading[]> {
  const res = await fetch(`${LIBRE_API}/lsl/api/connections/${patientId}/graph`, {
    headers: { ...LIBRE_HEADERS, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`LibreView graph fetch failed: ${res.status}`);
  const json = await res.json();

  const measurements: unknown[] =
    (json.data as Record<string, unknown[]>)?.graphData ?? [];

  return measurements
    .map((m) => {
      const reading = m as Record<string, unknown>;
      // LibreView returns ValueInMgPerDl always in mg/dL regardless of user's display unit
      const mgdl = reading.ValueInMgPerDl as number | undefined;
      const ts = reading.Timestamp as string | undefined;
      if (!mgdl || !ts) return null;
      return { takenAt: new Date(ts + " UTC"), valueMgdl: Math.round(mgdl) };
    })
    .filter(Boolean) as LibreReading[];
}

export async function libreGetConnections(token: string): Promise<string[]> {
  const res = await fetch(`${LIBRE_API}/lsl/api/connections`, {
    headers: { ...LIBRE_HEADERS, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = await res.json();
  const connections = (json.data as Record<string, unknown>[]) ?? [];
  return connections.map((c) => c.patientId as string).filter(Boolean);
}
