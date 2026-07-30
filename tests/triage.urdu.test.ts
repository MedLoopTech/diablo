/**
 * Triage — Urdu & Roman Urdu Test Suite
 *
 * Covers three patient writing styles common in the Pakistan/South Asia market:
 *   1. Roman Urdu (Urdu written in Latin script) — deterministic keyword matching
 *   2. Urdu script (اردو) — falls through to LLM (mock below)
 *   3. Mixed English + Roman Urdu — partial deterministic, partial LLM
 */

import { describe, it, expect, vi } from "vitest";
import { triage, type TriageClass } from "@/lib/ai/triage";

// LLM mock for messages that pass the deterministic layer.
// The real claude-sonnet-4-6 understands Urdu fluently; this stub mirrors
// what a well-prompted model would classify for the Urdu-script cases.
vi.mock("@/lib/ai/provider", () => ({
  getProvider: vi.fn(() =>
    Promise.resolve({
      name: "mock",
      complete: vi.fn(
        async (opts: { messages?: Array<{ role: string; content: string }> }) => {
          const msg = opts.messages?.[opts.messages.length - 1]?.content ?? "";
          // Urdu-script emergency patterns
          if (/چکر|سینے میں درد|بے ہوش|دل تیز|سانس نہیں/.test(msg)) {
            return JSON.stringify({ class: "urgent", confidence: 0.95, reason: "Urdu emergency symptom" });
          }
          // Urdu-script medication patterns
          if (/دوائی|گولی|انسولین|خوراک|میٹفارمن/.test(msg)) {
            return JSON.stringify({ class: "route_doctor", confidence: 0.95, reason: "Urdu medication term" });
          }
          return JSON.stringify({ class: "ai_answerable", confidence: 0.9, reason: "general question" });
        }
      ),
      vision: vi.fn(async () => ""),
    })
  ),
}));

async function classify(message: string): Promise<TriageClass> {
  return (await triage(message)).class;
}

// ─────────────────────── Roman Urdu — Urgent (deterministic) ────────────────────────

describe("Roman Urdu — Urgent", () => {
  it('"mujhe chakkar aa raha hai" → urgent', async () => {
    expect(await classify("mujhe chakkar aa raha hai")).toBe("urgent");
  });

  it('"kal raat chakkar aaya aur main gir gayi" → urgent', async () => {
    expect(await classify("kal raat chakkar aaya aur main gir gayi")).toBe("urgent");
  });

  it('"seene mein dard ho raha hai" → urgent', async () => {
    expect(await classify("seene mein dard ho raha hai")).toBe("urgent");
  });

  it('"seena dard hai subah se" → urgent', async () => {
    expect(await classify("seena dard hai subah se")).toBe("urgent");
  });

  it('"behosh ho gayi thi thodi der ke liye" → urgent', async () => {
    expect(await classify("behosh ho gayi thi thodi der ke liye")).toBe("urgent");
  });

  it('"meri sugar 55 thi subah" → urgent (glucose ≤70 in Roman Urdu context)', async () => {
    expect(await classify("meri sugar 55 thi subah")).toBe("urgent");
  });

  it('"sugar 320 hai aur tabiyat theek nahi" → urgent (glucose ≥250)', async () => {
    expect(await classify("sugar 320 hai aur tabiyat theek nahi")).toBe("urgent");
  });

  it('"feeling chakkar when I stand up" → urgent (mixed, deterministic)', async () => {
    expect(await classify("feeling chakkar when I stand up")).toBe("urgent");
  });
});

// ───────────────────── Roman Urdu — Medication (deterministic) ──────────────────────

describe("Roman Urdu — Medication / route_doctor", () => {
  it('"kya main dawai band kar sakta hoon?" → route_doctor', async () => {
    expect(await classify("kya main dawai band kar sakta hoon?")).toBe("route_doctor");
  });

  it('"doctor ne goliyan di hain, kya chhod dun?" → route_doctor', async () => {
    expect(await classify("doctor ne goliyan di hain, kya chhod dun?")).toBe("route_doctor");
  });

  it('"ek goli ki jagah do goli le sakta hoon?" → route_doctor', async () => {
    expect(await classify("ek goli ki jagah do goli le sakta hoon?")).toBe("route_doctor");
  });

  it('"insulin ki khurak badha dun?" → route_doctor', async () => {
    expect(await classify("insulin ki khurak badha dun?")).toBe("route_doctor");
  });

  it('"metformin ki dawa raat ko leni chahiye?" → route_doctor', async () => {
    expect(await classify("metformin ki dawa raat ko leni chahiye?")).toBe("route_doctor");
  });

  it('"can I skip my dawai today?" → route_doctor (mixed)', async () => {
    expect(await classify("can I skip my dawai today?")).toBe("route_doctor");
  });

  it('"my dawai khatam ho gayi, kya karun?" → route_doctor (mixed, prescription ran out)', async () => {
    expect(await classify("my dawai khatam ho gayi, kya karun?")).toBe("route_doctor");
  });
});

// ─────────────────────── Roman Urdu — Pregnancy (deterministic) ─────────────────────

describe("Roman Urdu — Pregnancy", () => {
  it('"main hamila hoon aur sugar zyada hai" → urgent (pregnancy + high glucose)', async () => {
    expect(await classify("main hamila hoon aur sugar zyada hai")).toBe("urgent");
  });

  it('"hamila hoon, sugar reading high aa rahi hai" → urgent', async () => {
    expect(await classify("hamila hoon, sugar reading high aa rahi hai")).toBe("urgent");
  });

  it('"hamal ke doran kya khana chahiye?" → route_doctor (pregnancy alone)', async () => {
    expect(await classify("hamal ke doran kya khana chahiye?")).toBe("route_doctor");
  });

  it('"doodh pila rahi hoon, kya yeh meal plan safe hai?" → route_doctor', async () => {
    expect(await classify("doodh pila rahi hoon, kya yeh meal plan safe hai?")).toBe("route_doctor");
  });
});

// ──────────────── Roman Urdu — Religious fasting / conditions (deterministic) ───────

describe("Roman Urdu — Conditions / route_doctor", () => {
  it('"kya main ramazan mein roza rakh sakta hoon?" → route_doctor', async () => {
    expect(await classify("kya main ramazan mein roza rakh sakta hoon?")).toBe("route_doctor");
  });

  it('"roza todna pare ga sugar ki wajah se?" → route_doctor', async () => {
    expect(await classify("roza todna pare ga sugar ki wajah se?")).toBe("route_doctor");
  });

  it('"gurde ki bimari hai, kya yeh plan safe hai?" → route_doctor', async () => {
    expect(await classify("gurde ki bimari hai, kya yeh plan safe hai?")).toBe("route_doctor");
  });

  it('"gurda theek nahi hai, diet mein kya change karun?" → route_doctor', async () => {
    expect(await classify("gurda theek nahi hai, diet mein kya change karun?")).toBe("route_doctor");
  });
});

// ────────────────────── Urdu Script — LLM-handled (via mock) ───────────────────────

describe("Urdu Script — LLM-classified", () => {
  it('"چکر آ رہا ہے" → urgent (LLM: Urdu dizziness)', async () => {
    expect(await classify("چکر آ رہا ہے")).toBe("urgent");
  });

  it('"سینے میں درد ہے" → urgent (LLM: Urdu chest pain)', async () => {
    expect(await classify("سینے میں درد ہے")).toBe("urgent");
  });

  it('"دوائی بند کر دوں؟" → route_doctor (LLM: Urdu medication)', async () => {
    expect(await classify("دوائی بند کر دوں؟")).toBe("route_doctor");
  });

  it('"انسولین کی مقدار بڑھا دوں؟" → route_doctor (LLM: Urdu insulin dose)', async () => {
    expect(await classify("انسولین کی مقدار بڑھا دوں؟")).toBe("route_doctor");
  });

  it('"کیا دال رات کو کھا سکتا ہوں؟" → ai_answerable (LLM: Urdu food question)', async () => {
    expect(await classify("کیا دال رات کو کھا سکتا ہوں؟")).toBe("ai_answerable");
  });
});

// ────────────────────── Mixed English + Roman Urdu ──────────────────────────────────

describe("Mixed English + Roman Urdu", () => {
  it('"my sugar is 190, kya yeh theek hai?" → route_doctor (glucose ≥180)', async () => {
    expect(await classify("my sugar is 190, kya yeh theek hai?")).toBe("route_doctor");
  });

  it('"sugar 65 aa gai — kya karun?" → urgent (glucose ≤70)', async () => {
    expect(await classify("sugar 65 aa gai — kya karun?")).toBe("urgent");
  });

  it('"I feel chakkar and my sugar was 55" → urgent (symptom + low glucose)', async () => {
    expect(await classify("I feel chakkar and my sugar was 55")).toBe("urgent");
  });
});
