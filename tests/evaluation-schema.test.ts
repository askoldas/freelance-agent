import { describe, expect, it } from "vitest";
import { evaluationOutputSchema } from "../src/domain/evaluations/schema";

describe("evaluation output schema", () => {
  it("validates structured AI evaluation output", () => {
    const parsed = evaluationOutputSchema.parse({
      score: 82,
      recommendation: "apply",
      fitLevel: "direct",
      summary: "A practical web app integration project.",
      matchReasons: ["Strong match for API and dashboard work."],
      gaps: ["Budget is not stated."],
      risks: ["Scope may expand."],
      learningEffort: "Low",
      budgetAssessment: "Budget unknown.",
      credibilityAssessment: "Listing has a clear project goal.",
      scopeClarity: "Mostly clear",
      suggestedQuestions: ["What systems need to be integrated?"],
      solutionOptions: [
        {
          title: "Next.js dashboard with API integration",
          summary: "Build a focused dashboard and integration layer.",
          technologies: ["Next.js", "PostgreSQL"],
          fitReason: "Matches verified web app and integration skills.",
          tradeoffs: ["Requires API access early."],
          openQuestions: ["Which CRM is used?"]
        }
      ]
    });

    expect(parsed.solutionOptions).toHaveLength(1);
  });
});
