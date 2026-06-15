import type { SourceResult } from "./schema";

export type PrefilterDecision = {
  score: number;
  shouldEvaluate: boolean;
  reasons: string[];
};

const positivePatterns = [
  /freelance|contract|consultant|developer|engineer/i,
  /looking for|need|hiring|send proposal|paid|budget|rate/i,
  /build|create|develop|implement|integrate|automate|fix|repair|finish|migrate/i,
  /web app|website|dashboard|portal|cms|api|automation|workflow|ai|crm|telegram/i
];

const negativePatterns = [
  /unpaid|volunteer|equity only|commission only|exposure/i,
  /casino|adult|crypto pump|forex signal|essay writing/i,
  /full[-\s]?time.*on[-\s]?site/i,
  /blog|guide|tutorial|case study|our services|portfolio|documentation/i
];

export function prefilterSourceResult(result: SourceResult): PrefilterDecision {
  const haystack = `${result.title}\n${result.content}`;
  let score = 30;
  const reasons: string[] = [];

  for (const pattern of positivePatterns) {
    if (pattern.test(haystack)) {
      score += 15;
      reasons.push(`Matched positive signal: ${pattern.source}`);
    }
  }

  for (const pattern of negativePatterns) {
    if (pattern.test(haystack)) {
      score -= 30;
      reasons.push(`Matched risk signal: ${pattern.source}`);
    }
  }

  if (result.score && result.score >= 0.7) {
    score += 10;
    reasons.push("Search provider returned a strong relevance score.");
  }

  if (result.content.length < 80) {
    score -= 15;
    reasons.push("Listing text is very short.");
  }

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    score: boundedScore,
    shouldEvaluate: boundedScore >= 40,
    reasons
  };
}
