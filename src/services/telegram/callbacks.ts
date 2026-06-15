import {
  telegramCallbackDataSchema,
  type TelegramCallbackData
} from "@/domain/telegram/schema";

export function encodeTelegramCallback(data: TelegramCallbackData): string {
  return `${data.action}:${data.opportunityId}`;
}

export function parseTelegramCallbackData(input: string): TelegramCallbackData {
  const [action, opportunityId] = input.split(":");

  return telegramCallbackDataSchema.parse({
    action,
    opportunityId
  });
}

export function parseAllowedTelegramUserIds(input: string | undefined): Set<number> {
  return new Set(
    (input ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => Number(value))
      .filter(Number.isInteger)
  );
}
