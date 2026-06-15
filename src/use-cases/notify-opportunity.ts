import {
  buildOpportunityKeyboard,
  formatOpportunityNotification,
  type OpportunityNotification
} from "@/services/telegram/messages";

export type NotificationStore = {
  reserveNotification(input: {
    opportunityId: string;
    channel: "telegram";
    recipient: string;
  }): Promise<boolean>;
  markNotificationSent(input: {
    opportunityId: string;
    channel: "telegram";
    recipient: string;
    providerMessageId?: string;
  }): Promise<void>;
  markNotificationFailed(input: {
    opportunityId: string;
    channel: "telegram";
    recipient: string;
    failureReason: string;
  }): Promise<void>;
};

export type TelegramSender = {
  sendMessage(input: {
    chatId: string;
    text: string;
    replyMarkup?: unknown;
  }): Promise<{ messageId?: string }>;
};

export async function notifyOpportunity(input: {
  notification: OpportunityNotification;
  chatId: string;
  store: NotificationStore;
  telegram: TelegramSender;
}) {
  const reserved = await input.store.reserveNotification({
    opportunityId: input.notification.opportunityId,
    channel: "telegram",
    recipient: input.chatId
  });

  if (!reserved) {
    return { sent: false, reason: "duplicate" as const };
  }

  try {
    const result = await input.telegram.sendMessage({
      chatId: input.chatId,
      text: formatOpportunityNotification(input.notification),
      replyMarkup: buildOpportunityKeyboard(input.notification.opportunityId)
    });

    await input.store.markNotificationSent({
      opportunityId: input.notification.opportunityId,
      channel: "telegram",
      recipient: input.chatId,
      providerMessageId: result.messageId
    });

    return { sent: true, reason: "sent" as const };
  } catch (error) {
    await input.store.markNotificationFailed({
      opportunityId: input.notification.opportunityId,
      channel: "telegram",
      recipient: input.chatId,
      failureReason: error instanceof Error ? error.message : "Unknown Telegram error"
    });
    throw error;
  }
}
