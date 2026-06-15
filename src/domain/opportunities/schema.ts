import { z } from "zod";

export const opportunityCategorySchema = z.enum([
  "web_build",
  "existing_project",
  "automation",
  "ai_agent",
  "integration",
  "cms",
  "backend",
  "frontend",
  "maintenance",
  "consulting",
  "other"
]);

export const opportunityStatusSchema = z.enum([
  "new",
  "evaluated",
  "saved",
  "proposal_draft",
  "applied",
  "replied",
  "interview",
  "won",
  "lost",
  "rejected",
  "archived"
]);

export const contentTypeSchema = z.enum([
  "active_opportunity",
  "social_post",
  "informational",
  "service_page",
  "portfolio",
  "documentation",
  "discussion",
  "tutorial",
  "case_study",
  "comparison",
  "unknown"
]);

export const rejectionCategorySchema = z.enum([
  "excluded_domain",
  "excluded_title_pattern",
  "informational_content",
  "service_page",
  "portfolio",
  "documentation",
  "case_study",
  "generic_discussion",
  "missing_buyer_intent",
  "stale_result",
  "undated_social_post",
  "stale_social_post",
  "low_prefilter_score"
]);

export const normalizedOpportunityInputSchema = z.object({
  sourceId: z.uuid().optional(),
  searchTrackId: z.uuid().optional(),
  sourceType: z.string().min(1),
  sourceExternalId: z.string().min(1).optional(),
  sourceUrl: z.url(),
  sourceTitle: z.string().min(1),
  rawText: z.string().min(1),
  canonicalUrl: z.url(),
  contentHash: z.string().length(64),
  publishedAt: z.string().datetime().optional(),
  status: opportunityStatusSchema.default("new"),
  contentType: contentTypeSchema,
  buyerIntentEvidence: z.array(z.string()),
  rejectionCategory: rejectionCategorySchema.optional(),
  rejectionReason: z.string().optional(),
  prefilterScore: z.number().int().min(0).max(100),
  prefilterReasons: z.array(z.string())
});

export type OpportunityCategory = z.infer<typeof opportunityCategorySchema>;
export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>;
export type ContentType = z.infer<typeof contentTypeSchema>;
export type RejectionCategory = z.infer<typeof rejectionCategorySchema>;
export type NormalizedOpportunityInput = z.infer<typeof normalizedOpportunityInputSchema>;
