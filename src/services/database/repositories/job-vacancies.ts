import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedJobVacancyInput } from "@/domain/job-vacancies/schema";
import type { JobVacancyWriter } from "@/use-cases/ingest-job-search-result";

export type IngestedJobVacancy = {
  id: string;
  isNew: boolean;
};

export class JobVacancyRepository implements JobVacancyWriter {
  constructor(private readonly client: SupabaseClient) {}

  async upsertVacancy(input: NormalizedJobVacancyInput): Promise<IngestedJobVacancy> {
    return this.insertOrFind(input);
  }

  async recordRejectedVacancy(
    input: NormalizedJobVacancyInput
  ): Promise<IngestedJobVacancy> {
    return this.insertOrFind(input);
  }

  private async insertOrFind(
    input: NormalizedJobVacancyInput
  ): Promise<IngestedJobVacancy> {
    const { data: existing, error: findError } = await this.client
      .from("job_vacancies")
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
      .from("job_vacancies")
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
        title: input.title,
        company: input.company,
        application_url: input.applicationUrl,
        external_vacancy_id: input.externalVacancyId,
        description: input.description,
        responsibilities: input.responsibilities,
        required_skills: input.requiredSkills,
        preferred_skills: input.preferredSkills,
        seniority: input.seniority,
        employment_type: input.employmentType,
        contract_type: input.contractType,
        salary_min: input.salaryMin,
        salary_max: input.salaryMax,
        currency: input.currency,
        salary_period: input.salaryPeriod,
        country: input.country,
        city: input.city,
        remote_type: input.remoteType,
        timezone_expectations: input.timezoneExpectations,
        language_requirements: input.languageRequirements,
        published_at: input.publishedAt,
        application_deadline: input.applicationDeadline,
        vacancy_status: input.vacancyStatus,
        freshness_status: input.freshnessStatus,
        content_type: input.contentType,
        rejection_category: input.rejectionCategory,
        rejection_reason: input.rejectionReason,
        rejected_at:
          input.vacancyStatus === "rejected" || input.vacancyStatus === "expired"
            ? new Date().toISOString()
            : undefined,
        evaluation_status: input.evaluationStatus,
        prefilter_score: input.prefilterScore,
        prefilter_reasons: input.prefilterReasons,
        validation_evidence: input.validationEvidence
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return { id: data.id as string, isNew: true };
  }
}
