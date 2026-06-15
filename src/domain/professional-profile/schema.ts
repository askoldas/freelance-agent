import { z } from "zod";

export const recordStatusSchema = z.enum(["approved", "needs_review", "private"]);
export const proficiencySchema = z.enum(["strong", "working", "adjacent", "learning"]);

const idSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const yearSchema = z.number().int().min(1900).max(2100);
const nullableUrlSchema = z.url().nullable();

const resultClaimSchema = z.object({
  claim: z.string().min(1),
  status: recordStatusSchema,
  publicUseAllowed: z.boolean(),
  evidenceSource: z.string().nullable(),
  comparisonPeriod: z.string().nullable()
});

export const professionalProfileSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    profile: z.object({
      name: z.string().min(1),
      location: z.string().min(1),
      timezone: z.string().min(1),
      remoteReady: z.boolean(),
      headline: z.string().min(1),
      shortSummary: z.string().min(1),
      fullSummary: z.string().min(1),
      portfolioUrl: z.url().optional(),
      contact: z.object({
        email: z.email(),
        phone: z.string().min(1)
      }),
      preferredWorkTypes: z.array(z.string().min(1)),
      availabilityNotes: z.string().min(1),
      status: recordStatusSchema
    }),
    overallExperience: z.array(
      z.object({
        id: idSchema,
        area: z.string().min(1),
        startYear: yearSchema.optional(),
        yearsApproximate: z.number().int().positive().optional(),
        minimumProjectCount: z.number().int().positive().optional(),
        exactCount: z.boolean().optional(),
        summary: z.string().min(1),
        workTypes: z.array(z.string()).optional(),
        platforms: z.array(z.string()).optional(),
        publicClaim: z.string().min(1),
        status: recordStatusSchema
      })
    ),
    capabilities: z.array(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        proficiency: proficiencySchema,
        status: recordStatusSchema
      })
    ),
    technologies: z.array(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        proficiency: proficiencySchema,
        status: recordStatusSchema
      })
    ),
    experienceEntries: z.array(
      z
        .object({
          id: idSchema,
          company: z.string().min(1),
          role: z.string().min(1),
          startYear: yearSchema,
          endYear: yearSchema.nullable(),
          employmentType: z.string().min(1),
          summary: z.string().min(1),
          responsibilities: z.array(z.string().min(1)),
          status: recordStatusSchema
        })
        .refine((entry) => entry.endYear === null || entry.endYear >= entry.startYear, {
          message: "endYear must be greater than or equal to startYear"
        })
    ),
    cases: z.array(
      z.object({
        id: idSchema,
        title: z.string().min(1),
        type: z.string().min(1),
        url: nullableUrlSchema,
        status: recordStatusSchema,
        projectStatus: z.string().min(1),
        clientType: z.string().optional(),
        clientName: z.string().nullable().optional(),
        confidential: z.boolean().optional(),
        publicVisibility: z.boolean(),
        role: z.array(z.string().min(1)),
        businessProblem: z.string().nullable(),
        solution: z.string().min(1),
        features: z.array(z.string()),
        technologies: z.array(z.string()),
        results: z.array(resultClaimSchema),
        proposalSafeSummary: z.string().min(1)
      })
    ),
    education: z.array(
      z
        .object({
          institution: z.string().min(1),
          program: z.string().min(1),
          startYear: yearSchema,
          endYear: yearSchema,
          status: recordStatusSchema
        })
        .refine((entry) => entry.endYear >= entry.startYear, {
          message: "education endYear must be greater than or equal to startYear"
        })
    ),
    languages: z.array(
      z.object({
        name: z.string().min(1),
        level: z.string().min(1),
        notes: z.string().optional(),
        status: recordStatusSchema
      })
    ),
    proposalPreferences: z.object({
      defaultTone: z.string().min(1),
      defaultLength: z.string().min(1),
      maxPortfolioItems: z.number().int().min(1).max(5),
      startWithClientProblem: z.boolean(),
      includeClarifyingQuestion: z.boolean(),
      mentionAdjacentSkillsHonestly: z.boolean(),
      neverInventExperience: z.boolean(),
      avoidPhrases: z.array(z.string())
    }),
    claimRules: z.object({
      allowedStatusesForPublicDocuments: z.array(recordStatusSchema),
      blockedStatusesForPublicDocuments: z.array(recordStatusSchema),
      forbidTechnologyExperienceInflation: z.boolean(),
      examples: z.array(
        z.object({
          allowed: z.string().optional(),
          forbidden: z.string().optional()
        })
      )
    })
  })
  .superRefine((profile, ctx) => {
    const seen = new Set<string>();
    const check = (id: string, path: (string | number)[]) => {
      if (seen.has(id)) {
        ctx.addIssue({ code: "custom", message: `Duplicate ID: ${id}`, path });
      }
      seen.add(id);
    };

    profile.overallExperience.forEach((entry, index) =>
      check(entry.id, ["overallExperience", index, "id"])
    );
    profile.experienceEntries.forEach((entry, index) =>
      check(entry.id, ["experienceEntries", index, "id"])
    );
    profile.cases.forEach((entry, index) => check(entry.id, ["cases", index, "id"]));

    for (const item of profile.cases.flatMap((entry) => entry.results)) {
      if (item.status !== "approved" && item.publicUseAllowed) {
        ctx.addIssue({
          code: "custom",
          message: "Only approved result claims may set publicUseAllowed"
        });
      }
    }
  });

export type ProfessionalProfile = z.infer<typeof professionalProfileSchema>;
export type RecordStatus = z.infer<typeof recordStatusSchema>;
