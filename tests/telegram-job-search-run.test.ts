import { describe, expect, it } from "vitest";
import type { NormalizedJobVacancyInput } from "../src/domain/job-vacancies/schema";
import type { SearchTrack } from "../src/domain/search-tracks/schema";
import type { SourceResult } from "../src/domain/sources/schema";
import { parseTelegramSearchRequest } from "../src/domain/telegram/search-request";
import type { AiProvider } from "../src/services/ai/provider";
import { runTelegramJobSearch } from "../src/use-cases/run-telegram-job-search";

class MemoryJobVacancyWriter {
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

describe("Telegram-triggered job searches", () => {
  it("uses a temporary job track and sends qualified vacancies separately", async () => {
    const request = parseTelegramSearchRequest("/search jobs remote automation");

    if (!request) {
      throw new Error("Expected request to parse.");
    }

    const seenTracks: SearchTrack[] = [];
    const runMetadata: Record<string, unknown>[] = [];
    const messages: string[] = [];

    const summary = await runTelegramJobSearch({
      request,
      chatId: "9",
      sourceId: "00000000-0000-4000-8000-000000000101",
      searchProvider: {
        async search(track: SearchTrack): Promise<SourceResult[]> {
          seenTracks.push(track);
          return [
            {
              sourceType: "tavily",
              title: "Remote Workflow Automation Specialist",
              url: "https://company.example/jobs/workflow-automation",
              content:
                "Open role for workflow automation specialist. We are hiring for a remote contract role. Responsibilities include API integrations and process automation. Requirements include workflow design. Apply now with your CV.",
              publishedAt: "2026-06-12T00:00:00.000Z",
              score: 0.9
            }
          ];
        }
      },
      vacancyWriter: new MemoryJobVacancyWriter(),
      runWriter: {
        async startRun(input) {
          runMetadata.push(input.metadata ?? {});
          expect(input.agentType).toBe("jobs");
          return "run-1";
        },
        async finishRun(_runId, input) {
          runMetadata.push(input.metadata ?? {});
        }
      },
      profileReader: {
        async getEvaluationContext() {
          return {
            profile: {
              id: "profile-1",
              name: "Owner",
              headline: "Developer",
              summary: "Builds automation systems."
            },
            capabilities: []
          };
        }
      },
      evaluationStore: {
        async saveJobVacancyEvaluation() {
          return "job-evaluation-1";
        }
      },
      notificationStore: {
        async reserveJobNotification() {
          return true;
        },
        async markJobNotificationSent() {},
        async markJobNotificationFailed() {}
      },
      ai: {
        async generateStructured(input) {
          if (input.schemaName === "JobVacancyExtractionOutput") {
            return {
              data: input.schema.parse({
                title: "Remote Workflow Automation Specialist",
                company: "Company Example",
                applicationUrl: "https://company.example/jobs/workflow-automation/apply",
                description: "Build workflow automations and API integrations.",
                responsibilities: ["Build automations", "Integrate APIs"],
                requiredSkills: ["Automation", "APIs"],
                preferredSkills: ["n8n"],
                employmentType: "contract",
                country: "Europe",
                remoteType: "remote",
                languageRequirements: ["English"],
                missingInformation: []
              }),
              model: "test-model"
            };
          }

          return {
            data: input.schema.parse({
              score: 82,
              fitLevel: "adjacent",
              recommendation: "apply",
              summary: "Good transferable fit for automation work.",
              strongMatches: ["Workflow automation"],
              transferableMatches: ["Operations background"],
              missingRequirements: ["Exact n8n depth not fully proven"],
              learningRequirements: ["Review stack"],
              risks: ["Tool-specific ramp-up"],
              salaryObservations: "Salary not stated.",
              locationObservations: "Remote Europe compatible.",
              companyCredibility: "Specific role and application path.",
              applicationEffort: "Moderate.",
              realisticChance: "Reasonable.",
              strategicValue: "Useful automation role.",
              suggestedCvEmphasis: ["Automation workflows"],
              suggestedCoverLetterEmphasis: ["Reducing manual work"],
              suggestedInterviewPreparation: ["Prepare workflow examples"]
            }),
            model: "test-model"
          };
        }
      } satisfies AiProvider,
      telegram: {
        async sendMessage(input) {
          messages.push(input.text);
          return { messageId: String(messages.length) };
        }
      }
    });

    expect(seenTracks.length).toBeGreaterThan(0);
    expect(seenTracks.every((track) => track.agentType === "jobs")).toBe(true);
    expect(seenTracks[0]?.slug).toMatch(/^telegram-temporary/);
    expect(runMetadata[0]).toMatchObject({
      temporary: true,
      trigger: "telegram",
      telegramSearchRequest: {
        agentType: "jobs",
        locations: ["remote"]
      }
    });
    expect(summary.errors).toBe(0);
    expect(summary.evaluated).toBe(1);
    expect(messages[0]).toContain("Job search started");
    expect(messages.some((message) => message.includes("Job vacancy"))).toBe(true);
    expect(messages.at(-1)).toContain("Job search complete");
  });
});
