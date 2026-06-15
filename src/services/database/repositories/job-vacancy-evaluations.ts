import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobVacancyEvaluationStore } from "@/use-cases/evaluate-job-vacancy";

export class JobVacancyEvaluationRepository implements JobVacancyEvaluationStore {
  constructor(private readonly client: SupabaseClient) {}

  async saveJobVacancyEvaluation(
    input: Parameters<JobVacancyEvaluationStore["saveJobVacancyEvaluation"]>[0]
  ) {
    const { error: vacancyError } = await this.client
      .from("job_vacancies")
      .update({
        title: input.extraction.title,
        company: input.extraction.company,
        application_url: input.extraction.applicationUrl,
        external_vacancy_id: input.extraction.externalVacancyId,
        description: input.extraction.description,
        responsibilities: input.extraction.responsibilities,
        required_skills: input.extraction.requiredSkills,
        preferred_skills: input.extraction.preferredSkills,
        seniority: input.extraction.seniority,
        employment_type: input.extraction.employmentType,
        contract_type: input.extraction.contractType,
        salary_min: input.extraction.salaryMin,
        salary_max: input.extraction.salaryMax,
        currency: input.extraction.currency,
        salary_period: input.extraction.salaryPeriod,
        country: input.extraction.country,
        city: input.extraction.city,
        remote_type: input.extraction.remoteType,
        timezone_expectations: input.extraction.timezoneExpectations,
        language_requirements: input.extraction.languageRequirements,
        application_deadline: input.extraction.applicationDeadline,
        vacancy_status: "evaluated",
        evaluation_status: "evaluated",
        updated_at: new Date().toISOString()
      })
      .eq("id", input.jobVacancyId);

    if (vacancyError) {
      throw vacancyError;
    }

    const { data, error } = await this.client
      .from("job_vacancy_evaluations")
      .insert({
        job_vacancy_id: input.jobVacancyId,
        profile_id: input.profileId,
        score: input.evaluation.score,
        fit_level: input.evaluation.fitLevel,
        recommendation: input.evaluation.recommendation,
        summary: input.evaluation.summary,
        strong_matches: input.evaluation.strongMatches,
        transferable_matches: input.evaluation.transferableMatches,
        missing_requirements: input.evaluation.missingRequirements,
        learning_requirements: input.evaluation.learningRequirements,
        risks: input.evaluation.risks,
        salary_observations: input.evaluation.salaryObservations,
        location_observations: input.evaluation.locationObservations,
        company_credibility: input.evaluation.companyCredibility,
        application_effort: input.evaluation.applicationEffort,
        realistic_chance: input.evaluation.realisticChance,
        strategic_value: input.evaluation.strategicValue,
        suggested_cv_emphasis: input.evaluation.suggestedCvEmphasis,
        suggested_cover_letter_emphasis: input.evaluation.suggestedCoverLetterEmphasis,
        suggested_interview_preparation: input.evaluation.suggestedInterviewPreparation,
        deterministic_adjustments: input.deterministicAdjustments,
        model: input.evaluationModel,
        prompt_version: input.promptVersions.evaluation,
        usage_metadata: input.usageMetadata
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return data.id as string;
  }
}
