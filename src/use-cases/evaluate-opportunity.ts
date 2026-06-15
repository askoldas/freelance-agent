import {
  applyDeterministicAdjustments,
  type ScoreAdjustment
} from "@/domain/evaluations/adjustments";
import {
  evaluationOutputSchema,
  extractionOutputSchema,
  type EvaluationOutput,
  type ExtractionOutput
} from "@/domain/evaluations/schema";
import {
  buildEvaluationUserPrompt,
  evaluationPromptVersion,
  evaluationSystemPrompt
} from "@/prompts/evaluation.v1";
import {
  buildExtractionUserPrompt,
  extractionPromptVersion,
  extractionSystemPrompt
} from "@/prompts/extraction.v1";
import type { AiProvider, AiUsageMetadata } from "@/services/ai/provider";
import { loadProfessionalProfile } from "@/services/professional-profile/load";
import { selectRelevantProfessionalContext } from "@/services/professional-profile/relevance";

export type EvaluationOpportunityInput = {
  id: string;
  title: string;
  sourceUrl: string;
  rawText: string;
};

export type EvaluationProfile = {
  id: string;
  name: string;
  headline: string;
  summary: string;
};

export type EvaluationCapability = {
  name: string;
  category: string;
  proficiency: string;
  description: string;
};

export type EvaluationStore = {
  saveEvaluation(input: {
    opportunityId: string;
    profileId: string;
    extraction: ExtractionOutput;
    evaluation: EvaluationOutput;
    deterministicAdjustments: ScoreAdjustment[];
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

export async function evaluateOpportunity({
  opportunity,
  profile,
  capabilities,
  ai,
  store
}: {
  opportunity: EvaluationOpportunityInput;
  profile: EvaluationProfile;
  capabilities: EvaluationCapability[];
  ai: AiProvider;
  store: EvaluationStore;
}): Promise<{
  evaluationId: string;
  extraction: ExtractionOutput;
  evaluation: EvaluationOutput;
  deterministicAdjustments: ScoreAdjustment[];
}> {
  const extracted = await ai.generateStructured({
    systemPrompt: extractionSystemPrompt,
    userPrompt: buildExtractionUserPrompt({
      title: opportunity.title,
      url: opportunity.sourceUrl,
      rawText: opportunity.rawText
    }),
    schemaName: "ExtractionOutput",
    schema: extractionOutputSchema
  });

  const evaluated = await ai.generateStructured(
    {
      systemPrompt: evaluationSystemPrompt,
      userPrompt: buildEvaluationUserPrompt({
        extractedFacts: extracted.data,
        profile,
        capabilities,
        professionalContext: await loadRelevantProfessionalContext({
          title: extracted.data.title,
          description: extracted.data.description,
          rawText: opportunity.rawText
        })
      }),
      schemaName: "EvaluationOutput",
      schema: evaluationOutputSchema
    },
    { retries: 1 }
  );

  const adjusted = applyDeterministicAdjustments(evaluated.data);

  const evaluationId = await store.saveEvaluation({
    opportunityId: opportunity.id,
    profileId: profile.id,
    extraction: extracted.data,
    evaluation: adjusted.evaluation,
    deterministicAdjustments: adjusted.adjustments,
    extractionModel: extracted.model,
    evaluationModel: evaluated.model,
    promptVersions: {
      extraction: extractionPromptVersion,
      evaluation: evaluationPromptVersion
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

async function loadRelevantProfessionalContext(opportunity: {
  title?: string;
  description?: string;
  rawText?: string;
}) {
  try {
    const professionalProfile = await loadProfessionalProfile();
    return selectRelevantProfessionalContext(professionalProfile, opportunity, {
      publicDocument: false,
      maxCases: 2
    });
  } catch {
    return null;
  }
}
