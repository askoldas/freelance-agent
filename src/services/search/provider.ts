import type { SearchTrack } from "@/domain/search-tracks/schema";
import type { SourceResult } from "@/domain/sources/schema";

export type SearchProvider = {
  search(track: SearchTrack, query: string, limit: number): Promise<SourceResult[]>;
};
