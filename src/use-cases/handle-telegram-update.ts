import { telegramUpdateSchema } from "@/domain/telegram/schema";
import {
  formatTelegramSearchUsage,
  parseTelegramSearchRequest,
  type TelegramSearchRequest
} from "@/domain/telegram/search-request";
import {
  parseTelegramCallbackData,
  parseAllowedTelegramUserIds
} from "@/services/telegram/callbacks";

export type TelegramActionStore = {
  saveOpportunity(opportunityId: string): Promise<void>;
  rejectOpportunity(opportunityId: string): Promise<void>;
};

export type TelegramResponder = {
  answerCallbackQuery(input: { callbackQueryId: string; text?: string }): Promise<void>;
  sendMessage(input: { chatId: string; text: string }): Promise<{ messageId?: string }>;
};

export type TelegramSearchRunner = (input: {
  request: TelegramSearchRequest;
  chatId: string;
}) => Promise<unknown>;

export async function handleTelegramUpdate(input: {
  payload: unknown;
  allowedUserIds: string;
  store: TelegramActionStore;
  telegram: TelegramResponder;
  runSearch?: TelegramSearchRunner;
}) {
  const update = telegramUpdateSchema.parse(input.payload);
  const allowedIds = parseAllowedTelegramUserIds(input.allowedUserIds);
  const actorId = update.callback_query?.from.id ?? update.message?.from?.id;

  if (!actorId || !allowedIds.has(actorId)) {
    return { ok: false, status: 403, message: "Unauthorized" };
  }

  if (!update.callback_query) {
    const messageText = update.message?.text?.trim() ?? "";
    const chatId = update.message?.chat.id.toString();

    if (!chatId) {
      return { ok: true, status: 200, message: "No chat to answer." };
    }

    if (/^\/help(?:@\w+)?$/i.test(messageText)) {
      await input.telegram.sendMessage({
        chatId,
        text: formatTelegramSearchUsage()
      });

      return { ok: true, status: 200, message: "Help sent." };
    }

    if (/^\/ping(?:@\w+)?$/i.test(messageText)) {
      await input.telegram.sendMessage({
        chatId,
        text: "Pong. Telegram bot is connected."
      });

      return { ok: true, status: 200, message: "Ping answered." };
    }

    if (/^\/status(?:@\w+)?$/i.test(messageText)) {
      await input.telegram.sendMessage({
        chatId,
        text: [
          "<b>Bot status</b>",
          "Telegram webhook reached the application.",
          "Search configuration is checked when a search command starts."
        ].join("\n")
      });

      return { ok: true, status: 200, message: "Status sent." };
    }

    const searchRequest = parseTelegramSearchRequest(messageText);

    if (!searchRequest) {
      await input.telegram.sendMessage({
        chatId,
        text: formatTelegramSearchUsage()
      });

      return { ok: true, status: 200, message: "Usage sent." };
    }

    if (!input.runSearch) {
      await input.telegram.sendMessage({
        chatId,
        text: "Search is not configured on this deployment."
      });

      return { ok: false, status: 500, message: "Search is not configured." };
    }

    await input.telegram.sendMessage({
      chatId,
      text: [
        `<b>${searchRequest.agentType === "jobs" ? "Job Search Agent" : "Freelance Agent"} request received</b>`,
        `Geography: ${searchRequest.locations.join(", ")} (${searchRequest.geographyMode})`,
        `Keywords: ${searchRequest.keywords.join(", ") || "broad"}`,
        "Starting search now."
      ].join("\n")
    });

    try {
      await input.runSearch({
        request: searchRequest,
        chatId
      });
    } catch (error) {
      await input.telegram.sendMessage({
        chatId,
        text: [
          "<b>Search failed</b>",
          "The bot received your message, but the search pipeline failed before completion.",
          error instanceof Error ? `Reason: ${error.message}` : "Reason: Unknown error"
        ].join("\n")
      });
      throw error;
    }

    return {
      ok: true,
      status: 200,
      message: "Search completed."
    };
  }

  const callback = parseTelegramCallbackData(update.callback_query.data);
  let responseText = "Action received.";

  if (callback.action === "save") {
    await input.store.saveOpportunity(callback.opportunityId);
    responseText = "Saved for review.";
  }

  if (callback.action === "reject") {
    await input.store.rejectOpportunity(callback.opportunityId);
    responseText = "Rejected.";
  }

  if (callback.action === "details") {
    responseText = "Details are available in the dashboard.";
  }

  if (callback.action === "proposal") {
    responseText = "Proposal generation belongs to the next milestone.";
  }

  await input.telegram.answerCallbackQuery({
    callbackQueryId: update.callback_query.id,
    text: responseText
  });

  return { ok: true, status: 200, message: responseText };
}
