import { createContentFingerprint } from "@/domain/common/fingerprint";
import { canonicalizeUrl } from "@/domain/common/url";
import type { NormalizedOpportunityInput } from "@/domain/opportunities/schema";
import { normalizedOpportunityInputSchema } from "@/domain/opportunities/schema";
import type { SearchTrack } from "@/domain/search-tracks/schema";
import {
  prefilterSourceResult,
  type PrefilterDecision
} from "@/domain/sources/prefilters";
import {
  classifyOpportunityIntent,
  type OpportunityIntentDecision
} from "@/domain/sources/intent";
import type { SourceResult } from "@/domain/sources/schema";

export type OpportunityWriter = {
  upsertCandidate(input: NormalizedOpportunityInput): Promise<{
    id: string;
    isNew: boolean;
  }>;
  recordRejectedCandidate(input: NormalizedOpportunityInput): Promise<{
    id: string;
    isNew: boolean;
  }>;
};

export type IngestSearchResultOutcome = {
  opportunityId?: string;
  isNew: boolean;
  skipped: boolean;
  prefilter: PrefilterDecision;
  intent: OpportunityIntentDecision;
};

export async function ingestSearchResult(
  result: SourceResult,
  track: SearchTrack,
  writer: OpportunityWriter
): Promise<IngestSearchResultOutcome> {
  const prefilter = prefilterSourceResult(result);
  const intent = classifyOpportunityIntent(result, track);
  const canonicalUrl = canonicalizeUrl(result.url);
  const contentHash = createContentFingerprint([result.title, result.content]);

  async function recordRejected(
    rejectionReason: string,
    rejectionCategory: NonNullable<OpportunityIntentDecision["rejectionCategory"]>
  ) {
    const input = normalizedOpportunityInputSchema.parse({
      sourceId: track.sourceId,
      searchTrackId: track.id,
      sourceType: result.sourceType,
      sourceExternalId: result.sourceExternalId ?? canonicalUrl,
      sourceUrl: result.url,
      sourceTitle: result.title,
      rawText: result.content,
      canonicalUrl,
      contentHash,
      publishedAt: result.publishedAt,
      status: "rejected",
      contentType: intent.contentType,
      buyerIntentEvidence: intent.buyerIntentEvidence,
      rejectionCategory,
      rejectionReason,
      prefilterScore: prefilter.score,
      prefilterReasons: prefilter.reasons
    });
    const stored = await writer.recordRejectedCandidate(input);

    return {
      opportunityId: stored.id,
      isNew: stored.isNew,
      skipped: true,
      prefilter,
      intent
    };
  }

  if (!intent.accepted) {
    return recordRejected(
      intent.rejectionReason ?? "Result failed buyer-intent classification.",
      intent.rejectionCategory ?? "missing_buyer_intent"
    );
  }

  if (prefilter.score < track.minPrefilterScore) {
    return recordRejected(
      "Result did not meet the deterministic prefilter threshold.",
      "low_prefilter_score"
    );
  }

  const input = normalizedOpportunityInputSchema.parse({
    sourceId: track.sourceId,
    searchTrackId: track.id,
    sourceType: result.sourceType,
    sourceExternalId: result.sourceExternalId ?? canonicalUrl,
    sourceUrl: result.url,
    sourceTitle: result.title,
    rawText: result.content,
    canonicalUrl,
    contentHash,
    publishedAt: result.publishedAt,
    status: "new",
    contentType: intent.contentType,
    buyerIntentEvidence: intent.buyerIntentEvidence,
    prefilterScore: prefilter.score,
    prefilterReasons: prefilter.reasons
  });

  const stored = await writer.upsertCandidate(input);

  return {
    opportunityId: stored.id,
    isNew: stored.isNew,
    skipped: false,
    prefilter,
    intent
  };
}
