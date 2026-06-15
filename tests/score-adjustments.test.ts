import { describe, expect, it } from "vitest";
import { applyDeterministicAdjustments } from "../src/domain/evaluations/adjustments";
import type { EvaluationOutput } from "../src/domain/evaluations/schema";

const baseEvaluation: EvaluationOutput = {
  score: 88,
  recommendation: "priority",
  fitLevel: "direct",
  summary: "Good project.",
  matchReasons: ["Relevant work."],
  gaps: [],
  risks: [],
  learningEffort: "Low",
  budgetAssessment: "Healthy budget.",
  credibilityAssessment: "Credible.",
  scopeClarity: "Clear",
  suggestedQuestions: [],
  solutionOptions: [
    {
      title: "Practical build",
      summary: "Deliver the system in phases.",
      technologies: ["Next.js"],
      fitReason: "Strong fit.",
      tradeoffs: [],
      openQuestions: []
    }
  ]
};

describe("deterministic score adjustments", () => {
  it("caps risky fit recommendations", () => {
    const { evaluation, adjustments } = applyDeterministicAdjustments({
      ...baseEvaluation,
      fitLevel: "risky"
    });

    expect(evaluation.recommendation).toBe("review");
    expect(adjustments).toHaveLength(1);
  });

  it("penalizes unpaid work", () => {
    const { evaluation } = applyDeterministicAdjustments({
      ...baseEvaluation,
      budgetAssessment: "This appears to be unpaid exposure work."
    });

    expect(evaluation.score).toBeLessThan(baseEvaluation.score);
    expect(evaluation.recommendation).not.toBe("priority");
  });
});
