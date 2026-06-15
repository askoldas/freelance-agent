import { describe, expect, it } from "vitest";
import { parseTelegramCallbackData } from "../src/services/telegram/callbacks";
import {
  handleTelegramUpdate,
  type TelegramActionStore
} from "../src/use-cases/handle-telegram-update";

const opportunityId = "00000000-0000-4000-8000-000000000999";

describe("Telegram authorization and callbacks", () => {
  it("parses callback data", () => {
    expect(parseTelegramCallbackData(`save:${opportunityId}`)).toEqual({
      action: "save",
      opportunityId
    });
  });

  it("rejects unauthorized users", async () => {
    const result = await handleTelegramUpdate({
      payload: {
        update_id: 1,
        callback_query: {
          id: "callback-1",
          from: { id: 5 },
          data: `save:${opportunityId}`
        }
      },
      allowedUserIds: "9",
      store: {
        async saveOpportunity() {},
        async rejectOpportunity() {}
      },
      telegram: {
        async answerCallbackQuery() {},
        async sendMessage() {
          return {};
        }
      }
    });

    expect(result.status).toBe(403);
  });

  it("handles save callbacks for authorized users", async () => {
    const saved: string[] = [];
    const store: TelegramActionStore = {
      async saveOpportunity(id) {
        saved.push(id);
      },
      async rejectOpportunity() {}
    };

    const result = await handleTelegramUpdate({
      payload: {
        update_id: 1,
        callback_query: {
          id: "callback-1",
          from: { id: 9 },
          data: `save:${opportunityId}`
        }
      },
      allowedUserIds: "9",
      store,
      telegram: {
        async answerCallbackQuery() {},
        async sendMessage() {
          return {};
        }
      }
    });

    expect(result.status).toBe(200);
    expect(saved).toEqual([opportunityId]);
  });

  it("rejects unauthorized text search users", async () => {
    const result = await handleTelegramUpdate({
      payload: {
        update_id: 2,
        message: {
          message_id: 1,
          from: { id: 5 },
          chat: { id: 5, type: "private" },
          text: "/search Latvia"
        }
      },
      allowedUserIds: "9",
      store: {
        async saveOpportunity() {},
        async rejectOpportunity() {}
      },
      telegram: {
        async answerCallbackQuery() {},
        async sendMessage() {
          return {};
        }
      }
    });

    expect(result.status).toBe(403);
  });

  it("passes parsed job searches to the configured runner", async () => {
    const requests: string[] = [];
    const messages: string[] = [];
    const result = await handleTelegramUpdate({
      payload: {
        update_id: 3,
        message: {
          message_id: 1,
          from: { id: 9 },
          chat: { id: 9, type: "private" },
          text: "/search jobs Latvia web developer"
        }
      },
      allowedUserIds: "9",
      store: {
        async saveOpportunity() {},
        async rejectOpportunity() {}
      },
      telegram: {
        async answerCallbackQuery() {},
        async sendMessage(input) {
          messages.push(input.text);
          return {};
        }
      },
      runSearch: async ({ request }) => {
        requests.push(request.agentType);
      }
    });

    expect(result.status).toBe(200);
    expect(requests).toEqual(["jobs"]);
    expect(messages[0]).toContain("Job Search Agent request received");
  });

  it("answers ping messages for authorized users", async () => {
    const messages: string[] = [];
    const result = await handleTelegramUpdate({
      payload: {
        update_id: 4,
        message: {
          message_id: 1,
          from: { id: 9 },
          chat: { id: 9, type: "private" },
          text: "/ping"
        }
      },
      allowedUserIds: "9",
      store: {
        async saveOpportunity() {},
        async rejectOpportunity() {}
      },
      telegram: {
        async answerCallbackQuery() {},
        async sendMessage(input) {
          messages.push(input.text);
          return {};
        }
      }
    });

    expect(result.status).toBe(200);
    expect(messages).toEqual(["Pong. Telegram bot is connected."]);
  });
});
