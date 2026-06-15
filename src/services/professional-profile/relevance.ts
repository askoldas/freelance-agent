import type { ProfessionalProfile } from "@/domain/professional-profile/schema";

export type PublicDocumentType =
  | "proposal"
  | "cover_letter"
  | "cv"
  | "bio"
  | "platform_profile";

export type RelevantProfessionalContext = {
  overallExperience: ProfessionalProfile["overallExperience"];
  capabilities: ProfessionalProfile["capabilities"];
  technologies: ProfessionalProfile["technologies"];
  experienceEntries: ProfessionalProfile["experienceEntries"];
  cases: ProfessionalProfile["cases"];
  education: ProfessionalProfile["education"];
  languages: ProfessionalProfile["languages"];
};

function textOfOpportunity(input: {
  title?: string;
  description?: string;
  rawText?: string;
}) {
  return `${input.title ?? ""} ${input.description ?? ""} ${input.rawText ?? ""}`.toLowerCase();
}

function isApproved<T extends { status: string }>(item: T) {
  return item.status === "approved";
}

function matchesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

function publicSafeCases(cases: ProfessionalProfile["cases"]) {
  return cases
    .filter(isApproved)
    .filter((item) => item.publicVisibility)
    .map((item) =>
      item.confidential
        ? {
            ...item,
            clientName: null,
            businessProblem: null,
            solution: item.proposalSafeSummary,
            features: [],
            results: []
          }
        : {
            ...item,
            results: item.results.filter(
              (result) => result.status === "approved" && result.publicUseAllowed
            )
          }
    );
}

export function selectRelevantProfessionalContext(
  profile: ProfessionalProfile,
  opportunity: { title?: string; description?: string; rawText?: string },
  options: { publicDocument?: boolean; maxCases?: number } = {}
): RelevantProfessionalContext {
  const publicDocument = options.publicDocument ?? true;
  const maxCases = options.maxCases ?? profile.proposalPreferences.maxPortfolioItems;
  const text = textOfOpportunity(opportunity);
  const approvedOnly = <T extends { status: string }>(items: T[]) =>
    publicDocument
      ? items.filter(isApproved)
      : items.filter((item) => item.status !== "private");

  const topicGroups = [
    {
      terms: ["wordpress", "woocommerce", "shopify", "prestashop", "cms", "ecommerce"],
      capability: ["cms", "ecommerce", "web_development"],
      technologies: ["wordpress", "woocommerce", "shopify", "prestashop", "payload cms"],
      cases: ["askold-portfolio", "ilab"]
    },
    {
      terms: [
        "automation",
        "workflow",
        "crm",
        "spreadsheet",
        "airtable",
        "lead",
        "sales"
      ],
      capability: ["automation", "operations"],
      technologies: ["airtable", "telegram bot api", "openrouter", "tavily"],
      cases: ["medical-holding-automation", "airtable-workflow", "freelance-agent"]
    },
    {
      terms: ["next", "react", "web app", "portal", "dashboard", "frontend"],
      capability: ["web_development", "frontend", "backend", "integration"],
      technologies: [
        "next.js",
        "react",
        "javascript",
        "typescript",
        "firebase",
        "supabase"
      ],
      cases: ["ilab", "riga-ilab", "freelance-agent"]
    },
    {
      terms: ["operations", "onboarding", "documentation", "process", "kyc", "support"],
      capability: ["operations", "consulting"],
      technologies: ["airtable", "google workspace", "microsoft office"],
      cases: ["airtable-workflow"]
    }
  ];

  const matched = topicGroups.filter((group) => matchesAny(text, group.terms));
  const activeGroups = matched.length > 0 ? matched : topicGroups.slice(0, 3);
  const capabilityCategories = new Set(activeGroups.flatMap((group) => group.capability));
  const technologyNames = new Set(activeGroups.flatMap((group) => group.technologies));
  const caseIds = new Set(activeGroups.flatMap((group) => group.cases));

  return {
    overallExperience: approvedOnly(profile.overallExperience).filter(
      (item) =>
        matchesAny(text, [
          item.area,
          ...(item.platforms ?? []),
          ...(item.workTypes ?? [])
        ]) || activeGroups.length > 0
    ),
    capabilities: approvedOnly(profile.capabilities).filter((item) =>
      capabilityCategories.has(item.category)
    ),
    technologies: approvedOnly(profile.technologies).filter((item) =>
      technologyNames.has(item.name.toLowerCase())
    ),
    experienceEntries: approvedOnly(profile.experienceEntries).filter((item) =>
      matchesAny(text, [item.company, item.role, item.summary, ...item.responsibilities])
    ),
    cases: publicSafeCases(profile.cases)
      .filter((item) => caseIds.has(item.id))
      .slice(0, maxCases),
    education: approvedOnly(profile.education).filter((item) =>
      matchesAny(text, [item.program, item.institution])
    ),
    languages: approvedOnly(profile.languages).filter(() =>
      matchesAny(text, ["language", "multilingual", "localization", "translation"])
    )
  };
}

export function assertNoTechnologyExperienceInflation(claim: string) {
  if (/\b20 years of (next\.?js|react|typescript|firebase|supabase)\b/i.test(claim)) {
    throw new Error("Technology-specific experience inflation is not allowed.");
  }
}
