import { describe, expect, it } from "vitest";
import { createContentFingerprint } from "../src/domain/common/fingerprint";
import { canonicalizeUrl } from "../src/domain/common/url";

describe("URL canonicalization and fingerprints", () => {
  it("removes tracking noise from URLs", () => {
    expect(
      canonicalizeUrl(
        "HTTPS://www.Example.com/projects/123/?utm_source=newsletter&b=2&a=1#details"
      )
    ).toBe("https://example.com/projects/123?a=1&b=2");
  });

  it("creates stable content hashes for equivalent text", () => {
    expect(createContentFingerprint(["Build a CRM API integration!"])).toBe(
      createContentFingerprint(["build a crm api integration"])
    );
  });
});
