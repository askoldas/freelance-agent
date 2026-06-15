import { describe, expect, it } from "vitest";
import {
  determineJobFreshness,
  jobVacancyEvaluationOutputSchema,
  normalizeEmploymentType,
  normalizedJobVacancyInputSchema,
  normalizeRemoteType
} from "../src/domain/job-vacancies/schema";

const now = new Date("2026-06-15T12:00:00.000Z");

describe("job vacancy domain schema", () => {
  it("validates a current remote web developer vacancy", () => {
    const parsed = normalizedJobVacancyInputSchema.parse({
      sourceType: "tavily",
      sourceExternalId: "https://example.com/jobs/full-stack-developer",
      sourceUrl: "https://example.com/jobs/full-stack-developer",
      sourceTitle: "Full-stack Web Developer",
      rawText:
        "We are hiring a full-stack web developer. Apply with your CV. Remote Europe.",
      canonicalUrl: "https://example.com/jobs/full-stack-developer",
      contentHash: "a".repeat(64),
      title: "Full-stack Web Developer",
      company: "Example Software",
      applicationUrl: "https://example.com/jobs/full-stack-developer/apply",
      description: "Build React and API-backed web applications.",
      responsibilities: ["Build product features", "Integrate third-party APIs"],
      requiredSkills: ["React", "JavaScript", "REST APIs"],
      employmentType: "contract",
      salaryMin: 3500,
      salaryMax: 5000,
      currency: "EUR",
      salaryPeriod: "month",
      country: "Latvia",
      city: "Riga",
      remoteType: "remote",
      publishedAt: "2026-06-10T09:00:00.000Z",
      vacancyStatus: "validated",
      freshnessStatus: "fresh",
      contentType: "active_vacancy",
      validationEvidence: [
        "Clear role title",
        "Employer named",
        "Application instructions present"
      ],
      prefilterScore: 88
    });

    expect(parsed.employmentType).toBe("contract");
    expect(parsed.remoteType).toBe("remote");
    expect(parsed.freshnessStatus).toBe("fresh");
  });

  it("keeps informational job content out of active vacancy types", () => {
    const parsed = normalizedJobVacancyInputSchema.parse({
      sourceType: "tavily",
      sourceUrl: "https://example.com/blog/web-developer-salary-guide",
      sourceTitle: "Web Developer Salary Guide",
      rawText: "A salary guide explaining average web developer salaries.",
      canonicalUrl: "https://example.com/blog/web-developer-salary-guide",
      contentHash: "b".repeat(64),
      vacancyStatus: "rejected",
      contentType: "salary_guide",
      rejectionCategory: "salary_guide",
      rejectionReason: "Salary guide is informational and not a specific vacancy."
    });

    expect(parsed.contentType).toBe("salary_guide");
    expect(parsed.rejectionCategory).toBe("salary_guide");
  });

  it("calculates vacancy freshness from publication and deadline metadata", () => {
    expect(
      determineJobFreshness({
        publishedAt: "2026-06-05T12:00:00.000Z",
        now
      })
    ).toBe("fresh");

    expect(
      determineJobFreshness({
        publishedAt: "2026-05-25T12:00:00.000Z",
        now
      })
    ).toBe("aging");

    expect(
      determineJobFreshness({
        publishedAt: "2026-04-01T12:00:00.000Z",
        now
      })
    ).toBe("stale");

    expect(
      determineJobFreshness({
        publishedAt: "2026-06-10T12:00:00.000Z",
        applicationDeadline: "2026-06-01T12:00:00.000Z",
        now
      })
    ).toBe("expired");
  });

  it("normalizes employment and remote terms", () => {
    expect(normalizeEmploymentType("full-time")).toBe("full_time");
    expect(normalizeEmploymentType("B2B")).toBe("contract");
    expect(normalizeEmploymentType("intern")).toBe("internship");
    expect(normalizeEmploymentType("mystery arrangement")).toBe("unknown");

    expect(normalizeRemoteType("Remote Europe")).toBe("remote");
    expect(normalizeRemoteType("Hybrid in Riga")).toBe("hybrid");
    expect(normalizeRemoteType("office based")).toBe("onsite");
    expect(normalizeRemoteType(undefined)).toBe("unspecified");
  });

  it("validates vacancy-specific evaluation output", () => {
    const parsed = jobVacancyEvaluationOutputSchema.parse({
      score: 81,
      fitLevel: "adjacent",
      recommendation: "apply",
      summary: "A realistic remote automation role with transferable fit.",
      strongMatches: ["Workflow automation and API integration"],
      transferableMatches: ["Operations background maps to process work"],
      missingRequirements: ["No exact HR platform experience stated"],
      learningRequirements: ["Review employer's automation stack"],
      risks: ["Seniority may be higher than the public listing suggests"],
      salaryObservations: "Salary is present and acceptable for part-time contract work.",
      locationObservations: "Remote Europe is compatible with Europe/Riga hours.",
      companyCredibility: "Company has a named role and application path.",
      applicationEffort: "Moderate CV tailoring required.",
      realisticChance: "Reasonable if adjacent experience is framed honestly.",
      strategicValue: "Useful bridge between automation and operations work.",
      suggestedCvEmphasis: ["Automation systems", "Operations improvement"],
      suggestedCoverLetterEmphasis: ["Translate manual workflows into systems"],
      suggestedInterviewPreparation: ["Prepare examples of Airtable and AI workflows"]
    });

    expect(parsed.fitLevel).toBe("adjacent");
  });
});
