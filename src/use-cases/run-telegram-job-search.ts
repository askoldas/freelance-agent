import type { SearchTrack } from "@/domain/search-tracks/schema";
import {
  buildTemporarySearchTrack,
  formatParsedTelegramSearchRequest,
  type TelegramSearchRequest
} from "@/domain/telegram/search-request";
import type { AiProvider } from "@/services/ai/provider";
import type { SearchProvider } from "@/services/search/provider";
import {
  evaluateJobVacancy,
  type JobVacancyEvaluationStore
} from "./evaluate-job-vacancy";
import type { EvaluationCapability, EvaluationProfile } from "./evaluate-opportunity";
import type { JobVacancyWriter } from "./ingest-job-search-result";
import { notifyJobVacancy, type JobNotificationStore } from "./notify-job-vacancy";
import type { AgentRunWriter } from "./run-project-search";
import { runJobSearch } from "./run-job-search";

export type TelegramJobSearchMessenger = {
  sendMessage(input: {
    chatId: string;
    text: string;
    replyMarkup?: unknown;
  }): Promise<{ messageId?: string }>;
};

export type TelegramJobSearchProfileReader = {
  getEvaluationContext(): Promise<{
    profile: EvaluationProfile;
    capabilities: EvaluationCapability[];
  }>;
};

export async function runTelegramJobSearch(input: {
  request: TelegramSearchRequest;
  chatId: string;
  sourceId?: string;
  searchProvider: SearchProvider;
  vacancyWriter: JobVacancyWriter;
  runWriter: AgentRunWriter;
  profileReader: TelegramJobSearchProfileReader;
  evaluationStore: JobVacancyEvaluationStore;
  notificationStore: JobNotificationStore;
  ai: AiProvider;
  telegram: TelegramJobSearchMessenger;
}) {
  await input.telegram.sendMessage({
    chatId: input.chatId,
    text: formatParsedTelegramSearchRequest(input.request)
  });

  const track = buildTemporarySearchTrack(
    { ...input.request, agentType: "jobs" },
    input.sourceId
  );
  const tracks = {
    async listEnabled(): Promise<SearchTrack[]> {
      return [track];
    }
  };

  const summary = await runJobSearch({
    tracks,
    searchProvider: input.searchProvider,
    vacancyWriter: input.vacancyWriter,
    runWriter: input.runWriter,
    maxQueries: track.queries.length,
    runMetadata: {
      temporary: true,
      trigger: "telegram",
      telegramSearchRequest: { ...input.request, agentType: "jobs" },
      temporaryTrack: {
        slug: track.slug,
        queries: track.queries,
        geographyMode: input.request.geographyMode
      }
    },
    evaluateNewVacancy: async (vacancy) => {
      const { profile, capabilities } = await input.profileReader.getEvaluationContext();
      const evaluated = await evaluateJobVacancy({
        vacancy,
        profile,
        capabilities,
        ai: input.ai,
        store: input.evaluationStore
      });

      if (evaluated.evaluation.score >= vacancy.notificationThreshold) {
        await notifyJobVacancy({
          notification: {
            jobVacancyId: vacancy.id,
            role: evaluated.extraction.title,
            company: evaluated.extraction.company,
            sourceUrl: vacancy.sourceUrl,
            applicationUrl: evaluated.extraction.applicationUrl,
            score: evaluated.evaluation.score,
            fitLevel: evaluated.evaluation.fitLevel,
            recommendation: evaluated.evaluation.recommendation,
            freshness: "validated",
            location: [evaluated.extraction.city, evaluated.extraction.country]
              .filter(Boolean)
              .join(", "),
            remoteType: evaluated.extraction.remoteType,
            strongestMatch:
              evaluated.evaluation.strongMatches[0] ??
              evaluated.evaluation.transferableMatches[0],
            mainGap: evaluated.evaluation.missingRequirements[0],
            summary: evaluated.evaluation.summary
          },
          chatId: input.chatId,
          store: input.notificationStore,
          telegram: input.telegram
        });
      }
    }
  });

  await input.telegram.sendMessage({
    chatId: input.chatId,
    text: [
      "<b>Job search complete</b>",
      `Queries: ${summary.queries}`,
      `Results checked: ${summary.results}`,
      `New vacancies: ${summary.inserted}`,
      `Duplicates: ${summary.duplicates}`,
      `Rejected/skipped: ${summary.skipped}`,
      `Evaluated: ${summary.evaluated}`,
      `Errors: ${summary.errors}`
    ].join("\n")
  });

  return summary;
}
