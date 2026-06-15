import { z } from "zod";

export const sourceResultSchema = z.object({
  sourceType: z.string().min(1),
  sourceExternalId: z.string().min(1).optional(),
  title: z.string().min(1),
  url: z.url(),
  content: z.string().min(1),
  score: z.number().min(0).max(1).optional(),
  publishedAt: z.string().datetime().optional(),
  raw: z.record(z.string(), z.unknown()).optional()
});

export type SourceResult = z.infer<typeof sourceResultSchema>;
