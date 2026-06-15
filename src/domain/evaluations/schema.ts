import { z } from "zod";
import { opportunityCategorySchema } from "../opportunities/schema";

export const fitLevelSchema = z.enum(["direct", "adjacent", "learnable", "risky"]);
export const recommendationSchema = z.enum([
  "priority",
  "apply",
  "review",
  "skip",
  "reject"
]);

export const solutionOptionSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  technologies: z.array(z.string()).max(12),
  fitReason: z.string().min(1),
  tradeoffs: z.array(z.string()).max(6),
  openQuestions: z.array(z.string()).max(6)
});

export const extractionOutputSchema = z.object({
  title: z.string().min(1),
  clientName: z.string().optional(),
  companyName: z.string().optional(),
  description: z.string().min(1),
  primaryCategory: opportunityCategorySchema,
  secondaryCategories: z.array(opportunityCategorySchema).max(4),
  requestedOutcomes: z.array(z.string()).max(10),
  requestedTechnologies: z.array(z.string()).max(12),
  constraints: z.array(z.string()).max(10),
  missingInformation: z.array(z.string()).max(10),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  compensationPeriod: z.string().optional(),
  deadlineText: z.string().optional(),
  locationText: z.string().optional()
});

export const evaluationOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  recommendation: recommendationSchema,
  fitLevel: fitLevelSchema,
  summary: z.string().min(1),
  matchReasons: z.array(z.string()).max(10),
  gaps: z.array(z.string()).max(10),
  risks: z.array(z.string()).max(10),
  learningEffort: z.string().min(1),
  budgetAssessment: z.string().min(1),
  credibilityAssessment: z.string().min(1),
  scopeClarity: z.string().min(1),
  suggestedQuestions: z.array(z.string()).max(8),
  solutionOptions: z.array(solutionOptionSchema).min(1).max(3)
});

export type ExtractionOutput = z.infer<typeof extractionOutputSchema>;
export type EvaluationOutput = z.infer<typeof evaluationOutputSchema>;
export type FitLevel = z.infer<typeof fitLevelSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
