import { describe, it, expect, vi } from "vitest";
import { triage } from "@/lib/ai/triage";
import type { AIProvider } from "@/lib/ai/provider";

/** A provider stub that returns a scripted classification and records calls. */
function mockProvider(response: object | string): AIProvider {
  const text = typeof response === "string" ? response : JSON.stringify(response);
  return {
    name: "mock",
    complete: vi.fn(async () => text),
    vision: vi.fn(async () => ""),
  };
}

describe("triage — deterministic safety rules (LLM must NOT be consulted)", () => {
  const cases: [string, string][] = [
    ["should I stop metformin?", "route_doctor"],
    ["can I skip my insulin dose tonight?", "route_doctor"],
    ["should I increase my glipizide?", "route_doctor"],
    ["is it ok to take my medication with food?", "route_doctor"],
    ["I'm pregnant — is this plan safe?", "route_doctor"],
    ["I also have kidney disease, does that matter?", "route_doctor"],
    ["feeling dizzy", "urgent"],
    ["I have chest pain right now", "urgent"],
    ["my vision is blurry today", "urgent"],
    ["there's numbness in my feet", "urgent"],
    ["I feel faint and shaky", "urgent"],
  ];

  it.each(cases)("%s -> %s (no LLM call)", async (message, expected) => {
    const provider = mockProvider({ class: "ai_answerable", confidence: 0.99 });
    const res = await triage(message, {}, provider);
    expect(res.class).toBe(expected);
    expect(res.deterministic).toBe(true);
    // Critical: the model was never given a chance to answer a clinical question.
    expect(provider.complete).not.toHaveBeenCalled();
  });

  it("a medication question NEVER returns ai_answerable even if the LLM would", async () => {
    // Even with an LLM that wrongly says answerable, the rule wins.
    const provider = mockProvider({ class: "ai_answerable", confidence: 1 });
    const res = await triage("what dose of metformin should I take?", {}, provider);
    expect(res.class).toBe("route_doctor");
    expect(res.routed_to).toBe("doctor");
  });
});

describe("triage — LLM-classified (non-safety) messages", () => {
  it("'is daal ok at night?' -> ai_answerable", async () => {
    const provider = mockProvider({ class: "ai_answerable", confidence: 0.9 });
    const res = await triage("is daal ok at night?", {}, provider);
    expect(res.class).toBe("ai_answerable");
    expect(res.routed_to).toBeNull();
    expect(provider.complete).toHaveBeenCalledOnce();
  });

  it("meal-plan change -> route_nutritionist", async () => {
    const provider = mockProvider({ class: "route_nutritionist", confidence: 0.85 });
    const res = await triage("can you redo my whole meal plan for ramzan?", {}, provider);
    expect(res.class).toBe("route_nutritionist");
    expect(res.routed_to).toBe("nutritionist");
  });

  it("exercise class question -> route_coach", async () => {
    const provider = mockProvider({ class: "route_coach", confidence: 0.8 });
    const res = await triage("what time is the live yoga class?", {}, provider);
    expect(res.class).toBe("route_coach");
    expect(res.routed_to).toBe("coach");
  });

  it("motivational message -> ai_answerable", async () => {
    const provider = mockProvider({ class: "ai_answerable", confidence: 0.95 });
    const res = await triage("feeling proud, 3 days under 120 fasting!", {}, provider);
    expect(res.class).toBe("ai_answerable");
  });
});

describe("triage — 'when in doubt, route to a human'", () => {
  it("low-confidence answerable falls back to route_doctor", async () => {
    const provider = mockProvider({ class: "ai_answerable", confidence: 0.4 });
    const res = await triage("my numbers feel weird lately", {}, provider);
    expect(res.class).toBe("route_doctor");
  });

  it("unparseable LLM output falls back to route_doctor", async () => {
    const provider = mockProvider("not json at all");
    const res = await triage("something ambiguous", {}, provider);
    expect(res.class).toBe("route_doctor");
    expect(res.reason).toMatch(/safe default/);
  });

  it("invalid class from LLM falls back to route_doctor", async () => {
    const provider = mockProvider({ class: "make_something_up", confidence: 0.9 });
    const res = await triage("something ambiguous", {}, provider);
    expect(res.class).toBe("route_doctor");
  });
});
