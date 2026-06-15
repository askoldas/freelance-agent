"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/config/env";
import { OpenRouterProvider } from "@/services/ai/openrouter";
import { AgentRunRepository } from "@/services/database/repositories/agent-runs";
import { EvaluationRepository } from "@/services/database/repositories/evaluations";
import { JobVacancyEvaluationRepository } from "@/services/database/repositories/job-vacancy-evaluations";
import { JobVacancyRepository } from "@/services/database/repositories/job-vacancies";
import { NotificationRepository } from "@/services/database/repositories/notifications";
import { OpportunityRepository } from "@/services/database/repositories/opportunities";
import { ProfileRepository } from "@/services/database/repositories/profile";
import { SearchTrackRepository } from "@/services/database/repositories/search-tracks";
import { createSupabaseServiceClient } from "@/services/database/supabase";
import { TavilySearchProvider } from "@/services/search/tavily";
import { TelegramClient } from "@/services/telegram/client";
import { evaluateJobVacancy } from "@/use-cases/evaluate-job-vacancy";
import { evaluateOpportunity } from "@/use-cases/evaluate-opportunity";
import { notifyOpportunity } from "@/use-cases/notify-opportunity";
import { runJobSearch } from "@/use-cases/run-job-search";
import { runProjectSearch } from "@/use-cases/run-project-search";

export async function triggerManualSearch(formData: FormData) {
  const dashboardSecret = String(formData.get("dashboardSecret") ?? "");

  if (!env.DASHBOARD_SECRET || dashboardSecret !== env.DASHBOARD_SECRET) {
    throw new Error("Unauthorized dashboard action.");
  }

  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !env.TAVILY_API_KEY ||
    !env.OPENROUTER_API_KEY ||
    !env.OPENROUTER_MODEL
  ) {
    throw new Error("Search integrations are not fully configured.");
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

  await runProjectSearch({
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

  revalidatePath("/freelance");
}

export async function triggerManualJobSearch(formData: FormData) {
  const dashboardSecret = String(formData.get("dashboardSecret") ?? "");

  if (!env.DASHBOARD_SECRET || dashboardSecret !== env.DASHBOARD_SECRET) {
    throw new Error("Unauthorized dashboard action.");
  }

  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !env.TAVILY_API_KEY ||
    !env.OPENROUTER_API_KEY ||
    !env.OPENROUTER_MODEL
  ) {
    throw new Error("Search integrations are not fully configured.");
  }

  const client = createSupabaseServiceClient();
  const profileRepository = new ProfileRepository(client);
  const evaluationRepository = new JobVacancyEvaluationRepository(client);
  const ai = new OpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL);

  await runJobSearch({
    tracks: new SearchTrackRepository(client, "jobs"),
    searchProvider: new TavilySearchProvider(env.TAVILY_API_KEY),
    vacancyWriter: new JobVacancyRepository(client),
    runWriter: new AgentRunRepository(client),
    evaluateNewVacancy: async (vacancy) => {
      const { profile, capabilities } = await profileRepository.getEvaluationContext();

      await evaluateJobVacancy({
        vacancy,
        profile,
        capabilities,
        ai,
        store: evaluationRepository
      });
    }
  });

  revalidatePath("/jobs");
}
