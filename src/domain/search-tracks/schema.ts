import { z } from "zod";
import { agentTypeSchema } from "../agents/schema";
import { opportunityCategorySchema } from "../opportunities/schema";

export const jobSearchTrackCategorySchema = z.enum([
  "web_product_development",
  "automation_ai",
  "technical_operations"
]);

export const searchTrackCategorySchema = z.union([
  opportunityCategorySchema,
  jobSearchTrackCategorySchema
]);

export const searchTrackSchema = z.object({
  id: z.uuid().optional(),
  sourceId: z.uuid().optional(),
  agentType: agentTypeSchema.default("freelance"),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: searchTrackCategorySchema,
  queries: z.array(z.string().min(8)).min(1).max(12),
  includeDomains: z.array(z.string()).default([]),
  excludeDomains: z.array(z.string()).default([]),
  excludedTitlePatterns: z.array(z.string()).default([]),
  region: z.string().optional(),
  language: z.string().optional(),
  timeRange: z.enum(["day", "week", "month", "year"]).optional(),
  startDate: z.string().date().optional(),
  freshnessDays: z.number().int().min(1).max(730).default(90),
  socialFreshnessDays: z.number().int().min(1).max(180).default(21),
  resultLimit: z.number().int().min(1).max(20).default(5),
  minPrefilterScore: z.number().int().min(0).max(100).default(40),
  notificationThreshold: z.number().int().min(0).max(100).default(75),
  enabled: z.boolean().default(true)
});

export type SearchTrack = z.infer<typeof searchTrackSchema>;
export type SearchTrackCategory = z.infer<typeof searchTrackCategorySchema>;
