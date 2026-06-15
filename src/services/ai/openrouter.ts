import { z } from "zod";
import type { AiProvider, StructuredGenerationResult } from "./provider";

const openRouterResponseSchema = z.object({
  model: z.string().optional(),
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string()
        })
      })
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
      completion_tokens: z.number().optional(),
      total_tokens: z.number().optional()
    })
    .optional()
});

export class OpenRouterProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async generateStructured<T>(
    input: {
      systemPrompt: string;
      userPrompt: string;
      schemaName: string;
      schema: z.ZodType<T>;
    },
    options: { retries?: number } = {}
  ): Promise<StructuredGenerationResult<T>> {
    const attempts = Math.max(1, (options.retries ?? 1) + 1);
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: input.systemPrompt },
              {
                role: "user",
                content: `${input.userPrompt}\n\nReturn only valid JSON for schema ${input.schemaName}.`
              }
            ],
            response_format: {
              type: "json_object"
            },
            temperature: 0.2
          })
        });

        if (!response.ok) {
          throw new Error(`OpenRouter request failed with status ${response.status}`);
        }

        const parsedResponse = openRouterResponseSchema.parse(await response.json());
        const content = parsedResponse.choices[0]?.message.content;

        if (!content) {
          throw new Error("OpenRouter response did not include message content.");
        }

        const json = JSON.parse(content) as unknown;
        const data = input.schema.parse(json);

        return {
          data,
          model: parsedResponse.model ?? this.model,
          usage: parsedResponse.usage
            ? {
                promptTokens: parsedResponse.usage.prompt_tokens,
                completionTokens: parsedResponse.usage.completion_tokens,
                totalTokens: parsedResponse.usage.total_tokens
              }
            : undefined
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("OpenRouter structured generation failed.");
  }
}
