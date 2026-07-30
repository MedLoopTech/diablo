import { NextResponse } from "next/server";
import { loadConfig, interpolate } from "@/lib/automation";
import { sendWhatsApp, sendTelegram } from "@/lib/notify";

// Public endpoint — called from the website contact/interest form.
// No auth required; validates input before acting.
export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const rawPhone = (body.phone ?? "").replace(/\D/g, "");
  const email = (body.email ?? "").trim().toLowerCase();
  const interest = (body.interest ?? "general").trim();
  const source = (body.source ?? "website").trim();

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

  const cfg = await loadConfig();

  const waMsg = interpolate(cfg.msg_lead_welcome_wa ?? "{name} — thanks for your interest in Loop/90!", {
    name,
    guide_url: cfg.guide_url ?? "https://sehat90.com/guide",
  });

  const tgMsg = `*New Lead — Loop/90*\n\nName: ${name}\nPhone: +${phone}\nEmail: ${email || "—"}\nInterest: ${interest}\nSource: ${source}`;

  // Fire both notifications concurrently — don't block the HTTP response on either.
  await Promise.allSettled([
    sendWhatsApp(phone, waMsg),
    sendTelegram(cfg.notify_ops_telegram_chat_id ?? "", tgMsg),
  ]);

  return NextResponse.json({ ok: true });
}
