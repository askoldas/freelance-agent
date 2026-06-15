import { describe, expect, it } from "vitest";
import {
  notifyOpportunity,
  type NotificationStore
} from "../src/use-cases/notify-opportunity";
import {
  notifyJobVacancy,
  type JobNotificationStore
} from "../src/use-cases/notify-job-vacancy";

function notificationStore(): NotificationStore {
  const seen = new Set<string>();

  return {
    async reserveNotification(input) {
      const key = `${input.opportunityId}:${input.channel}:${input.recipient}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    },
    async markNotificationSent() {},
    async markNotificationFailed() {}
  };
}

describe("duplicate notification prevention", () => {
  it("does not send duplicate Telegram notifications", async () => {
    const store = notificationStore();
    let sends = 0;
    const notification = {
      opportunityId: "00000000-0000-4000-8000-000000000999",
      title: "Project",
      sourceUrl: "https://example.com",
      sourceName: "Tavily",
      score: 80,
      fitLevel: "direct",
      recommendation: "apply",
      summary: "Good fit.",
      matchReasons: ["Relevant."],
      risks: ["Scope unknown."]
    };

    await notifyOpportunity({
      notification,
      chatId: "9",
      store,
      telegram: {
        async sendMessage() {
          sends += 1;
          return { messageId: "1" };
        }
      }
    });

    const duplicate = await notifyOpportunity({
      notification,
      chatId: "9",
      store,
      telegram: {
        async sendMessage() {
          sends += 1;
          return { messageId: "2" };
        }
      }
    });

    expect(sends).toBe(1);
    expect(duplicate.sent).toBe(false);
  });

  it("does not send duplicate Telegram job vacancy notifications", async () => {
    const seen = new Set<string>();
    const store: JobNotificationStore = {
      async reserveJobNotification(input) {
        const key = `${input.jobVacancyId}:${input.channel}:${input.recipient}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      },
      async markJobNotificationSent() {},
      async markJobNotificationFailed() {}
    };
    let sends = 0;
    const notification = {
      jobVacancyId: "00000000-0000-4000-8000-000000000888",
      role: "Automation Specialist",
      company: "Example Co",
      sourceUrl: "https://example.com/jobs/automation",
      applicationUrl: "https://example.com/jobs/automation/apply",
      score: 82,
      fitLevel: "adjacent",
      recommendation: "apply",
      freshness: "fresh",
      location: "Europe",
      remoteType: "remote",
      strongestMatch: "Workflow automation",
      mainGap: "Exact tool depth",
      summary: "Good transferable fit."
    };

    await notifyJobVacancy({
      notification,
      chatId: "9",
      store,
      telegram: {
        async sendMessage(input) {
          sends += 1;
          expect(input.text).toContain("Job vacancy");
          return { messageId: "1" };
        }
      }
    });

    const duplicate = await notifyJobVacancy({
      notification,
      chatId: "9",
      store,
      telegram: {
        async sendMessage() {
          sends += 1;
          return { messageId: "2" };
        }
      }
    });

    expect(sends).toBe(1);
    expect(duplicate.sent).toBe(false);
  });
});
