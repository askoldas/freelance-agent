import { randomUUID } from "node:crypto";
import type { AgentType } from "@/domain/agents/schema";
import type { SearchTrack } from "@/domain/search-tracks/schema";
import type { SearchProvider } from "@/services/search/provider";
import type { OpportunityWriter } from "./ingest-search-result";
import { ingestSearchResult } from "./ingest-search-result";

export type SearchTrackReader = {
  listEnabled(): Promise<SearchTrack[]>;
};

export type AgentRunWriter = {
  startRun(input: {
    runType: "search";
    agentType?: AgentType;
    correlationId: string;
    metadata?: Record<string, unknown>;
  }): Promise<string>;
  finishRun(
    runId: string,
    input: {
      status: "completed" | "partial_failure" | "failed";
      metadata?: Record<string, unknown>;
      errorCode?: string;
      errorMessageRedacted?: string;
    }
  ): Promise<void>;
};

export type RunProjectSearchSummary = {
  correlationId: string;
  runId: string;
  tracks: number;
  queries: number;
  results: number;
  inserted: number;
  duplicates: number;
  skipped: number;
  evaluated: number;
  errors: number;
};

export async function runProjectSearch({
  tracks,
  searchProvider,
  opportunityWriter,
  runWriter,
  evaluateNewOpportunity,
  runMetadata,
  agentType,
  maxQueries = 12
}: {
  tracks: SearchTrackReader;
  searchProvider: SearchProvider;
  opportunityWriter: OpportunityWriter;
  runWriter: AgentRunWriter;
  evaluateNewOpportunity?: (input: {
    id: string;
    title: string;
    sourceUrl: string;
    rawText: string;
    notificationThreshold: number;
  }) => Promise<void>;
  runMetadata?: Record<string, unknown>;
  agentType?: AgentType;
  maxQueries?: number;
}): Promise<RunProjectSearchSummary> {
  const correlationId = randomUUID();
  const runId = await runWriter.startRun({
    runType: "search",
    agentType,
    correlationId,
    metadata: { maxQueries, ...runMetadata }
  });

  const summary: RunProjectSearchSummary = {
    correlationId,
    runId,
    tracks: 0,
    queries: 0,
    results: 0,
    inserted: 0,
    duplicates: 0,
    skipped: 0,
    evaluated: 0,
    errors: 0
  };

  try {
    const enabledTracks = await tracks.listEnabled();
    summary.tracks = enabledTracks.length;

    for (const track of enabledTracks) {
      for (const query of track.queries) {
        if (summary.queries >= maxQueries) {
          break;
        }

        summary.queries += 1;

        try {
          const results = await searchProvider.search(track, query, track.resultLimit);
          summary.results += results.length;

          for (const result of results) {
            const outcome = await ingestSearchResult(result, track, opportunityWriter);

            if (outcome.skipped) {
              summary.skipped += 1;
            } else if (outcome.isNew) {
              summary.inserted += 1;
              if (evaluateNewOpportunity && outcome.opportunityId) {
                await evaluateNewOpportunity({
                  id: outcome.opportunityId,
                  title: result.title,
                  sourceUrl: result.url,
                  rawText: result.content,
                  notificationThreshold: track.notificationThreshold
                });
                summary.evaluated += 1;
              }
            } else {
              summary.duplicates += 1;
            }
          }
        } catch {
          summary.errors += 1;
        }
      }
    }

    await runWriter.finishRun(runId, {
      status: summary.errors > 0 ? "partial_failure" : "completed",
      metadata: summary
    });

    return summary;
  } catch (error) {
    await runWriter.finishRun(runId, {
      status: "failed",
      metadata: summary,
      errorCode: "SEARCH_RUN_FAILED",
      errorMessageRedacted: error instanceof Error ? error.message : "Unknown error"
    });
    throw error;
  }
}
