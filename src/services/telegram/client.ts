export class TelegramClient {
  constructor(private readonly botToken: string) {}

  async sendMessage(input: {
    chatId: string;
    text: string;
    replyMarkup?: unknown;
  }): Promise<{ messageId?: string }> {
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: input.chatId,
          text: input.text,
          parse_mode: "HTML",
          disable_web_page_preview: false,
          reply_markup: input.replyMarkup
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram sendMessage failed with status ${response.status}`);
    }

    const body = (await response.json()) as {
      result?: { message_id?: number };
    };

    return { messageId: body.result?.message_id?.toString() };
  }

  async answerCallbackQuery(input: { callbackQueryId: string; text?: string }) {
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          callback_query_id: input.callbackQueryId,
          text: input.text
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        `Telegram answerCallbackQuery failed with status ${response.status}`
      );
    }
  }
}
