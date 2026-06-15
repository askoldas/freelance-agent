import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { isAuthorizedCronRequest } from "@/app/api/cron/auth";
import { OpenRouterProvider } from "@/services/ai/openrouter";
import { AgentRunRepository } from "@/services/database/repositories/agent-runs";
import { EvaluationRepository } from "@/services/database/repositories/evaluations";
import { OpportunityRepository } from "@/services/database/repositories/opportunities";
import { ProfileRepository } from "@/services/database/repositories/profile";
import { NotificationRepository } from "@/services/database/repositories/notifications";
import { SearchTrackRepository } from "@/services/database/repositories/search-tracks";
import { createSupabaseServiceClient } from "@/services/database/supabase";
import { TavilySearchProvider } from "@/services/search/tavily";
import { TelegramClient } from "@/services/telegram/client";
import { evaluateOpportunity } from "@/use-cases/evaluate-opportunity";
import { notifyOpportunity } from "@/use-cases/notify-opportunity";
import { runProjectSearch } from "@/use-cases/run-project-search";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!env.TAVILY_API_KEY) {
    return Response.json(
      { ok: false, error: "Tavily API key is not configured" },
      { status: 500 }
    );
  }

  if (!env.OPENROUTER_API_KEY || !env.OPENROUTER_MODEL) {
    return Response.json(
      { ok: false, error: "OpenRouter configuration is not complete" },
      { status: 500 }
    );
  }

  const client = createSupabaseServiceClient();
  const profileRepository = new ProfileRepository(client);
  const evaluationRepository = new EvaluationRepository(client);
  const notificationRepository = new NotificationRepository(client);
  const ai = new OpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL);
  const telegram =
    env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ALLOWED_USER_IDS
      ? new TelegramClient(env.TELEGRAM_BOT_TOKEN)
      : undefined;
  const summary = await runProjectSearch({
    tracks: new SearchTrackRepository(client),
    searchProvider: new TavilySearchProvider(env.TAVILY_API_KEY),
    opportunityWriter: new OpportunityRepository(client),
    runWriter: new AgentRunRepository(client),
    evaluateNewOpportunity: async (opportunity) => {
      const { profile, capabilities } = await profileRepository.getEvaluationContext();

      const evaluated = await evaluateOpportunity({
        opportunity,
        profile,
        capabilities,
        ai,
        store: evaluationRepository
      });

      const chatId = env.TELEGRAM_ALLOWED_USER_IDS?.split(",")[0]?.trim();

      if (
        telegram &&
        chatId &&
        evaluated.evaluation.score >= opportunity.notificationThreshold
      ) {
        await notifyOpportunity({
          notification: {
            opportunityId: opportunity.id,
            title: evaluated.extraction.title,
            sourceUrl: opportunity.sourceUrl,
            sourceName: "Tavily",
            score: evaluated.evaluation.score,
            fitLevel: evaluated.evaluation.fitLevel,
            recommendation: evaluated.evaluation.recommendation,
            summary: evaluated.evaluation.summary,
            matchReasons: evaluated.evaluation.matchReasons,
            risks: evaluated.evaluation.risks
          },
          chatId,
          store: notificationRepository,
          telegram
        });
      }
    }
  });

  logger.info("Search run completed", summary);

  return Response.json({ ok: true, summary });
}

export const GET = POST;
