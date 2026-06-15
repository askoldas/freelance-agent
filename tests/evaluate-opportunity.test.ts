import { describe, expect, it } from "vitest";
import type { AiProvider } from "../src/services/ai/provider";
import {
  evaluateOpportunity,
  type EvaluationStore
} from "../src/use-cases/evaluate-opportunity";

const extraction = {
  title: "Build a customer portal",
  description: "Client needs a portal with CRM integration.",
  primaryCategory: "web_build" as const,
  secondaryCategories: ["integration" as const],
  requestedOutcomes: ["Customer portal", "CRM integration"],
  requestedTechnologies: ["React"],
  constraints: [],
  missingInformation: ["Budget"]
};

const evaluation = {
  score: 84,
  recommendation: "apply" as const,
  fitLevel: "direct" as const,
  summary: "Good fit for web app and integration work.",
  matchReasons: ["Matches web app and API skills."],
  gaps: ["Budget is missing."],
  risks: ["Scope may grow."],
  learningEffort: "Low",
  budgetAssessment: "Budget unknown.",
  credibilityAssessment: "Clear project request.",
  scopeClarity: "Mostly clear",
  suggestedQuestions: ["Which CRM?"],
  solutionOptions: [
    {
      title: "Portal with integration layer",
      summary: "Build a portal and sync CRM data.",
      technologies: ["Next.js", "Supabase"],
      fitReason: "Matches capabilities.",
      tradeoffs: ["Needs API access."],
      openQuestions: ["Which CRM?"]
    }
  ]
};

describe("evaluate opportunity", () => {
  it("extracts, evaluates, adjusts, and stores an opportunity", async () => {
    const ai: AiProvider = {
      async generateStructured(input) {
        return {
          data: (input.schemaName === "ExtractionOutput"
            ? extraction
            : evaluation) as never,
          model: "test-model"
        };
      }
    };
    const saved: unknown[] = [];
    const store: EvaluationStore = {
      async saveEvaluation(input) {
        saved.push(input);
        return "evaluation-1";
      }
    };

    const result = await evaluateOpportunity({
      opportunity: {
        id: "opportunity-1",
        title: "Build a customer portal",
        sourceUrl: "https://example.com/project",
        rawText: "Need a freelance developer to build a portal."
      },
      profile: {
        id: "profile-1",
        name: "Owner",
        headline: "Developer",
        summary: "Builds web apps."
      },
      capabilities: [],
      ai,
      store
    });

    expect(result.evaluationId).toBe("evaluation-1");
    expect(saved).toHaveLength(1);
    expect(result.evaluation.score).toBe(84);
  });

  it("rejects invalid model output", async () => {
    const ai: AiProvider = {
      async generateStructured(input) {
        return {
          data: input.schema.parse({ bad: true }),
          model: "test-model"
        };
      }
    };
    const store: EvaluationStore = {
      async saveEvaluation() {
        return "never";
      }
    };

    await expect(
      evaluateOpportunity({
        opportunity: {
          id: "opportunity-1",
          title: "Bad output",
          sourceUrl: "https://example.com/project",
          rawText: "Need a developer."
        },
        profile: {
          id: "profile-1",
          name: "Owner",
          headline: "Developer",
          summary: "Builds web apps."
        },
        capabilities: [],
        ai,
        store
      })
    ).rejects.toThrow();
  });
});
