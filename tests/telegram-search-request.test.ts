import { describe, expect, it } from "vitest";
import {
  buildTemporarySearchTrack,
  parseTelegramSearchRequest
} from "../src/domain/telegram/search-request";

describe("Telegram search request parsing", () => {
  it("parses /search Latvia", () => {
    expect(parseTelegramSearchRequest("/search Latvia")).toMatchObject({
      agentType: "freelance",
      locations: ["latvia"],
      geographyMode: "prefer",
      timeRange: "month",
      maxResults: 5
    });
  });

  it("parses explicit job search commands", () => {
    expect(parseTelegramSearchRequest("/search jobs Latvia web developer")).toMatchObject(
      {
        agentType: "jobs",
        locations: ["latvia"],
        categories: ["web_build", "web_product_development"],
        keywords: ["web", "developer"]
      }
    );

    expect(parseTelegramSearchRequest("/search jobs remote automation")).toMatchObject({
      agentType: "jobs",
      locations: ["remote"],
      categories: ["automation"],
      keywords: ["automation"],
      geographyMode: "remote_from"
    });

    expect(
      parseTelegramSearchRequest("/search freelance Latvia wordpress")
    ).toMatchObject({
      agentType: "freelance",
      locations: ["latvia"],
      keywords: ["wordpress"]
    });
  });

  it("parses /search Lithuania wordpress", () => {
    expect(parseTelegramSearchRequest("/search Lithuania wordpress")).toMatchObject({
      locations: ["lithuania"],
      categories: ["cms"],
      keywords: ["wordpress"]
    });
  });

  it("parses /search Baltics automation", () => {
    expect(parseTelegramSearchRequest("/search Baltics automation")).toMatchObject({
      locations: ["baltics"],
      categories: ["automation"],
      keywords: ["automation"]
    });
  });

  it("parses natural-language search requests", () => {
    expect(
      parseTelegramSearchRequest("Search for WordPress or Shopify work in Lithuania")
    ).toMatchObject({
      locations: ["lithuania"],
      categories: ["cms"],
      keywords: ["wordpress", "shopify"]
    });

    expect(
      parseTelegramSearchRequest("Find remote web-development jobs in Europe")
    ).toMatchObject({
      agentType: "jobs",
      locations: ["eu", "remote"],
      categories: ["web_build"]
    });

    expect(
      parseTelegramSearchRequest("Search for automation vacancies in Latvia")
    ).toMatchObject({
      agentType: "jobs",
      locations: ["latvia"],
      categories: ["automation"]
    });

    expect(
      parseTelegramSearchRequest("Look for technical operations roles in Lithuania")
    ).toMatchObject({
      agentType: "jobs",
      locations: ["lithuania"],
      categories: ["technical_operations"]
    });
  });

  it("builds vacancy-intent temporary queries for jobs", () => {
    const request = parseTelegramSearchRequest("/search jobs remote automation");

    if (!request) {
      throw new Error("Expected request to parse.");
    }

    const track = buildTemporarySearchTrack(request, "source-1");

    expect(track.agentType).toBe("jobs");
    expect(track.sourceId).toBe("source-1");
    expect(track.category).toBe("automation_ai");
    expect(track.queries.join(" ")).toMatch(/hiring|vacancy|open role|apply/i);
    expect(track.queries.join(" ")).toMatch(/remote/);
    expect(track.excludedTitlePatterns).toContain("\\bsalary guide\\b");
    expect(track.freshnessDays).toBe(30);
  });

  it("parses natural-language project search requests", () => {
    expect(
      parseTelegramSearchRequest("Look for automation projects in Latvia and Estonia")
    ).toMatchObject({
      locations: ["latvia", "estonia"],
      categories: ["automation"]
    });
  });

  it("returns null for unsupported locations", () => {
    expect(parseTelegramSearchRequest("/search Sweden wordpress")).toBeNull();
  });

  it("builds buyer-intent temporary queries with geography terms", () => {
    const request = parseTelegramSearchRequest("/search Latvia shopify");

    if (!request) {
      throw new Error("Expected request to parse.");
    }

    const track = buildTemporarySearchTrack(request, "source-1");

    expect(track.sourceId).toBe("source-1");
    expect(track.queries.length).toBeGreaterThan(1);
    expect(track.queries.join(" ")).toMatch(/looking for|need contractor|hiring/i);
    expect(track.queries.join(" ")).toMatch(/Latvia|Riga|Latvija/);
    expect(track.queries.join(" ")).toMatch(/meklejam|programm/);
    expect(track.excludedTitlePatterns).toContain("\\btutorial\\b");
    expect(track.timeRange).toBe("month");
  });

  it("uses remote_from geography for remote searches without requiring a country", () => {
    const request = parseTelegramSearchRequest("/search remote ai agent");

    if (!request) {
      throw new Error("Expected request to parse.");
    }

    const track = buildTemporarySearchTrack(request);

    expect(request.geographyMode).toBe("remote_from");
    expect(track.queries.join(" ")).toMatch(/remote/);
    expect(track.queries.join(" ")).toMatch(/AI agent|AI assistant/);
  });

  it("parses strict geography, time range, and maximum results", () => {
    expect(
      parseTelegramSearchRequest("/search strict Latvia wordpress week 3 results")
    ).toMatchObject({
      locations: ["latvia"],
      keywords: ["wordpress"],
      geographyMode: "strict",
      timeRange: "week",
      maxResults: 3
    });
  });
});
