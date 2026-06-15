import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { isAuthorizedCronRequest } from "@/app/api/cron/auth";
import { OpenRouterProvider } from "@/services/ai/openrouter";
import { AgentRunRepository } from "@/services/database/repositories/agent-runs";
import { JobVacancyEvaluationRepository } from "@/services/database/repositories/job-vacancy-evaluations";
import { JobVacancyRepository } from "@/services/database/repositories/job-vacancies";
import { ProfileRepository } from "@/services/database/repositories/profile";
import { SearchTrackRepository } from "@/services/database/repositories/search-tracks";
import { createSupabaseServiceClient } from "@/services/database/supabase";
import { TavilySearchProvider } from "@/services/search/tavily";
import { evaluateJobVacancy } from "@/use-cases/evaluate-job-vacancy";
import { runJobSearch } from "@/use-cases/run-job-search";

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
  const evaluationRepository = new JobVacancyEvaluationRepository(client);
  const ai = new OpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL);
  const summary = await runJobSearch({
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

  logger.info("Job search run completed", summary);

  return Response.json({ ok: true, summary });
}

export const GET = POST;
