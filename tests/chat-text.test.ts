import { describe, it, expect } from "vitest";
import { toPlainText } from "@/lib/chat-text";

describe("toPlainText", () => {
  it("unwraps the transliteration emphasis models actually produce", () => {
    expect(
      toPlainText("Pair it with plain *dahi* (yogurt) and unsweetened *chai*.")
    ).toBe("Pair it with plain dahi (yogurt) and unsweetened chai.");
  });

  it("unwraps bold before italic so ** is not left behind", () => {
    expect(toPlainText("**Important:** eat before 8pm")).toBe("Important: eat before 8pm");
  });

  it("leaves a lone asterisk alone", () => {
    expect(toPlainText("Take 2 * 500mg tablets")).toBe("Take 2 * 500mg tablets");
  });

  it("converts list markers to bullets and drops headings", () => {
    expect(toPlainText("# Breakfast\n- besan chilla\n- boiled egg")).toBe(
      "Breakfast\n• besan chilla\n• boiled egg"
    );
  });

  it("strips code ticks", () => {
    expect(toPlainText("Log it under `fasting`.")).toBe("Log it under fasting.");
  });

  it("leaves ordinary plain text untouched", () => {
    const plain = "Walk for 30 minutes after dinner and log your reading.";
    expect(toPlainText(plain)).toBe(plain);
  });

  it("handles a partial streamed chunk without mangling it", () => {
    // The coach streams, so toPlainText runs on incomplete text mid-reply —
    // an unclosed marker must be left alone rather than eaten.
    expect(toPlainText("Try a besan *chill")).toBe("Try a besan *chill");
  });
});
