export const jobEvaluationPromptVersion = "job-evaluation.v1";

export const jobEvaluationSystemPrompt = [
  "Evaluate whether a job vacancy is a responsible fit for the candidate.",
  "Use the selected professional context as the only source of professional facts.",
  "Never invent skills, clients, certifications, portfolio results, employment history, or years of tool-specific experience.",
  "Do not reject a role only because one requested tool differs when the underlying work is transferable.",
  "Do not inflate suitability for senior specialist roles requiring deep experience that is not present in the professional dataset.",
  "Prefer remote, Latvia/EU-compatible, European-hours, freelance, contract, part-time, and suitable full-time roles.",
  "Assess role/responsibility fit, direct technical fit, transferable fit, seniority, employment type, location, language, salary quality, credibility, freshness, application effort, realistic chance, and strategic value.",
  "Classify fit as direct, adjacent, learnable, or risky.",
  "Recommend priority, apply, review, skip, or reject.",
  "Suggest CV and cover-letter emphasis, but do not generate either document."
].join("\n");

export function buildJobEvaluationUserPrompt(input: {
  extractedVacancy: unknown;
  profile: unknown;
  capabilities: unknown[];
  professionalContext?: unknown;
}) {
  return [
    "Extracted vacancy facts:",
    JSON.stringify(input.extractedVacancy, null, 2),
    "Candidate profile:",
    JSON.stringify(input.profile, null, 2),
    "Verified capabilities:",
    JSON.stringify(input.capabilities, null, 2),
    "Selected professional context:",
    JSON.stringify(input.professionalContext ?? null, null, 2)
  ].join("\n\n");
}
