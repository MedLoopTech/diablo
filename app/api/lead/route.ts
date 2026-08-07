import { NextResponse } from "next/server";
import { loadConfig, interpolate } from "@/lib/automation";
import { sendWhatsApp, sendTelegram } from "@/lib/notify";
import { createAdminSupabase } from "@/lib/supabase/admin";

// These mirror the CHECK constraints on public.leads. Anything not in the
// allowed set falls back to the default rather than failing the insert —
// a marketing form should never lose a real lead over a bad UTM tag.
const PERSONAS = ["patient", "prediabetic_family", "doctor", "nutritionist_coach", "pharma_corporate"] as const;
const INTERESTS = ["general", "guide", "enrollment", "partnership", "clinic"] as const;
const LANGUAGES = ["en", "ur"] as const;

function oneOf<T extends readonly string[]>(value: string, allowed: T, fallback: T[number]): T[number] {
  return (allowed as readonly string[]).includes(value) ? (value as T[number]) : fallback;
}

/** Attribution values are attacker-controlled free text — cap them so a huge
 *  querystring can't bloat the row. */
function tag(value: unknown, max = 200): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, max);
  return v.length ? v : null;
}

// Public endpoint — called from the website contact/interest form.
// No auth required; validates input before acting.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const rawPhone = String(body.phone ?? "").replace(/\D/g, "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const interest = oneOf(String(body.interest ?? "general").trim(), INTERESTS, "general");
  const persona = oneOf(String(body.persona ?? "patient").trim(), PERSONAS, "patient");
  const preferredLanguage = oneOf(String(body.preferredLanguage ?? "en").trim(), LANGUAGES, "en");
  const source = tag(body.source) ?? "website";

  // Normalize Pakistani phone to international format (no +).
  let phone = rawPhone;
  if (phone.startsWith("0")) phone = "92" + phone.slice(1);
  else if (!phone.startsWith("92")) phone = "92" + phone;

  if (name.length < 2 || phone.length < 11 || phone.length > 15) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid name and Pakistani phone number." },
      { status: 400 }
    );
  }

  // PDPB treats health-adjacent personal data as sensitive — only record
  // consent as given when the form actually said so.
  const consentMarketing = body.consentMarketing === true;

  const cfg = await loadConfig();

  const waMsg = interpolate(cfg.msg_lead_welcome_wa ?? "{name} — thanks for your interest in Loop/90!", {
    name,
    guide_url: cfg.guide_url ?? "https://sehat90.com/guide",
  });

  const campaign = tag(body.utmCampaign);
  const tgMsg =
    `*New Lead — Loop/90*\n\nName: ${name}\nPhone: +${phone}\nEmail: ${email || "—"}\n` +
    `Persona: ${persona}\nInterest: ${interest}\nSource: ${source}` +
    (campaign ? `\nCampaign: ${campaign}` : "");

  // Fire both notifications concurrently — don't block the HTTP response on either.
  const [waResult, tgResult] = await Promise.allSettled([
    sendWhatsApp(phone, waMsg),
    sendTelegram(cfg.notify_ops_telegram_chat_id ?? "", tgMsg),
  ]);

  // Persist regardless of notification outcome — a failed/unconfigured send
  // must not mean the lead is lost with no record.
  const admin = createAdminSupabase();
  const { error: insertError } = await admin.from("leads").insert({
    name,
    phone,
    email: email || null,
    persona,
    interest,
    source,
    utm_source: tag(body.utmSource),
    utm_medium: tag(body.utmMedium),
    utm_campaign: campaign,
    referrer: tag(body.referrer, 500),
    landing_path: tag(body.landingPath, 500),
    content_asset: tag(body.contentAsset),
    preferred_language: preferredLanguage,
    consent_marketing: consentMarketing,
    consent_at: consentMarketing ? new Date().toISOString() : null,
    notified_whatsapp: waResult.status === "fulfilled" && waResult.value === true,
    notified_telegram: tgResult.status === "fulfilled" && tgResult.value === true,
  });
  if (insertError) {
    console.error("[api/lead] failed to persist lead:", insertError);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
