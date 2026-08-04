import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A voice note is never transcribed, so it has no reliable way to be
 * auto-triaged. This test guards the structural guarantee — not just a
 * comment — that /api/voice-note cannot reach the AI provider or triage
 * module, so a future edit can't silently make voice notes AI-answerable.
 */
describe("voice-note route never touches AI/triage", () => {
  const source = readFileSync(
    join(process.cwd(), "app/api/voice-note/route.ts"),
    "utf-8"
  );

  it("does not import the triage module", () => {
    expect(source).not.toMatch(/from ["']@\/lib\/ai\/triage["']/);
  });

  it("does not import the AI provider", () => {
    expect(source).not.toMatch(/from ["']@\/lib\/ai\/provider["']/);
  });

  it("always routes to the doctor, unconditionally", () => {
    expect(source).toMatch(/routed_to:\s*"doctor"/);
  });

  it("stores the message body as empty — no transcript field exists", () => {
    expect(source).toMatch(/body:\s*""/);
  });
});
