import { env } from "@/config/env";
import { OpenRouterProvider } from "@/services/ai/openrouter";
import { AgentRunRepository } from "@/services/database/repositories/agent-runs";
import { EvaluationRepository } from "@/services/database/repositories/evaluations";
import { JobNotificationRepository } from "@/services/database/repositories/job-notifications";
import { JobVacancyEvaluationRepository } from "@/services/database/repositories/job-vacancy-evaluations";
import { JobVacancyRepository } from "@/services/database/repositories/job-vacancies";
import { NotificationRepository } from "@/services/database/repositories/notifications";
import { OpportunityActionRepository } from "@/services/database/repositories/opportunity-actions";
import { OpportunityRepository } from "@/services/database/repositories/opportunities";
import { ProfileRepository } from "@/services/database/repositories/profile";
import { createSupabaseServiceClient } from "@/services/database/supabase";
import { TavilySearchProvider } from "@/services/search/tavily";
import { TelegramClient } from "@/services/telegram/client";
import { handleTelegramUpdate } from "@/use-cases/handle-telegram-update";
import { runTelegramJobSearch } from "@/use-cases/run-telegram-job-search";
import { runTelegramSearch } from "@/use-cases/run-telegram-search";

export const dynamic = "force-dynamic";

export function isVerifiedTelegramWebhook(request: Request): boolean {
  if (!env.TELEGRAM_WEBHOOK_SECRET) {
    return false;
  }

  return (
    request.headers.get("x-telegram-bot-api-secret-token") === env.TELEGRAM_WEBHOOK_SECRET
  );
}

export async function POST(request: Request) {
  if (!isVerifiedTelegramWebhook(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ALLOWED_USER_IDS) {
    return Response.json(
      { ok: false, error: "Telegram is not configured" },
      { status: 500 }
    );
  }

  const client = createSupabaseServiceClient();
  const telegram = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
  const result = await handleTelegramUpdate({
    payload: await request.json(),
    allowedUserIds: env.TELEGRAM_ALLOWED_USER_IDS,
    store: new OpportunityActionRepository(client),
    telegram,
    runSearch: async ({ request: searchRequest, chatId }) => {
      if (!env.TAVILY_API_KEY || !env.OPENROUTER_API_KEY || !env.OPENROUTER_MODEL) {
        await telegram.sendMessage({
          chatId,
          text: "Search is not fully configured. Check Tavily and OpenRouter environment variables."
        });
        return;
      }

      if (searchRequest.agentType === "jobs") {
        await runTelegramJobSearch({
          request: searchRequest,
          chatId,
          sourceId: "00000000-0000-4000-8000-000000000101",
          searchProvider: new TavilySearchProvider(env.TAVILY_API_KEY),
          vacancyWriter: new JobVacancyRepository(client),
          runWriter: new AgentRunRepository(client),
          profileReader: new ProfileRepository(client),
          evaluationStore: new JobVacancyEvaluationRepository(client),
          notificationStore: new JobNotificationRepository(client),
          ai: new OpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL),
          telegram
        });
      } else {
        await runTelegramSearch({
          request: searchRequest,
          chatId,
          sourceId: "00000000-0000-4000-8000-000000000101",
          searchProvider: new TavilySearchProvider(env.TAVILY_API_KEY),
          opportunityWriter: new OpportunityRepository(client),
          runWriter: new AgentRunRepository(client),
          profileReader: new ProfileRepository(client),
          evaluationStore: new EvaluationRepository(client),
          notificationStore: new NotificationRepository(client),
          ai: new OpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL),
          telegram
        });
      }
    }
  });

  return Response.json(
    { ok: result.ok, message: result.message },
    { status: result.status }
  );
}
