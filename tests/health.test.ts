import { describe, expect, it } from "vitest";
import { GET } from "../src/app/api/health/route";

describe("health route", () => {
  it("returns a healthy service response", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.service).toBe("freelance-agent");
    expect(body.timestamp).toEqual(expect.any(String));
  });
});
