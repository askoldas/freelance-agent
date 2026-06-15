import { z } from "zod";

export const jobEmploymentTypeSchema = z.enum([
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "internship",
  "unknown"
]);

export const jobRemoteTypeSchema = z.enum(["remote", "hybrid", "onsite", "unspecified"]);

export const jobVacancyStatusSchema = z.enum([
  "discovered",
  "validated",
  "evaluated",
  "saved",
  "cv_ready",
  "cover_letter_ready",
  "applied",
  "replied",
  "interview",
  "offer",
  "rejected",
  "closed",
  "expired",
  "archived"
]);

export const jobFreshnessStatusSchema = z.enum([
  "fresh",
  "aging",
  "stale",
  "expired",
  "unknown"
]);

export const jobVacancyContentTypeSchema = z.enum([
  "active_vacancy",
  "job_board_listing",
  "company_careers_page",
  "social_post",
  "salary_guide",
  "career_advice",
  "training",
  "recruiter_marketing",
  "informational",
  "search_results_page",
  "unknown"
]);

export const jobVacancyRejectionCategorySchema = z.enum([
  "not_a_specific_role",
  "missing_active_role_evidence",
  "informational_content",
  "generic_careers_page",
  "salary_guide",
  "training_or_certification",
  "recruiter_marketing",
  "expired_vacancy",
  "stale_result",
  "undated_social_post",
  "stale_social_post",
  "duplicate",
  "listing_page_not_expanded",
  "excluded_domain",
  "excluded_title_pattern",
  "low_prefilter_score"
]);

export const jobEvaluationStatusSchema = z.enum([
  "pending",
  "evaluated",
  "skipped",
  "failed"
]);

export const jobFitLevelSchema = z.enum(["direct", "adjacent", "learnable", "risky"]);

export const jobRecommendationSchema = z.enum([
  "priority",
  "apply",
  "review",
  "skip",
  "reject"
]);

export const normalizedJobVacancyInputSchema = z.object({
  sourceId: z.uuid().optional(),
  searchTrackId: z.uuid().optional(),
  sourceType: z.string().min(1),
  sourceExternalId: z.string().min(1).optional(),
  sourceUrl: z.url(),
  sourceTitle: z.string().min(1),
  rawText: z.string().min(1),
  canonicalUrl: z.url(),
  contentHash: z.string().length(64),
  title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  applicationUrl: z.url().optional(),
  externalVacancyId: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  seniority: z.string().min(1).optional(),
  employmentType: jobEmploymentTypeSchema.default("unknown"),
  contractType: z.string().min(1).optional(),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  salaryPeriod: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  remoteType: jobRemoteTypeSchema.default("unspecified"),
  timezoneExpectations: z.string().min(1).optional(),
  languageRequirements: z.array(z.string()).default([]),
  publishedAt: z.string().datetime().optional(),
  applicationDeadline: z.string().datetime().optional(),
  vacancyStatus: jobVacancyStatusSchema.default("discovered"),
  freshnessStatus: jobFreshnessStatusSchema.default("unknown"),
  contentType: jobVacancyContentTypeSchema.default("unknown"),
  rejectionCategory: jobVacancyRejectionCategorySchema.optional(),
  rejectionReason: z.string().optional(),
  evaluationStatus: jobEvaluationStatusSchema.default("pending"),
  prefilterScore: z.number().int().min(0).max(100).default(0),
  prefilterReasons: z.array(z.string()).default([]),
  validationEvidence: z.array(z.string()).default([])
});

export const jobVacancyExtractionOutputSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1).optional(),
  applicationUrl: z.url().optional(),
  externalVacancyId: z.string().min(1).optional(),
  description: z.string().min(1),
  responsibilities: z.array(z.string()).max(12),
  requiredSkills: z.array(z.string()).max(16),
  preferredSkills: z.array(z.string()).max(16),
  seniority: z.string().min(1).optional(),
  employmentType: jobEmploymentTypeSchema,
  contractType: z.string().min(1).optional(),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  salaryPeriod: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  remoteType: jobRemoteTypeSchema,
  timezoneExpectations: z.string().min(1).optional(),
  languageRequirements: z.array(z.string()).max(8),
  applicationDeadline: z.string().datetime().optional(),
  missingInformation: z.array(z.string()).max(10)
});

export const jobVacancyEvaluationOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  fitLevel: jobFitLevelSchema,
  recommendation: jobRecommendationSchema,
  summary: z.string().min(1),
  strongMatches: z.array(z.string()).max(10),
  transferableMatches: z.array(z.string()).max(10),
  missingRequirements: z.array(z.string()).max(12),
  learningRequirements: z.array(z.string()).max(10),
  risks: z.array(z.string()).max(10),
  salaryObservations: z.string().min(1),
  locationObservations: z.string().min(1),
  companyCredibility: z.string().min(1),
  applicationEffort: z.string().min(1),
  realisticChance: z.string().min(1),
  strategicValue: z.string().min(1),
  suggestedCvEmphasis: z.array(z.string()).max(10),
  suggestedCoverLetterEmphasis: z.array(z.string()).max(10),
  suggestedInterviewPreparation: z.array(z.string()).max(10)
});

export type JobEmploymentType = z.infer<typeof jobEmploymentTypeSchema>;
export type JobRemoteType = z.infer<typeof jobRemoteTypeSchema>;
export type JobVacancyStatus = z.infer<typeof jobVacancyStatusSchema>;
export type JobFreshnessStatus = z.infer<typeof jobFreshnessStatusSchema>;
export type JobVacancyContentType = z.infer<typeof jobVacancyContentTypeSchema>;
export type JobVacancyRejectionCategory = z.infer<
  typeof jobVacancyRejectionCategorySchema
>;
export type NormalizedJobVacancyInput = z.infer<typeof normalizedJobVacancyInputSchema>;
export type JobVacancyExtractionOutput = z.infer<typeof jobVacancyExtractionOutputSchema>;
export type JobVacancyEvaluationOutput = z.infer<typeof jobVacancyEvaluationOutputSchema>;
export type JobRecommendation = z.infer<typeof jobRecommendationSchema>;

export function normalizeEmploymentType(input: string | undefined): JobEmploymentType {
  const value = input?.toLowerCase().replace(/[-\s]+/g, "_") ?? "";

  if (["full_time", "fulltime", "permanent"].includes(value)) {
    return "full_time";
  }

  if (["part_time", "parttime"].includes(value)) {
    return "part_time";
  }

  if (["contract", "contractor", "freelance", "b2b"].includes(value)) {
    return "contract";
  }

  if (["temporary", "temp", "fixed_term"].includes(value)) {
    return "temporary";
  }

  if (["internship", "intern"].includes(value)) {
    return "internship";
  }

  return "unknown";
}

export function normalizeRemoteType(input: string | undefined): JobRemoteType {
  const value = input?.toLowerCase() ?? "";

  if (/\b(remote|work from home|wfh)\b/.test(value)) {
    return "remote";
  }

  if (/\bhybrid\b/.test(value)) {
    return "hybrid";
  }

  if (/\b(on[-\s]?site|office based|in office)\b/.test(value)) {
    return "onsite";
  }

  return "unspecified";
}

export function determineJobFreshness(input: {
  publishedAt?: string;
  applicationDeadline?: string;
  now?: Date;
}): JobFreshnessStatus {
  const now = input.now ?? new Date();

  if (input.applicationDeadline && new Date(input.applicationDeadline) < now) {
    return "expired";
  }

  if (!input.publishedAt) {
    return "unknown";
  }

  const ageDays = Math.floor(
    (now.getTime() - new Date(input.publishedAt).getTime()) / 86_400_000
  );

  if (ageDays <= 14) {
    return "fresh";
  }

  if (ageDays <= 30) {
    return "aging";
  }

  return "stale";
}
