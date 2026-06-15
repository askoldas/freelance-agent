import { env } from "@/config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogMetadata = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const sensitiveKeyPattern =
  /(authorization|cookie|password|secret|token|key|credential)/i;

export function redactSensitiveMetadata(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveMetadata(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        sensitiveKeyPattern.test(key)
          ? "[redacted]"
          : redactSensitiveMetadata(nestedValue)
      ])
    );
  }

  return value;
}

function shouldLog(level: LogLevel) {
  return levelPriority[level] >= levelPriority[env.LOG_LEVEL];
}

function writeLog(level: LogLevel, message: string, metadata: LogMetadata = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const safeMetadata = redactSensitiveMetadata(metadata) as LogMetadata;

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...safeMetadata
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
}

export const logger = {
  debug: (message: string, metadata?: LogMetadata) =>
    writeLog("debug", message, metadata),
  info: (message: string, metadata?: LogMetadata) => writeLog("info", message, metadata),
  warn: (message: string, metadata?: LogMetadata) => writeLog("warn", message, metadata),
  error: (message: string, metadata?: LogMetadata) => writeLog("error", message, metadata)
};
