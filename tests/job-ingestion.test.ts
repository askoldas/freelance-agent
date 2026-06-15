import { describe, expect, it } from "vitest";
import type { NormalizedJobVacancyInput } from "../src/domain/job-vacancies/schema";
import type { SearchTrack } from "../src/domain/search-tracks/schema";
import {
  ingestJobSearchResult,
  type JobVacancyWriter
} from "../src/use-cases/ingest-job-search-result";

class MemoryJobVacancyWriter implements JobVacancyWriter {
  readonly records: NormalizedJobVacancyInput[] = [];
  private readonly seen = new Map<string, string>();

  async upsertVacancy(input: NormalizedJobVacancyInput) {
    return this.write(input);
  }

  async recordRejectedVacancy(input: NormalizedJobVacancyInput) {
    return this.write(input);
  }

  private write(input: NormalizedJobVacancyInput) {
    const key = input.canonicalUrl;
    const existing = this.seen.get(key);

    this.records.push(input);

    if (existing) {
      return { id: existing, isNew: false };
    }

    const id = `vacancy-${this.seen.size + 1}`;
    this.seen.set(key, id);

    return { id, isNew: true };
  }
}

const track: SearchTrack = {
  agentType: "jobs",
  slug: "jobs-test",
  name: "Jobs test",
  category: "automation_ai",
  queries: ["hiring automation developer remote position apply"],
  includeDomains: [],
  excludeDomains: [],
  excludedTitlePatterns: [],
  timeRange: "month",
  freshnessDays: 30,
  socialFreshnessDays: 14,
  resultLimit: 5,
  minPrefilterScore: 40,
  notificationThreshold: 75,
  enabled: true
};

describe("job vacancy ingestion", () => {
  it("stores accepted vacancies separately from freelance opportunities", async () => {
    const writer = new MemoryJobVacancyWriter();
    const outcome = await ingestJobSearchResult(
      {
        sourceType: "tavily",
        title: "Remote AI Automation Developer",
        url: "https://company.example/jobs/ai-automation-developer",
        content:
          "Hiring an AI automation developer for a remote contract role. You will build workflows, integrate APIs, and document requirements. Requirements include automation, JavaScript, and process thinking. Apply now with your CV.",
        publishedAt: "2026-06-12T00:00:00.000Z",
        score: 0.9
      },
      track,
      writer
    );

    expect(outcome.skipped).toBe(false);
    expect(outcome.jobVacancyId).toBe("vacancy-1");
    expect(writer.records[0]?.vacancyStatus).toBe("validated");
    expect(writer.records[0]?.contentType).toBe("active_vacancy");
  });

  it("records deterministic rejections with category and content type", async () => {
    const writer = new MemoryJobVacancyWriter();
    const outcome = await ingestJobSearchResult(
      {
        sourceType: "tavily",
        title: "How to Become a Frontend Developer",
        url: "https://learn.example/how-to-become-frontend-developer",
        content:
          "Career advice and training course information for people who want to learn frontend development.",
        publishedAt: "2026-06-12T00:00:00.000Z"
      },
      track,
      writer
    );

    expect(outcome.skipped).toBe(true);
    expect(writer.records[0]?.vacancyStatus).toBe("rejected");
    expect(writer.records[0]?.contentType).toBe("career_advice");
    expect(writer.records[0]?.rejectionCategory).toBe("informational_content");
    expect(writer.records[0]?.evaluationStatus).toBe("skipped");
  });

  it("deduplicates vacancy mirrors by canonical URL", async () => {
    const writer = new MemoryJobVacancyWriter();
    const result = {
      sourceType: "tavily",
      title: "Workflow Automation Specialist",
      url: "https://jobs.example/vacancy/workflow-automation?utm_source=tavily",
      content:
        "Open role for workflow automation specialist. We are hiring for a remote contract role. Responsibilities include API integrations and process automation. Requirements include workflow design. Apply now.",
      publishedAt: "2026-06-11T00:00:00.000Z",
      score: 0.8
    };

    const first = await ingestJobSearchResult(result, track, writer);
    const second = await ingestJobSearchResult(
      { ...result, url: "https://jobs.example/vacancy/workflow-automation" },
      track,
      writer
    );

    expect(first.isNew).toBe(true);
    expect(second.isNew).toBe(false);
    expect(second.jobVacancyId).toBe(first.jobVacancyId);
  });
});
