import {
  applyJobVacancyDeterministicAdjustments,
  type JobScoreAdjustment
} from "@/domain/job-vacancies/adjustments";
import {
  jobVacancyEvaluationOutputSchema,
  jobVacancyExtractionOutputSchema,
  type JobVacancyEvaluationOutput,
  type JobVacancyExtractionOutput
} from "@/domain/job-vacancies/schema";
import {
  buildJobEvaluationUserPrompt,
  jobEvaluationPromptVersion,
  jobEvaluationSystemPrompt
} from "@/prompts/job-evaluation.v1";
import {
  buildJobExtractionUserPrompt,
  jobExtractionPromptVersion,
  jobExtractionSystemPrompt
} from "@/prompts/job-extraction.v1";
import type { AiProvider, AiUsageMetadata } from "@/services/ai/provider";
import { loadProfessionalProfile } from "@/services/professional-profile/load";
import { selectRelevantProfessionalContext } from "@/services/professional-profile/relevance";
import type { EvaluationCapability, EvaluationProfile } from "./evaluate-opportunity";

export type EvaluationJobVacancyInput = {
  id: string;
  title: string;
  sourceUrl: string;
  rawText: string;
};

export type JobVacancyEvaluationStore = {
  saveJobVacancyEvaluation(input: {
    jobVacancyId: string;
    profileId: string;
    extraction: JobVacancyExtractionOutput;
    evaluation: JobVacancyEvaluationOutput;
    deterministicAdjustments: JobScoreAdjustment[];
    extractionModel: string;
    evaluationModel: string;
    promptVersions: {
      extraction: string;
      evaluation: string;
    };
    usageMetadata: {
      extraction?: AiUsageMetadata;
      evaluation?: AiUsageMetadata;
    };
  }): Promise<string>;
};

export async function evaluateJobVacancy({
  vacancy,
  profile,
  capabilities,
  ai,
  store
}: {
  vacancy: EvaluationJobVacancyInput;
  profile: EvaluationProfile;
  capabilities: EvaluationCapability[];
  ai: AiProvider;
  store: JobVacancyEvaluationStore;
}): Promise<{
  evaluationId: string;
  extraction: JobVacancyExtractionOutput;
  evaluation: JobVacancyEvaluationOutput;
  deterministicAdjustments: JobScoreAdjustment[];
}> {
  const extracted = await ai.generateStructured({
    systemPrompt: jobExtractionSystemPrompt,
    userPrompt: buildJobExtractionUserPrompt({
      title: vacancy.title,
      url: vacancy.sourceUrl,
      rawText: vacancy.rawText
    }),
    schemaName: "JobVacancyExtractionOutput",
    schema: jobVacancyExtractionOutputSchema
  });

  const evaluated = await ai.generateStructured(
    {
      systemPrompt: jobEvaluationSystemPrompt,
      userPrompt: buildJobEvaluationUserPrompt({
        extractedVacancy: extracted.data,
        profile,
        capabilities,
        professionalContext: await loadRelevantProfessionalContext({
          title: extracted.data.title,
          description: extracted.data.description,
          rawText: vacancy.rawText
        })
      }),
      schemaName: "JobVacancyEvaluationOutput",
      schema: jobVacancyEvaluationOutputSchema
    },
    { retries: 1 }
  );

  const adjusted = applyJobVacancyDeterministicAdjustments(evaluated.data);

  const evaluationId = await store.saveJobVacancyEvaluation({
    jobVacancyId: vacancy.id,
    profileId: profile.id,
    extraction: extracted.data,
    evaluation: adjusted.evaluation,
    deterministicAdjustments: adjusted.adjustments,
    extractionModel: extracted.model,
    evaluationModel: evaluated.model,
    promptVersions: {
      extraction: jobExtractionPromptVersion,
      evaluation: jobEvaluationPromptVersion
    },
    usageMetadata: {
      extraction: extracted.usage,
      evaluation: evaluated.usage
    }
  });

  return {
    evaluationId,
    extraction: extracted.data,
    evaluation: adjusted.evaluation,
    deterministicAdjustments: adjusted.adjustments
  };
}

async function loadRelevantProfessionalContext(vacancy: {
  title?: string;
  description?: string;
  rawText?: string;
}) {
  try {
    const professionalProfile = await loadProfessionalProfile();
    return selectRelevantProfessionalContext(professionalProfile, vacancy, {
      publicDocument: false,
      maxCases: 2
    });
  } catch {
    return null;
  }
}
