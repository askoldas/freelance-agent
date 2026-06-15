import type { JobRecommendation, JobVacancyEvaluationOutput } from "./schema";

export type JobScoreAdjustment = {
  reason: string;
  delta: number;
};

const recommendationOrder: JobRecommendation[] = [
  "reject",
  "skip",
  "review",
  "apply",
  "priority"
];

function capRecommendation(
  current: JobRecommendation,
  maximum: JobRecommendation
): JobRecommendation {
  return recommendationOrder.indexOf(current) > recommendationOrder.indexOf(maximum)
    ? maximum
    : current;
}

export function applyJobVacancyDeterministicAdjustments(
  evaluation: JobVacancyEvaluationOutput
): {
  evaluation: JobVacancyEvaluationOutput;
  adjustments: JobScoreAdjustment[];
} {
  const adjustments: JobScoreAdjustment[] = [];
  let score = evaluation.score;
  let recommendation = evaluation.recommendation;
  const riskText = evaluation.risks.join(" ").toLowerCase();
  const missingText = evaluation.missingRequirements.join(" ").toLowerCase();
  const salaryText = evaluation.salaryObservations.toLowerCase();
  const locationText = evaluation.locationObservations.toLowerCase();

  if (evaluation.fitLevel === "risky") {
    score -= 22;
    recommendation = capRecommendation(recommendation, "review");
    adjustments.push({
      reason: "Risky role fit cannot receive a priority recommendation.",
      delta: -22
    });
  }

  if (/senior|lead|principal|specialist/.test(missingText)) {
    score -= 14;
    recommendation = capRecommendation(recommendation, "review");
    adjustments.push({
      reason: "Missing senior or specialist requirements reduce selection odds.",
      delta: -14
    });
  }

  if (/onsite only|relocation required|in office only/.test(locationText)) {
    score -= 25;
    recommendation = capRecommendation(recommendation, "skip");
    adjustments.push({
      reason: "Location requirements conflict with remote/EU-compatible preference.",
      delta: -25
    });
  }

  if (/unpaid|commission only|equity only/.test(salaryText)) {
    score -= 35;
    recommendation = capRecommendation(recommendation, "skip");
    adjustments.push({
      reason: "Unpaid, commission-only, or equity-only roles cannot be prioritized.",
      delta: -35
    });
  }

  if (/closed|expired|stale/.test(riskText)) {
    score -= 30;
    recommendation = capRecommendation(recommendation, "reject");
    adjustments.push({
      reason: "Closed, expired, or stale roles should be rejected.",
      delta: -30
    });
  }

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    evaluation: {
      ...evaluation,
      score: boundedScore,
      recommendation:
        boundedScore < 35 ? "reject" : boundedScore < 50 ? "skip" : recommendation
    },
    adjustments
  };
}
