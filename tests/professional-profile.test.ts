import { describe, expect, it } from "vitest";
import profileFixture from "../data/professional-profile.json";
import {
  professionalProfileSchema,
  type ProfessionalProfile
} from "../src/domain/professional-profile/schema";
import { createDocumentClaim } from "../src/services/professional-profile/document-claims";
import {
  assertNoTechnologyExperienceInflation,
  selectRelevantProfessionalContext
} from "../src/services/professional-profile/relevance";

function cloneProfile(): ProfessionalProfile {
  return professionalProfileSchema.parse(structuredClone(profileFixture));
}

describe("professional profile validation and claim safety", () => {
  it("validates the canonical profile dataset", () => {
    const profile = cloneProfile();

    expect(profile.profile.name).toBe("Askold Makrikov");
    expect(profile.cases.length).toBeGreaterThan(0);
  });

  it("rejects invalid record statuses", () => {
    const invalid = structuredClone(profileFixture);
    invalid.capabilities[0].status = "draft";

    expect(() => professionalProfileSchema.parse(invalid)).toThrow();
  });

  it("rejects duplicate IDs", () => {
    const invalid = structuredClone(profileFixture);
    invalid.cases[1].id = invalid.cases[0].id;

    expect(() => professionalProfileSchema.parse(invalid)).toThrow(/Duplicate ID/);
  });

  it("selects only approved public claims for public documents", () => {
    const profile = cloneProfile();
    const context = selectRelevantProfessionalContext(
      profile,
      { rawText: "Need WordPress and WooCommerce developer for ecommerce project" },
      { publicDocument: true }
    );

    expect(context.capabilities.every((item) => item.status === "approved")).toBe(true);
    expect(context.cases.flatMap((item) => item.results)).toEqual([]);
  });

  it("excludes needs_review and private records from public selection", () => {
    const profile = cloneProfile();
    profile.capabilities[0].status = "needs_review";
    profile.technologies[0].status = "private";

    const context = selectRelevantProfessionalContext(
      profile,
      { rawText: "Need Next.js React developer" },
      { publicDocument: true }
    );

    expect(context.capabilities).not.toContainEqual(
      expect.objectContaining({ status: "needs_review" })
    );
    expect(context.technologies).not.toContainEqual(
      expect.objectContaining({ status: "private" })
    );
  });

  it("sanitizes confidential cases for public output", () => {
    const profile = cloneProfile();
    const context = selectRelevantProfessionalContext(
      profile,
      { rawText: "Need automation and lead research workflow" },
      { publicDocument: true }
    );
    const confidential = context.cases.find(
      (item) => item.id === "medical-holding-automation"
    );

    expect(confidential).toMatchObject({
      confidential: true,
      clientName: null,
      businessProblem: null
    });
    expect(confidential?.solution).toBe(confidential?.proposalSafeSummary);
  });

  it("selects relevant cases and caps proposals at two cases", () => {
    const profile = cloneProfile();
    const context = selectRelevantProfessionalContext(
      profile,
      { rawText: "Need Next.js React portal and dashboard" },
      { publicDocument: true, maxCases: 2 }
    );

    expect(context.cases.length).toBeLessThanOrEqual(2);
    expect(context.cases.map((item) => item.id)).toEqual(
      expect.arrayContaining(["ilab"])
    );
  });

  it("prevents technology-experience inflation", () => {
    expect(() =>
      assertNoTechnologyExperienceInflation("20 years of Next.js experience.")
    ).toThrow();
    expect(() =>
      assertNoTechnologyExperienceInflation(
        "Around 20 years of web-development experience."
      )
    ).not.toThrow();
  });

  it("requires generated document claims to reference source records", () => {
    expect(
      createDocumentClaim({
        claimText: "Around 20 years of web-development experience.",
        source: {
          sourceTable: "professional_overall_experience",
          sourceRecordId: "record-1",
          sourceExternalId: "web-development"
        }
      })
    ).toMatchObject({
      source: { sourceExternalId: "web-development" }
    });

    expect(() =>
      createDocumentClaim({
        claimText: "Untraceable claim",
        source: { sourceTable: "", sourceRecordId: "" }
      })
    ).toThrow();
  });
});
