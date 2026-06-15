import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { searchTrackSchema } from "../src/domain/search-tracks/schema";

describe("job search foundation", () => {
  it("validates job-specific search tracks separately from freelance tracks", () => {
    const parsed = searchTrackSchema.parse({
      agentType: "jobs",
      slug: "jobs-automation-ai",
      name: "Automation and AI jobs",
      category: "automation_ai",
      queries: [
        "hiring AI automation developer remote position apply",
        "open role workflow automation specialist n8n contract"
      ],
      timeRange: "month",
      freshnessDays: 30,
      socialFreshnessDays: 14,
      resultLimit: 5,
      minPrefilterScore: 45,
      notificationThreshold: 76,
      enabled: true
    });

    expect(parsed.agentType).toBe("jobs");
    expect(parsed.category).toBe("automation_ai");
  });

  it("defaults existing search tracks to the freelance agent", () => {
    const parsed = searchTrackSchema.parse({
      slug: "freelance-web",
      name: "Freelance web",
      category: "web_build",
      queries: ["looking for freelance web developer project"]
    });

    expect(parsed.agentType).toBe("freelance");
  });

  it("adds job tables and agent type without modifying existing freelance tables", () => {
    const migration = readFileSync(
      "supabase/migrations/0006_add_job_search_agent_foundation.sql",
      "utf8"
    );

    expect(migration).toContain("create table if not exists job_vacancies");
    expect(migration).toContain("create table if not exists job_vacancy_evaluations");
    expect(migration).toContain("create table if not exists job_notification_states");
    expect(migration).toContain("add column if not exists agent_type");
    expect(migration).not.toContain("drop table opportunities");
  });
});
