import { describe, expect, it } from "vitest";
import type { NormalizedOpportunityInput } from "../src/domain/opportunities/schema";
import type { SearchTrack } from "../src/domain/search-tracks/schema";
import {
  ingestSearchResult,
  type OpportunityWriter
} from "../src/use-cases/ingest-search-result";

class MemoryOpportunityWriter implements OpportunityWriter {
  private readonly seen = new Map<string, string>();

  async upsertCandidate(input: NormalizedOpportunityInput) {
    return this.write(input);
  }

  async recordRejectedCandidate(input: NormalizedOpportunityInput) {
    return this.write(input);
  }

  private write(input: NormalizedOpportunityInput) {
    const key = input.canonicalUrl;
    const existing = this.seen.get(key);

    if (existing) {
      return { id: existing, isNew: false };
    }

    const id = `opportunity-${this.seen.size + 1}`;
    this.seen.set(key, id);

    return { id, isNew: true };
  }
}

const track: SearchTrack = {
  agentType: "freelance",
  slug: "test",
  name: "Test",
  category: "integration",
  queries: ["need developer for api integration project"],
  includeDomains: [],
  excludeDomains: [],
  excludedTitlePatterns: [],
  freshnessDays: 90,
  socialFreshnessDays: 21,
  resultLimit: 5,
  minPrefilterScore: 40,
  notificationThreshold: 75,
  enabled: true
};

describe("idempotent ingestion", () => {
  it("does not insert the same canonical URL twice", async () => {
    const writer = new MemoryOpportunityWriter();
    const result = {
      sourceType: "tavily",
      title: "Need developer for API integration",
      url: "https://www.example.com/project?utm_source=x",
      content:
        "We need a freelance developer to build an automation workflow and API integration.",
      score: 0.8
    };

    const first = await ingestSearchResult(result, track, writer);
    const second = await ingestSearchResult(
      { ...result, url: "https://example.com/project" },
      track,
      writer
    );

    expect(first.isNew).toBe(true);
    expect(second.isNew).toBe(false);
    expect(second.opportunityId).toBe(first.opportunityId);
  });
});
