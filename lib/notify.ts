// Server-side helpers for sending WhatsApp (Meta Cloud API) and Telegram messages.
// All calls happen server-side — no CSP changes required.
// Required env vars:
//   WHATSAPP_PHONE_NUMBER_ID  — from Meta Business Manager → WhatsApp → API Setup
//   WHATSAPP_ACCESS_TOKEN     — system user permanent token
//   TELEGRAM_BOT_TOKEN        — from @BotFather

export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) {
    console.warn("[notify] WhatsApp not configured — WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN missing");
    return false;
  }
  if (!to) return false;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: "text",
          text: { body, preview_url: false },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error("[notify] WhatsApp send failed:", err);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[notify] WhatsApp fetch error:", e);
    return false;
  }
}

export async function sendTelegram(
  chatId: string,
  text: string,
  parseMode: "Markdown" | "HTML" | "none" = "Markdown"
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[notify] Telegram not configured — TELEGRAM_BOT_TOKEN missing");
    return false;
  }
  if (!chatId) return false;

  try {
    const payload: Record<string, unknown> = { chat_id: chatId, text };
    if (parseMode !== "none") payload.parse_mode = parseMode;

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error("[notify] Telegram send failed:", err);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[notify] Telegram fetch error:", e);
    return false;
  }
}
