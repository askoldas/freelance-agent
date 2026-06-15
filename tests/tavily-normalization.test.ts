import { describe, expect, it } from "vitest";
import fixture from "./fixtures/tavily-response.json";
import { normalizeTavilyResponse } from "../src/services/search/tavily";

describe("Tavily normalization", () => {
  it("maps Tavily results into source-neutral results", () => {
    const results = normalizeTavilyResponse(fixture);

    expect(results).toEqual([
      expect.objectContaining({
        sourceType: "tavily",
        sourceExternalId: "https://example.com/projects/dashboard?utm_source=feed",
        title: "Need developer to build an internal dashboard",
        score: 0.86
      })
    ]);
  });
});
