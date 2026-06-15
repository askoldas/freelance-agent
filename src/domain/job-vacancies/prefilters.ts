import type { SourceResult } from "@/domain/sources/schema";

export type JobVacancyPrefilterDecision = {
  score: number;
  shouldEvaluate: boolean;
  reasons: string[];
};

const positivePatterns = [
  /hiring|vacancy|open role|open position|apply|join our team/i,
  /developer|engineer|specialist|consultant|operations|implementation/i,
  /remote|hybrid|contract|part[-\s]?time|full[-\s]?time|b2b/i,
  /requirements|responsibilities|experience with|you will|must have/i
];

const negativePatterns = [
  /salary guide|career advice|how to become|training|certification|course/i,
  /recruitment services|talent solutions|staffing agency/i,
  /expired|closed|no longer accepting applications/i,
  /search results|jobs matching|filter by|view all jobs/i
];

export function prefilterJobVacancyResult(
  result: SourceResult
): JobVacancyPrefilterDecision {
  const haystack = `${result.title}\n${result.content}`;
  let score = 25;
  const reasons: string[] = [];

  for (const pattern of positivePatterns) {
    if (pattern.test(haystack)) {
      score += 16;
      reasons.push(`Matched vacancy signal: ${pattern.source}`);
    }
  }

  for (const pattern of negativePatterns) {
    if (pattern.test(haystack)) {
      score -= 28;
      reasons.push(`Matched non-vacancy signal: ${pattern.source}`);
    }
  }

  if (result.score && result.score >= 0.7) {
    score += 8;
    reasons.push("Search provider returned a strong relevance score.");
  }

  if (result.content.length < 120) {
    score -= 12;
    reasons.push("Vacancy text is very short.");
  }

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    score: boundedScore,
    shouldEvaluate: boundedScore >= 40,
    reasons
  };
}
