import { createContentFingerprint } from "@/domain/common/fingerprint";
import { canonicalizeUrl } from "@/domain/common/url";
import {
  normalizedJobVacancyInputSchema,
  type NormalizedJobVacancyInput
} from "@/domain/job-vacancies/schema";
import {
  classifyJobVacancyIntent,
  type JobVacancyValidationDecision
} from "@/domain/job-vacancies/validation";
import {
  prefilterJobVacancyResult,
  type JobVacancyPrefilterDecision
} from "@/domain/job-vacancies/prefilters";
import type { SearchTrack } from "@/domain/search-tracks/schema";
import type { SourceResult } from "@/domain/sources/schema";

export type JobVacancyWriter = {
  upsertVacancy(input: NormalizedJobVacancyInput): Promise<{
    id: string;
    isNew: boolean;
  }>;
  recordRejectedVacancy(input: NormalizedJobVacancyInput): Promise<{
    id: string;
    isNew: boolean;
  }>;
};

export type IngestJobSearchResultOutcome = {
  jobVacancyId?: string;
  isNew: boolean;
  skipped: boolean;
  prefilter: JobVacancyPrefilterDecision;
  validation: JobVacancyValidationDecision;
};

export async function ingestJobSearchResult(
  result: SourceResult,
  track: SearchTrack,
  writer: JobVacancyWriter
): Promise<IngestJobSearchResultOutcome> {
  const prefilter = prefilterJobVacancyResult(result);
  const validation = classifyJobVacancyIntent(result, track);
  const canonicalUrl = canonicalizeUrl(result.url);
  const contentHash = createContentFingerprint([result.title, result.content]);

  async function recordRejected(
    rejectionReason: string,
    rejectionCategory: NonNullable<JobVacancyValidationDecision["rejectionCategory"]>
  ) {
    const input = normalizedJobVacancyInputSchema.parse({
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
      vacancyStatus: rejectionCategory === "expired_vacancy" ? "expired" : "rejected",
      freshnessStatus: validation.freshnessStatus,
      contentType: validation.contentType,
      rejectionCategory,
      rejectionReason,
      evaluationStatus: "skipped",
      prefilterScore: prefilter.score,
      prefilterReasons: prefilter.reasons,
      validationEvidence: validation.validationEvidence
    });
    const stored = await writer.recordRejectedVacancy(input);

    return {
      jobVacancyId: stored.id,
      isNew: stored.isNew,
      skipped: true,
      prefilter,
      validation
    };
  }

  if (!validation.accepted) {
    return recordRejected(
      validation.rejectionReason ?? "Result failed active-vacancy validation.",
      validation.rejectionCategory ?? "missing_active_role_evidence"
    );
  }

  if (prefilter.score < track.minPrefilterScore) {
    return recordRejected(
      "Result did not meet the deterministic job-vacancy prefilter threshold.",
      "low_prefilter_score"
    );
  }

  const input = normalizedJobVacancyInputSchema.parse({
    sourceId: track.sourceId,
    searchTrackId: track.id,
    sourceType: result.sourceType,
    sourceExternalId: result.sourceExternalId ?? canonicalUrl,
    sourceUrl: result.url,
    sourceTitle: result.title,
    rawText: result.content,
    canonicalUrl,
    contentHash,
    title: result.title,
    publishedAt: result.publishedAt,
    vacancyStatus: "validated",
    freshnessStatus: validation.freshnessStatus,
    contentType: validation.contentType,
    evaluationStatus: "pending",
    prefilterScore: prefilter.score,
    prefilterReasons: prefilter.reasons,
    validationEvidence: validation.validationEvidence
  });

  const stored = await writer.upsertVacancy(input);

  return {
    jobVacancyId: stored.id,
    isNew: stored.isNew,
    skipped: false,
    prefilter,
    validation
  };
}
