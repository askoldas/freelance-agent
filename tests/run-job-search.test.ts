import { describe, expect, it } from "vitest";
import type { NormalizedJobVacancyInput } from "../src/domain/job-vacancies/schema";
import type { SearchTrack } from "../src/domain/search-tracks/schema";
import type { SourceResult } from "../src/domain/sources/schema";
import type { JobVacancyWriter } from "../src/use-cases/ingest-job-search-result";
import { runJobSearch } from "../src/use-cases/run-job-search";

class MemoryJobVacancyWriter implements JobVacancyWriter {
  private readonly seen = new Map<string, string>();

  async upsertVacancy(input: NormalizedJobVacancyInput) {
    return this.write(input);
  }

  async recordRejectedVacancy(input: NormalizedJobVacancyInput) {
    return this.write(input);
  }

  private write(input: NormalizedJobVacancyInput) {
    const existing = this.seen.get(input.canonicalUrl);

    if (existing) {
      return { id: existing, isNew: false };
    }

    const id = `vacancy-${this.seen.size + 1}`;
    this.seen.set(input.canonicalUrl, id);
    return { id, isNew: true };
  }
}

const jobTrack: SearchTrack = {
  agentType: "jobs",
  slug: "jobs-web",
  name: "Jobs web",
  category: "web_product_development",
  queries: ["hiring full-stack web developer remote position apply"],
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

describe("runJobSearch", () => {
  it("records job search runs independently from freelance searches", async () => {
    const runStarts: Array<Record<string, unknown>> = [];
    const runFinishes: Array<Record<string, unknown>> = [];
    const searchedTracks: SearchTrack[] = [];
    const evaluatedVacancies: string[] = [];

    const summary = await runJobSearch({
      tracks: {
        async listEnabled() {
          return [jobTrack];
        }
      },
      searchProvider: {
        async search(track: SearchTrack): Promise<SourceResult[]> {
          searchedTracks.push(track);
          return [
            {
              sourceType: "tavily",
              title: "Remote Full-stack Web Developer",
              url: "https://company.example/jobs/full-stack-web-developer",
              content:
                "We are hiring a full-stack web developer for a remote position. You will build web application features and APIs. Requirements include JavaScript and React. Apply now with your CV.",
              publishedAt: "2026-06-12T00:00:00.000Z",
              score: 0.9
            }
          ];
        }
      },
      vacancyWriter: new MemoryJobVacancyWriter(),
      runWriter: {
        async startRun(input) {
          runStarts.push(input);
          return "job-run-1";
        },
        async finishRun(_runId, input) {
          runFinishes.push(input);
        }
      },
      evaluateNewVacancy: async (vacancy) => {
        evaluatedVacancies.push(vacancy.id);
      },
      maxQueries: 1
    });

    expect(runStarts[0]).toMatchObject({
      runType: "search",
      agentType: "jobs"
    });
    expect(searchedTracks).toHaveLength(1);
    expect(searchedTracks[0]?.agentType).toBe("jobs");
    expect(summary.inserted).toBe(1);
    expect(summary.validated).toBe(1);
    expect(summary.evaluated).toBe(1);
    expect(summary.skipped).toBe(0);
    expect(evaluatedVacancies).toEqual(["vacancy-1"]);
    expect(runFinishes[0]).toMatchObject({
      status: "completed"
    });
  });

  it("continues when one job query fails", async () => {
    let calls = 0;
    const summary = await runJobSearch({
      tracks: {
        async listEnabled() {
          return [
            {
              ...jobTrack,
              queries: [
                "hiring broken query remote position apply",
                "hiring automation developer remote position apply"
              ]
            }
          ];
        }
      },
      searchProvider: {
        async search(): Promise<SourceResult[]> {
          calls += 1;
          if (calls === 1) {
            throw new Error("Provider failure");
          }
          return [];
        }
      },
      vacancyWriter: new MemoryJobVacancyWriter(),
      runWriter: {
        async startRun() {
          return "job-run-2";
        },
        async finishRun(_runId, input) {
          expect(input.status).toBe("partial_failure");
        }
      },
      maxQueries: 2
    });

    expect(summary.errors).toBe(1);
    expect(summary.queries).toBe(2);
  });
});
