import type { SearchTrack } from "@/domain/search-tracks/schema";
import {
  buildTemporarySearchTrack,
  formatParsedTelegramSearchRequest,
  type TelegramSearchRequest
} from "@/domain/telegram/search-request";
import type { AiProvider } from "@/services/ai/provider";
import type { AgentRunWriter } from "./run-project-search";
import { runProjectSearch } from "./run-project-search";
import type { EvaluationCapability, EvaluationProfile } from "./evaluate-opportunity";
import { evaluateOpportunity, type EvaluationStore } from "./evaluate-opportunity";
import { notifyOpportunity, type NotificationStore } from "./notify-opportunity";
import type { OpportunityWriter } from "./ingest-search-result";
import type { SearchProvider } from "@/services/search/provider";

export type TelegramSearchMessenger = {
  sendMessage(input: {
    chatId: string;
    text: string;
    replyMarkup?: unknown;
  }): Promise<{ messageId?: string }>;
};

export type TelegramSearchProfileReader = {
  getEvaluationContext(): Promise<{
    profile: EvaluationProfile;
    capabilities: EvaluationCapability[];
  }>;
};

export async function runTelegramSearch(input: {
  request: TelegramSearchRequest;
  chatId: string;
  sourceId?: string;
  searchProvider: SearchProvider;
  opportunityWriter: OpportunityWriter;
  runWriter: AgentRunWriter;
  profileReader: TelegramSearchProfileReader;
  evaluationStore: EvaluationStore;
  notificationStore: NotificationStore;
  ai: AiProvider;
  telegram: TelegramSearchMessenger;
}) {
  await input.telegram.sendMessage({
    chatId: input.chatId,
    text: formatParsedTelegramSearchRequest(input.request)
  });

  const track = buildTemporarySearchTrack(input.request, input.sourceId);
  const tracks = {
    async listEnabled(): Promise<SearchTrack[]> {
      return [track];
    }
  };

  const summary = await runProjectSearch({
    tracks,
    searchProvider: input.searchProvider,
    opportunityWriter: input.opportunityWriter,
    runWriter: input.runWriter,
    maxQueries: track.queries.length,
    runMetadata: {
      temporary: true,
      trigger: "telegram",
      telegramSearchRequest: input.request,
      temporaryTrack: {
        slug: track.slug,
        queries: track.queries,
        geographyMode: input.request.geographyMode
      }
    },
    evaluateNewOpportunity: async (opportunity) => {
      const { profile, capabilities } = await input.profileReader.getEvaluationContext();
      const evaluated = await evaluateOpportunity({
        opportunity,
        profile,
        capabilities,
        ai: input.ai,
        store: input.evaluationStore
      });

      if (evaluated.evaluation.score >= opportunity.notificationThreshold) {
        await notifyOpportunity({
          notification: {
            opportunityId: opportunity.id,
            title: evaluated.extraction.title,
            sourceUrl: opportunity.sourceUrl,
            sourceName: "Telegram search",
            score: evaluated.evaluation.score,
            fitLevel: evaluated.evaluation.fitLevel,
            recommendation: evaluated.evaluation.recommendation,
            summary: evaluated.evaluation.summary,
            matchReasons: evaluated.evaluation.matchReasons,
            risks: evaluated.evaluation.risks
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
      "<b>Search complete</b>",
      `Queries: ${summary.queries}`,
      `Results checked: ${summary.results}`,
      `New opportunities: ${summary.inserted}`,
      `Duplicates: ${summary.duplicates}`,
      `Rejected/skipped: ${summary.skipped}`,
      `Evaluated: ${summary.evaluated}`,
      `Errors: ${summary.errors}`
    ].join("\n")
  });

  return summary;
}
