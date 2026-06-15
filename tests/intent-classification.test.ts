import { describe, expect, it } from "vitest";
import type { SearchTrack } from "../src/domain/search-tracks/schema";
import { classifyOpportunityIntent } from "../src/domain/sources/intent";
import type { SourceResult } from "../src/domain/sources/schema";

const now = new Date("2026-06-15T00:00:00.000Z");

const track: SearchTrack = {
  agentType: "freelance",
  slug: "broad-opportunities",
  name: "Broad opportunities",
  category: "automation",
  queries: ["looking for developer paid project"],
  includeDomains: [],
  excludeDomains: ["blocked.example"],
  excludedTitlePatterns: ["\\bwebinar\\b"],
  timeRange: "month",
  freshnessDays: 90,
  socialFreshnessDays: 21,
  resultLimit: 5,
  minPrefilterScore: 40,
  notificationThreshold: 75,
  enabled: true
};

function classify(result: SourceResult) {
  return classifyOpportunityIntent(result, track, now);
}

describe("opportunity-intent classification", () => {
  it("accepts an active freelance listing", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Paid contract developer needed for CRM workflow",
      url: "https://projects.example/listing/123",
      content:
        "We need a freelance developer for a paid contract to build a CRM automation workflow. Please send a proposal with rate and availability.",
      publishedAt: "2026-06-10T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(true);
    expect(decision.buyerIntentEvidence.length).toBeGreaterThan(0);
  });

  it("accepts a recent looking-for-a-developer social post", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Looking for a developer for an automation project",
      url: "https://www.linkedin.com/posts/example-looking-for-dev",
      content:
        "We are looking for a developer to build an internal reporting automation. This is a paid freelance project, DM me with examples.",
      publishedAt: "2026-06-12T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(true);
    expect(decision.contentType).toBe("social_post");
  });

  it("rejects an old LinkedIn post", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Looking for a developer for a portal",
      url: "https://linkedin.com/posts/old-project",
      content:
        "We are looking for a developer for a paid customer portal project. DM me.",
      publishedAt: "2025-12-01T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(false);
    expect(decision.rejectionCategory).toBe("stale_social_post");
  });

  it("classifies the DevCritters WordPress-to-Next.js migration cost article as informational", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "WordPress to Next.js Migration Cost: Complete Pricing Guide",
      url: "https://devcritters.com/blog/wordpress-to-nextjs-migration-cost",
      content:
        "This DevCritters guide explains WordPress to Next.js migration cost, pricing factors, timelines, performance benefits, content migration, hosting, and common technical considerations for planning a website migration.",
      publishedAt: "2026-06-01T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(false);
    expect(decision.contentType).toBe("informational");
    expect(decision.rejectionCategory).toBe("informational_content");
  });

  it("rejects an agency service page without explicit active buyer intent", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Workflow Automation Services for Growing Teams",
      url: "https://agency.example/services/workflow-automation",
      content:
        "Our agency services help businesses automate sales workflows, reporting, CRM updates, and email follow-up. Book a call to learn more.",
      publishedAt: "2026-06-05T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(false);
    expect(decision.contentType).toBe("service_page");
    expect(decision.rejectionCategory).toBe("service_page");
  });

  it("rejects a generic technical tutorial", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "How to Build a Dashboard with React",
      url: "https://tutorials.example/how-to-build-dashboard",
      content:
        "This tutorial explains how to build a dashboard with React, charts, API calls, and deployment steps for learners.",
      publishedAt: "2026-06-07T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(false);
    expect(decision.contentType).toBe("tutorial");
  });
});
