import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedOpportunityInput } from "@/domain/opportunities/schema";

export type IngestedOpportunity = {
  id: string;
  isNew: boolean;
};

export class OpportunityRepository {
  constructor(private readonly client: SupabaseClient) {}

  async upsertCandidate(input: NormalizedOpportunityInput): Promise<IngestedOpportunity> {
    return this.insertOrFind(input);
  }

  async recordRejectedCandidate(
    input: NormalizedOpportunityInput
  ): Promise<IngestedOpportunity> {
    return this.insertOrFind(input);
  }

  private async insertOrFind(
    input: NormalizedOpportunityInput
  ): Promise<IngestedOpportunity> {
    const { data: existing, error: findError } = await this.client
      .from("opportunities")
      .select("id")
      .or(
        `canonical_url.eq.${input.canonicalUrl},content_hash.eq.${input.contentHash}${
          input.sourceExternalId
            ? `,and(source_type.eq.${input.sourceType},source_external_id.eq.${input.sourceExternalId})`
            : ""
        }`
      )
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (existing) {
      return { id: existing.id as string, isNew: false };
    }

    const { data, error } = await this.client
      .from("opportunities")
      .insert({
        source_id: input.sourceId,
        search_track_id: input.searchTrackId,
        source_type: input.sourceType,
        source_external_id: input.sourceExternalId,
        source_url: input.sourceUrl,
        source_title: input.sourceTitle,
        raw_text: input.rawText,
        content_hash: input.contentHash,
        canonical_url: input.canonicalUrl,
        published_at: input.publishedAt,
        status: input.status,
        content_type: input.contentType,
        buyer_intent_evidence: input.buyerIntentEvidence,
        rejection_category: input.rejectionCategory,
        rejection_reason: input.rejectionReason,
        rejected_at: input.status === "rejected" ? new Date().toISOString() : undefined,
        prefilter_score: input.prefilterScore,
        prefilter_reasons: input.prefilterReasons
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return { id: data.id as string, isNew: true };
  }
}
