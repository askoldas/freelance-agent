import type { SupabaseClient } from "@supabase/supabase-js";
import type { EvaluationStore } from "@/use-cases/evaluate-opportunity";

export class EvaluationRepository implements EvaluationStore {
  constructor(private readonly client: SupabaseClient) {}

  async saveEvaluation(input: Parameters<EvaluationStore["saveEvaluation"]>[0]) {
    const { error: opportunityError } = await this.client
      .from("opportunities")
      .update({
        title: input.extraction.title,
        client_name: input.extraction.clientName,
        company_name: input.extraction.companyName,
        description: input.extraction.description,
        primary_category: input.extraction.primaryCategory,
        secondary_categories: input.extraction.secondaryCategories,
        requested_outcomes: input.extraction.requestedOutcomes,
        requested_technologies: input.extraction.requestedTechnologies,
        constraints: input.extraction.constraints,
        missing_information: input.extraction.missingInformation,
        budget_min: input.extraction.budgetMin,
        budget_max: input.extraction.budgetMax,
        currency: input.extraction.currency,
        compensation_period: input.extraction.compensationPeriod,
        deadline_text: input.extraction.deadlineText,
        location_text: input.extraction.locationText,
        status: "evaluated",
        updated_at: new Date().toISOString()
      })
      .eq("id", input.opportunityId);

    if (opportunityError) {
      throw opportunityError;
    }

    const { data: evaluation, error: evaluationError } = await this.client
      .from("evaluations")
      .insert({
        opportunity_id: input.opportunityId,
        profile_id: input.profileId,
        score: input.evaluation.score,
        recommendation: input.evaluation.recommendation,
        fit_level: input.evaluation.fitLevel,
        summary: input.evaluation.summary,
        match_reasons: input.evaluation.matchReasons,
        gaps: input.evaluation.gaps,
        risks: input.evaluation.risks,
        learning_effort: input.evaluation.learningEffort,
        budget_assessment: input.evaluation.budgetAssessment,
        credibility_assessment: input.evaluation.credibilityAssessment,
        scope_clarity: input.evaluation.scopeClarity,
        suggested_questions: input.evaluation.suggestedQuestions,
        deterministic_adjustments: input.deterministicAdjustments,
        model: input.evaluationModel,
        prompt_version: input.promptVersions.evaluation,
        usage_metadata: input.usageMetadata
      })
      .select("id")
      .single();

    if (evaluationError) {
      throw evaluationError;
    }

    const solutionRows = input.evaluation.solutionOptions.map((option, index) => ({
      evaluation_id: evaluation.id,
      position: index + 1,
      title: option.title,
      summary: option.summary,
      technologies: option.technologies,
      fit_reason: option.fitReason,
      tradeoffs: option.tradeoffs,
      open_questions: option.openQuestions
    }));

    const { error: solutionError } = await this.client
      .from("solution_options")
      .insert(solutionRows);

    if (solutionError) {
      throw solutionError;
    }

    return evaluation.id as string;
  }
}
