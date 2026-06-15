import { z } from "zod";

const optionalSecret = z.string().trim().min(1).optional().or(z.literal(""));

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  APP_BASE_URL: z.string().url().optional().or(z.literal("")),
  CRON_SECRET: optionalSecret,
  DASHBOARD_SECRET: optionalSecret,
  SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
  TAVILY_API_KEY: optionalSecret,
  OPENROUTER_API_KEY: optionalSecret,
  OPENROUTER_MODEL: optionalSecret,
  TELEGRAM_BOT_TOKEN: optionalSecret,
  TELEGRAM_WEBHOOK_SECRET: optionalSecret,
  TELEGRAM_ALLOWED_USER_IDS: z.string().trim().optional().or(z.literal(""))
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(
  input: Record<string, string | undefined> = process.env
): AppEnv {
  const parsed = envSchema.safeParse(input);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return parsed.data;
}

export const env = parseEnv();
