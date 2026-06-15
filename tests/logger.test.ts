import { describe, expect, it } from "vitest";
import { redactSensitiveMetadata } from "../src/lib/logger";

describe("logger redaction", () => {
  it("redacts sensitive metadata recursively", () => {
    const redacted = redactSensitiveMetadata({
      safe: "visible",
      authorization: "Bearer abc",
      nested: {
        apiKey: "secret-value",
        value: 12
      }
    });

    expect(redacted).toEqual({
      safe: "visible",
      authorization: "[redacted]",
      nested: {
        apiKey: "[redacted]",
        value: 12
      }
    });
  });
});
