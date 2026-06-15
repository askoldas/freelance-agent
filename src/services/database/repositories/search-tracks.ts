import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentType } from "@/domain/agents/schema";
import { searchTrackSchema, type SearchTrack } from "@/domain/search-tracks/schema";

export class SearchTrackRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly agentType: AgentType = "freelance"
  ) {}

  async listEnabled(): Promise<SearchTrack[]> {
    const { data, error } = await this.client
      .from("search_tracks")
      .select("*")
      .eq("enabled", true)
      .eq("agent_type", this.agentType)
      .order("name");

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) =>
      searchTrackSchema.parse({
        id: row.id,
        sourceId: row.source_id ?? undefined,
        agentType: row.agent_type ?? "freelance",
        slug: row.slug,
        name: row.name,
        category: row.category,
        queries: row.queries,
        includeDomains: row.include_domains ?? [],
        excludeDomains: row.exclude_domains ?? [],
        excludedTitlePatterns: row.excluded_title_patterns ?? [],
        region: row.region ?? undefined,
        language: row.language ?? undefined,
        timeRange: row.time_range ?? undefined,
        startDate: row.start_date ?? undefined,
        freshnessDays: row.freshness_days,
        socialFreshnessDays: row.social_freshness_days,
        resultLimit: row.result_limit,
        minPrefilterScore: row.min_prefilter_score,
        notificationThreshold: row.notification_threshold,
        enabled: row.enabled
      })
    );
  }
}
