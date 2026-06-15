import { describe, expect, it } from "vitest";
import { applyJobVacancyDeterministicAdjustments } from "../src/domain/job-vacancies/adjustments";
import type { JobVacancyEvaluationOutput } from "../src/domain/job-vacancies/schema";

const baseEvaluation: JobVacancyEvaluationOutput = {
  score: 86,
  fitLevel: "direct",
  recommendation: "priority",
  summary: "Strong role fit.",
  strongMatches: ["Web application and integration experience"],
  transferableMatches: [],
  missingRequirements: [],
  learningRequirements: [],
  risks: [],
  salaryObservations: "Salary is clear and acceptable.",
  locationObservations: "Remote Europe is compatible.",
  companyCredibility: "Named company and clear application path.",
  applicationEffort: "Moderate CV tailoring.",
  realisticChance: "Good.",
  strategicValue: "High.",
  suggestedCvEmphasis: ["Web platforms"],
  suggestedCoverLetterEmphasis: ["Business outcomes"],
  suggestedInterviewPreparation: ["Prepare API examples"]
};

describe("job vacancy deterministic score adjustments", () => {
  it("caps risky fit recommendations", () => {
    const { evaluation, adjustments } = applyJobVacancyDeterministicAdjustments({
      ...baseEvaluation,
      fitLevel: "risky"
    });

    expect(evaluation.recommendation).toBe("review");
    expect(evaluation.score).toBeLessThan(baseEvaluation.score);
    expect(adjustments).toHaveLength(1);
  });

  it("penalizes onsite-only roles", () => {
    const { evaluation } = applyJobVacancyDeterministicAdjustments({
      ...baseEvaluation,
      locationObservations: "Onsite only in New York; relocation required."
    });

    expect(evaluation.recommendation).not.toBe("priority");
    expect(evaluation.score).toBeLessThan(baseEvaluation.score);
  });

  it("penalizes missing senior specialist requirements", () => {
    const { evaluation } = applyJobVacancyDeterministicAdjustments({
      ...baseEvaluation,
      missingRequirements: ["Senior specialist experience in SAP implementation"]
    });

    expect(evaluation.recommendation).toBe("review");
  });
});
