import { describe, expect, it } from "vitest";
import type { NormalizedOpportunityInput } from "../src/domain/opportunities/schema";
import type { SearchTrack } from "../src/domain/search-tracks/schema";
import type { SourceResult } from "../src/domain/sources/schema";
import { parseTelegramSearchRequest } from "../src/domain/telegram/search-request";
import type { AiProvider } from "../src/services/ai/provider";
import { runTelegramSearch } from "../src/use-cases/run-telegram-search";

describe("Telegram-triggered search runs", () => {
  it("uses temporary tracks without modifying persistent tracks", async () => {
    const request = parseTelegramSearchRequest("/search Baltics automation");

    if (!request) {
      throw new Error("Expected request to parse.");
    }

    const seenTracks: SearchTrack[] = [];
    const runMetadata: Record<string, unknown>[] = [];
    const messages: string[] = [];

    await runTelegramSearch({
      request,
      chatId: "9",
      sourceId: "source-1",
      searchProvider: {
        async search(track: SearchTrack): Promise<SourceResult[]> {
          seenTracks.push(track);
          return [];
        }
      },
      opportunityWriter: {
        async upsertCandidate(input: NormalizedOpportunityInput) {
          expect(input).toBeDefined();
          return { id: "never", isNew: false };
        },
        async recordRejectedCandidate(input: NormalizedOpportunityInput) {
          expect(input).toBeDefined();
          return { id: "never", isNew: false };
        }
      },
      runWriter: {
        async startRun(input) {
          runMetadata.push(input.metadata ?? {});
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
              summary: "Builds web apps."
            },
            capabilities: []
          };
        }
      },
      evaluationStore: {
        async saveEvaluation() {
          return "evaluation-1";
        }
      },
      notificationStore: {
        async reserveNotification() {
          return true;
        },
        async markNotificationSent() {},
        async markNotificationFailed() {}
      },
      ai: {
        async generateStructured() {
          throw new Error("No results should be evaluated in this test.");
        }
      } satisfies AiProvider,
      telegram: {
        async sendMessage(input) {
          messages.push(input.text);
          return {};
        }
      }
    });

    expect(seenTracks.length).toBeGreaterThan(0);
    expect(seenTracks.every((track) => track.slug.startsWith("telegram-temporary"))).toBe(
      true
    );
    expect(runMetadata[0]).toMatchObject({
      temporary: true,
      trigger: "telegram",
      telegramSearchRequest: {
        locations: ["baltics"],
        categories: ["automation"]
      }
    });
    expect(messages[0]).toContain("Search started");
    expect(messages.at(-1)).toContain("Search complete");
  });
});
