import { randomUUID } from "node:crypto";
import type { SearchTrack } from "@/domain/search-tracks/schema";
import type { SearchProvider } from "@/services/search/provider";
import type { AgentRunWriter, SearchTrackReader } from "./run-project-search";
import type { JobVacancyWriter } from "./ingest-job-search-result";
import { ingestJobSearchResult } from "./ingest-job-search-result";

export type RunJobSearchSummary = {
  correlationId: string;
  runId: string;
  tracks: number;
  queries: number;
  results: number;
  inserted: number;
  duplicates: number;
  skipped: number;
  validated: number;
  evaluated: number;
  errors: number;
};

export async function runJobSearch({
  tracks,
  searchProvider,
  vacancyWriter,
  runWriter,
  evaluateNewVacancy,
  runMetadata,
  maxQueries = 12
}: {
  tracks: SearchTrackReader;
  searchProvider: SearchProvider;
  vacancyWriter: JobVacancyWriter;
  runWriter: AgentRunWriter;
  evaluateNewVacancy?: (input: {
    id: string;
    title: string;
    sourceUrl: string;
    rawText: string;
    notificationThreshold: number;
  }) => Promise<void>;
  runMetadata?: Record<string, unknown>;
  maxQueries?: number;
}): Promise<RunJobSearchSummary> {
  const correlationId = randomUUID();
  const runId = await runWriter.startRun({
    runType: "search",
    agentType: "jobs",
    correlationId,
    metadata: { maxQueries, ...runMetadata }
  });

  const summary: RunJobSearchSummary = {
    correlationId,
    runId,
    tracks: 0,
    queries: 0,
    results: 0,
    inserted: 0,
    duplicates: 0,
    skipped: 0,
    validated: 0,
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
            const outcome = await ingestJobSearchResult(result, track, vacancyWriter);

            if (outcome.skipped) {
              summary.skipped += 1;
            } else if (outcome.isNew) {
              summary.inserted += 1;
              summary.validated += 1;
              if (evaluateNewVacancy && outcome.jobVacancyId) {
                await evaluateNewVacancy({
                  id: outcome.jobVacancyId,
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
      errorCode: "JOB_SEARCH_RUN_FAILED",
      errorMessageRedacted: error instanceof Error ? error.message : "Unknown error"
    });
    throw error;
  }
}

export function isJobSearchTrack(track: SearchTrack) {
  return track.agentType === "jobs";
}
