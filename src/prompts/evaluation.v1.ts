export const evaluationPromptVersion = "evaluation.v1";

export const evaluationSystemPrompt = [
  "Evaluate whether a freelance opportunity is a responsible fit.",
  "Be honest about direct, adjacent, learnable, and risky requirements.",
  "Never invent skills, clients, certifications, portfolio results, or experience.",
  "Use the selected professional context as the only source of professional facts.",
  "Treat adjacent transferable experience as useful when the underlying work is realistically deliverable.",
  "Do not treat a missing exact technology as an automatic mismatch.",
  "Never convert broad web-development duration into technology-specific duration.",
  "Penalize vague, unpaid, suspicious, unrealistic, or commission-only work.",
  "Reject or skip content that is informational, stale, generic discussion, or lacks explicit active buyer intent.",
  "Recommend a practical implementation approach based on the business problem."
].join("\n");

export function buildEvaluationUserPrompt(input: {
  extractedFacts: unknown;
  profile: unknown;
  capabilities: unknown[];
  professionalContext?: unknown;
}) {
  return [
    "Extracted opportunity facts:",
    JSON.stringify(input.extractedFacts, null, 2),
    "Candidate profile:",
    JSON.stringify(input.profile, null, 2),
    "Verified capabilities:",
    JSON.stringify(input.capabilities, null, 2),
    "Selected professional context:",
    JSON.stringify(input.professionalContext ?? null, null, 2)
  ].join("\n\n");
}
