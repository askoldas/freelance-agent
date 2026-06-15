import { afterEach, describe, expect, it, vi } from "vitest";
import type { SearchTrack } from "../src/domain/search-tracks/schema";
import { TavilySearchProvider } from "../src/services/search/tavily";

const track: SearchTrack = {
  agentType: "freelance",
  slug: "recent",
  name: "Recent",
  category: "automation",
  queries: ["looking for automation developer"],
  includeDomains: [],
  excludeDomains: ["example.org"],
  excludedTitlePatterns: [],
  timeRange: "month",
  startDate: "2026-05-15",
  freshnessDays: 60,
  socialFreshnessDays: 14,
  resultLimit: 5,
  minPrefilterScore: 40,
  notificationThreshold: 75,
  enabled: true
};

describe("Tavily request parameters", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends configurable freshness and domain filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    await new TavilySearchProvider("test-key").search(track, track.queries[0], 5);

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));

    expect(body).toEqual(
      expect.objectContaining({
        query: "looking for automation developer",
        max_results: 5,
        time_range: "month",
        start_date: "2026-05-15",
        exclude_domains: ["example.org"]
      })
    );
  });
});
