import webpush from "web-push";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@sehat90.app";

let configured = false;
function ensureConfigured() {
  if (!configured && VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
    configured = true;
  }
}

export type PushPayload = { title: string; body: string; url?: string };

export async function sendPush(
  subscription: { endpoint: string; p256dh: string; auth_key: string },
  payload: PushPayload
): Promise<boolean> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  ensureConfigured();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth_key },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch {
    return false;
  }
}

/** Send to all subscriptions for a patient. Returns count sent. */
export async function sendPushToPatient(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  patientId: string,
  payload: PushPayload
): Promise<number> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return 0;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const { data } = (await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("patient_id", patientId)) as { data: { endpoint: string; p256dh: string; auth_key: string }[] | null };
  const subs = data ?? [];
  const results = await Promise.allSettled(subs.map((s) => sendPush(s, payload)));
  return results.filter((r) => r.status === "fulfilled" && r.value).length;
}

export function vapidConfigured(): boolean {
  return Boolean(VAPID_PUBLIC && VAPID_PRIVATE);
}
