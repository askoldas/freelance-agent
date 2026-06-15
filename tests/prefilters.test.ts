import { describe, expect, it } from "vitest";
import { prefilterSourceResult } from "../src/domain/sources/prefilters";

describe("deterministic prefilters", () => {
  it("keeps plausible project opportunities", () => {
    const decision = prefilterSourceResult({
      sourceType: "tavily",
      title: "Need developer to build customer portal",
      url: "https://example.com/project",
      content:
        "We need a freelance developer to build a web app dashboard and integrate CRM APIs.",
      score: 0.8
    });

    expect(decision.shouldEvaluate).toBe(true);
    expect(decision.score).toBeGreaterThanOrEqual(40);
  });

  it("penalizes unpaid or suspicious work", () => {
    const decision = prefilterSourceResult({
      sourceType: "tavily",
      title: "Volunteer developer wanted",
      url: "https://example.com/bad",
      content: "This is unpaid exposure work for a crypto pump community.",
      score: 0.5
    });

    expect(decision.shouldEvaluate).toBe(false);
  });
});
