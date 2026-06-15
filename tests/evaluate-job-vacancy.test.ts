import { describe, expect, it } from "vitest";
import type { AiProvider } from "../src/services/ai/provider";
import {
  evaluateJobVacancy,
  type JobVacancyEvaluationStore
} from "../src/use-cases/evaluate-job-vacancy";

const extraction = {
  title: "Workflow Automation Specialist",
  company: "Operations Co",
  applicationUrl: "https://example.com/jobs/workflow-automation/apply",
  description: "Improve workflows and integrate business systems.",
  responsibilities: ["Map processes", "Build automations", "Integrate APIs"],
  requiredSkills: ["Automation", "APIs", "Process improvement"],
  preferredSkills: ["n8n", "Airtable"],
  seniority: "mid-level",
  employmentType: "contract" as const,
  contractType: "B2B",
  salaryMin: 3000,
  salaryMax: 4500,
  currency: "EUR",
  salaryPeriod: "month",
  country: "Latvia",
  city: "Riga",
  remoteType: "remote" as const,
  timezoneExpectations: "European working hours",
  languageRequirements: ["English"],
  missingInformation: []
};

const adjacentEvaluation = {
  score: 78,
  fitLevel: "adjacent" as const,
  recommendation: "apply" as const,
  summary: "Strong transferable fit for automation and operations work.",
  strongMatches: ["Business-process automation", "API integration"],
  transferableMatches: ["Operations background", "Airtable workflow systems"],
  missingRequirements: ["Exact n8n production depth is not fully proven"],
  learningRequirements: ["Review employer workflow stack"],
  risks: ["Tool-specific ramp-up may be needed"],
  salaryObservations: "Salary is stated and reasonable for contract work.",
  locationObservations: "Remote Latvia/EU-compatible role.",
  companyCredibility: "Specific role, company, and application URL are present.",
  applicationEffort: "Moderate tailoring required.",
  realisticChance: "Reasonable if transferable examples are framed clearly.",
  strategicValue: "Good bridge between automation and operations work.",
  suggestedCvEmphasis: ["Automation workflows", "Operations improvement"],
  suggestedCoverLetterEmphasis: ["Reducing manual workflow effort"],
  suggestedInterviewPreparation: ["Prepare Airtable and AI automation examples"]
};

describe("evaluate job vacancy", () => {
  it("extracts, evaluates, adjusts, and stores an adjacent-fit vacancy", async () => {
    const ai: AiProvider = {
      async generateStructured(input) {
        return {
          data: (input.schemaName === "JobVacancyExtractionOutput"
            ? extraction
            : adjacentEvaluation) as never,
          model: "test-model"
        };
      }
    };
    const saved: unknown[] = [];
    const store: JobVacancyEvaluationStore = {
      async saveJobVacancyEvaluation(input) {
        saved.push(input);
        return "job-evaluation-1";
      }
    };

    const result = await evaluateJobVacancy({
      vacancy: {
        id: "vacancy-1",
        title: "Workflow Automation Specialist",
        sourceUrl: "https://example.com/jobs/workflow-automation",
        rawText:
          "Open role for workflow automation specialist. Build automations and improve operations."
      },
      profile: {
        id: "profile-1",
        name: "Owner",
        headline: "Developer and automation specialist",
        summary: "Builds web apps and automation systems."
      },
      capabilities: [],
      ai,
      store
    });

    expect(result.evaluationId).toBe("job-evaluation-1");
    expect(result.evaluation.fitLevel).toBe("adjacent");
    expect(result.evaluation.recommendation).toBe("apply");
    expect(saved).toHaveLength(1);
  });

  it("rejects invalid job evaluation output", async () => {
    const ai: AiProvider = {
      async generateStructured(input) {
        return {
          data: input.schema.parse({ bad: true }),
          model: "test-model"
        };
      }
    };
    const store: JobVacancyEvaluationStore = {
      async saveJobVacancyEvaluation() {
        return "never";
      }
    };

    await expect(
      evaluateJobVacancy({
        vacancy: {
          id: "vacancy-1",
          title: "Bad output",
          sourceUrl: "https://example.com/jobs/bad",
          rawText: "Hiring developer."
        },
        profile: {
          id: "profile-1",
          name: "Owner",
          headline: "Developer",
          summary: "Builds web apps."
        },
        capabilities: [],
        ai,
        store
      })
    ).rejects.toThrow();
  });
});
