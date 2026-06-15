import { z } from "zod";
import type { SearchTrack } from "@/domain/search-tracks/schema";
import { sourceResultSchema, type SourceResult } from "@/domain/sources/schema";
import type { SearchProvider } from "./provider";

const tavilyResultSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  content: z.string().min(1),
  score: z.number().optional(),
  published_date: z.string().optional()
});

const tavilyResponseSchema = z.object({
  results: z.array(tavilyResultSchema).default([])
});

export function normalizeTavilyResponse(payload: unknown): SourceResult[] {
  const parsed = tavilyResponseSchema.parse(payload);

  return parsed.results.map((result) =>
    sourceResultSchema.parse({
      sourceType: "tavily",
      sourceExternalId: result.url,
      title: result.title,
      url: result.url,
      content: result.content,
      score: result.score,
      publishedAt: result.published_date
        ? new Date(result.published_date).toISOString()
        : undefined,
      raw: result
    })
  );
}

export class TavilySearchProvider implements SearchProvider {
  constructor(private readonly apiKey: string) {}

  async search(
    track: SearchTrack,
    query: string,
    limit: number
  ): Promise<SourceResult[]> {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        query,
        max_results: limit,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
        time_range: track.timeRange,
        start_date: track.startDate,
        include_domains: track.includeDomains,
        exclude_domains: track.excludeDomains
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily search failed with status ${response.status}`);
    }

    return normalizeTavilyResponse(await response.json());
  }
}
