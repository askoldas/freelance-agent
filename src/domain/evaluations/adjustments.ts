import type { EvaluationOutput, Recommendation } from "./schema";

export type ScoreAdjustment = {
  reason: string;
  delta: number;
};

const recommendationOrder: Recommendation[] = [
  "reject",
  "skip",
  "review",
  "apply",
  "priority"
];

function capRecommendation(
  current: Recommendation,
  maximum: Recommendation
): Recommendation {
  return recommendationOrder.indexOf(current) > recommendationOrder.indexOf(maximum)
    ? maximum
    : current;
}

export function applyDeterministicAdjustments(evaluation: EvaluationOutput): {
  evaluation: EvaluationOutput;
  adjustments: ScoreAdjustment[];
} {
  const adjustments: ScoreAdjustment[] = [];
  let score = evaluation.score;
  let recommendation = evaluation.recommendation;

  const riskText = evaluation.risks.join(" ").toLowerCase();
  const budgetText = evaluation.budgetAssessment.toLowerCase();

  if (/unpaid|commission only|equity only/.test(budgetText)) {
    score -= 35;
    recommendation = capRecommendation(recommendation, "skip");
    adjustments.push({
      reason:
        "Unpaid, commission-only, or equity-only compensation cannot be prioritized.",
      delta: -35
    });
  }

  if (evaluation.fitLevel === "risky") {
    score -= 20;
    recommendation = capRecommendation(recommendation, "review");
    adjustments.push({
      reason: "Risky fit cannot receive a priority recommendation.",
      delta: -20
    });
  }

  if (/unclear|vague|unknown/.test(evaluation.scopeClarity.toLowerCase())) {
    score -= 10;
    adjustments.push({
      reason: "Unclear scope reduces confidence.",
      delta: -10
    });
  }

  if (/regulated|medical|legal|financial trading/.test(riskText)) {
    score -= 15;
    recommendation = capRecommendation(recommendation, "review");
    adjustments.push({
      reason: "Specialist or regulated risk requires manual review.",
      delta: -15
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
