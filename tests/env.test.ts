import { describe, expect, it } from "vitest";
import { parseEnv } from "../src/config/env";

describe("environment validation", () => {
  it("applies safe defaults for the foundation pass", () => {
    const env = parseEnv({});

    expect(env.NODE_ENV).toBe("development");
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("reports invalid values clearly", () => {
    expect(() =>
      parseEnv({
        NODE_ENV: "prod",
        APP_BASE_URL: "not-a-url"
      })
    ).toThrow(/Invalid environment configuration/);
  });
});
