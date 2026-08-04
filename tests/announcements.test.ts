import { describe, expect, it } from "vitest";
import { checkAnnouncementCopy, safeHref, isLive } from "@/lib/announcements-shared";

describe("checkAnnouncementCopy", () => {
  it("allows ordinary announcement copy", () => {
    expect(checkAnnouncementCopy("Group walk this Saturday", "7am at F-9 Park")).toBeNull();
  });

  it("blocks 'cure' and suggests remission", () => {
    expect(checkAnnouncementCopy("This program cures diabetes")).toMatch(/remission/i);
  });

  it("blocks 'cured'", () => {
    expect(checkAnnouncementCopy(null, "You'll be cured in 90 days")).toMatch(/remission/i);
  });

  it("blocks 'guaranteed' outcome claims", () => {
    expect(checkAnnouncementCopy("Guaranteed results")).toMatch(/outcomes can't be promised/i);
  });

  it("blocks '100% effective' claims", () => {
    expect(checkAnnouncementCopy("Our program is 100% effective")).toMatch(/outcomes can't be promised/i);
  });

  it("blocks 'miracle'", () => {
    expect(checkAnnouncementCopy("A miracle diet plan")).toMatch(/describe the actual service/i);
  });

  it("checks title, body, and cta together", () => {
    expect(checkAnnouncementCopy("Join us", null, "Get cured now")).toMatch(/remission/i);
  });
});

describe("safeHref", () => {
  it("accepts http/https URLs unchanged", () => {
    expect(safeHref("https://sehat90.app/workshop")).toBe("https://sehat90.app/workshop");
    expect(safeHref("http://example.com")).toBe("http://example.com");
  });

  it("rejects javascript: URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
  });

  it("assumes https for a bare domain", () => {
    expect(safeHref("sehat90.app/workshop")).toBe("https://sehat90.app/workshop");
  });

  it("returns null for garbage input", () => {
    expect(safeHref("not a url at all")).toBeNull();
  });

  it("returns null for empty/missing input", () => {
    expect(safeHref(null)).toBeNull();
    expect(safeHref("")).toBeNull();
  });
});

describe("isLive", () => {
  it("is false when unpublished regardless of window", () => {
    expect(isLive({ published: false, starts_on: null, ends_on: null })).toBe(false);
  });

  it("is true when published with no window", () => {
    expect(isLive({ published: true, starts_on: null, ends_on: null })).toBe(true);
  });

  it("is false before the start date", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    expect(isLive({ published: true, starts_on: future, ends_on: null })).toBe(false);
  });

  it("is false after the end date", () => {
    const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    expect(isLive({ published: true, starts_on: null, ends_on: past })).toBe(false);
  });
});
