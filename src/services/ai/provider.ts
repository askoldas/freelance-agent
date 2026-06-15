import type { z } from "zod";

export type AiUsageMetadata = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type StructuredGenerationResult<T> = {
  data: T;
  model: string;
  usage?: AiUsageMetadata;
};

export type AiProvider = {
  generateStructured<T>(
    input: {
      systemPrompt: string;
      userPrompt: string;
      schemaName: string;
      schema: z.ZodType<T>;
    },
    options?: {
      retries?: number;
    }
  ): Promise<StructuredGenerationResult<T>>;
};
