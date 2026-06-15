import {
  formatJobVacancyNotification,
  type JobVacancyNotification
} from "@/services/telegram/messages";

export type JobNotificationStore = {
  reserveJobNotification(input: {
    jobVacancyId: string;
    channel: "telegram";
    recipient: string;
  }): Promise<boolean>;
  markJobNotificationSent(input: {
    jobVacancyId: string;
    channel: "telegram";
    recipient: string;
    providerMessageId?: string;
  }): Promise<void>;
  markJobNotificationFailed(input: {
    jobVacancyId: string;
    channel: "telegram";
    recipient: string;
    failureReason: string;
  }): Promise<void>;
};

export type JobTelegramSender = {
  sendMessage(input: {
    chatId: string;
    text: string;
    replyMarkup?: unknown;
  }): Promise<{ messageId?: string }>;
};

export async function notifyJobVacancy({
  notification,
  chatId,
  store,
  telegram
}: {
  notification: JobVacancyNotification;
  chatId: string;
  store: JobNotificationStore;
  telegram: JobTelegramSender;
}) {
  const reserved = await store.reserveJobNotification({
    jobVacancyId: notification.jobVacancyId,
    channel: "telegram",
    recipient: chatId
  });

  if (!reserved) {
    return { sent: false, reason: "already_notified" as const };
  }

  try {
    const message = await telegram.sendMessage({
      chatId,
      text: formatJobVacancyNotification(notification)
    });

    await store.markJobNotificationSent({
      jobVacancyId: notification.jobVacancyId,
      channel: "telegram",
      recipient: chatId,
      providerMessageId: message.messageId?.toString()
    });

    return { sent: true as const };
  } catch (error) {
    await store.markJobNotificationFailed({
      jobVacancyId: notification.jobVacancyId,
      channel: "telegram",
      recipient: chatId,
      failureReason: error instanceof Error ? error.message : "Unknown Telegram error"
    });
    throw error;
  }
}
