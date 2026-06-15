import { describe, expect, it } from "vitest";
import profileFixture from "../data/professional-profile.json";
import { professionalProfileSchema } from "../src/domain/professional-profile/schema";
import {
  importProfessionalProfile,
  type ProfessionalProfileWriter
} from "../src/services/professional-profile/importer";

class MemoryWriter implements ProfessionalProfileWriter {
  rows = new Map<string, Record<string, unknown>>();
  operationalRows = new Map<string, string>([["opportunity-1", "preserved"]]);

  async upsert(
    table: string,
    match: Record<string, unknown>,
    row: Record<string, unknown>
  ) {
    const key = `${table}:${JSON.stringify(match)}`;
    const existing = this.rows.get(key);

    if (!existing) {
      this.rows.set(key, row);
      return "inserted" as const;
    }

    const changed = Object.entries(row).some(([field, value]) => {
      if (field === "updated_at") {
        return false;
      }
      return JSON.stringify(existing[field] ?? null) !== JSON.stringify(value ?? null);
    });

    if (!changed) {
      return "unchanged" as const;
    }

    this.rows.set(key, row);
    return "updated" as const;
  }

  async deactivateMissingCapabilities() {
    return 0;
  }
}

describe("professional profile import", () => {
  it("is idempotent and preserves operational data", async () => {
    const profile = professionalProfileSchema.parse(profileFixture);
    const writer = new MemoryWriter();

    const first = await importProfessionalProfile(profile, writer);
    const second = await importProfessionalProfile(profile, writer);

    expect(first.capabilities.inserted).toBe(profile.capabilities.length);
    expect(second.capabilities.unchanged).toBe(profile.capabilities.length);
    expect(writer.operationalRows.get("opportunity-1")).toBe("preserved");
  });
});
