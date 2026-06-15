import { beforeEach, describe, expect, it, vi } from "vitest";

describe("cron authorization", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("accepts bearer token requests", async () => {
    process.env.CRON_SECRET = "test-secret";
    const { isAuthorizedCronRequest } = await import("../src/app/api/cron/auth");

    const request = new Request("https://agent.test/api/cron/search", {
      headers: { authorization: "Bearer test-secret" }
    });

    expect(isAuthorizedCronRequest(request)).toBe(true);
  });

  it("rejects missing secrets", async () => {
    process.env.CRON_SECRET = "another-secret";
    const { isAuthorizedCronRequest } = await import("../src/app/api/cron/auth");

    const request = new Request("https://agent.test/api/cron/search");

    expect(isAuthorizedCronRequest(request)).toBe(false);
  });

  it("uses the same authorization helper for the jobs cron route", async () => {
    process.env.CRON_SECRET = "jobs-secret";
    const { isAuthorizedCronRequest } = await import("../src/app/api/cron/auth");

    const request = new Request("https://agent.test/api/cron/jobs/search", {
      headers: { "x-cron-secret": "jobs-secret" }
    });

    expect(isAuthorizedCronRequest(request)).toBe(true);
  });
});
