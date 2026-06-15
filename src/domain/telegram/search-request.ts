import { z } from "zod";
import { agentTypeSchema } from "@/domain/agents/schema";
import type { OpportunityCategory } from "@/domain/opportunities/schema";
import type { SearchTrackCategory } from "@/domain/search-tracks/schema";
import type { SearchTrack } from "@/domain/search-tracks/schema";

export const geographyModeSchema = z.enum(["strict", "prefer", "remote_from"]);
export const supportedLocationSchema = z.enum([
  "latvia",
  "lithuania",
  "estonia",
  "baltics",
  "eu",
  "remote"
]);

export const telegramSearchRequestSchema = z.object({
  agentType: agentTypeSchema.default("freelance"),
  locations: z.array(supportedLocationSchema).min(1),
  categories: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  geographyMode: geographyModeSchema.default("prefer"),
  timeRange: z.enum(["day", "week", "month", "year"]).default("month"),
  maxResults: z.number().int().min(1).max(10).default(5)
});

export type TelegramSearchRequest = z.infer<typeof telegramSearchRequestSchema>;

type CategoryDefinition = {
  category: SearchTrackCategory;
  keywords: string[];
  queryTopics: string[];
  jobQueryTopics?: string[];
};

const locationAliases: Record<string, TelegramSearchRequest["locations"][number]> = {
  latvia: "latvia",
  latvija: "latvia",
  riga: "latvia",
  lithuania: "lithuania",
  lietuva: "lithuania",
  vilnius: "lithuania",
  kaunas: "lithuania",
  estonia: "estonia",
  eesti: "estonia",
  tallinn: "estonia",
  baltics: "baltics",
  baltic: "baltics",
  eu: "eu",
  europe: "eu",
  european: "eu",
  remote: "remote",
  remotely: "remote"
};

const categoryDefinitions: Record<string, CategoryDefinition> = {
  wordpress: {
    category: "cms",
    keywords: ["wordpress"],
    queryTopics: ["WordPress development", "WordPress customization"],
    jobQueryTopics: ["WordPress developer", "CMS developer"]
  },
  shopify: {
    category: "cms",
    keywords: ["shopify"],
    queryTopics: ["Shopify development", "Shopify integrations"],
    jobQueryTopics: ["Shopify developer", "ecommerce developer"]
  },
  automation: {
    category: "automation",
    keywords: ["automation"],
    queryTopics: ["workflow automation", "business process automation"],
    jobQueryTopics: ["workflow automation specialist", "business automation developer"]
  },
  "ai agent": {
    category: "ai_agent",
    keywords: ["ai agent"],
    queryTopics: ["AI agent", "AI assistant"],
    jobQueryTopics: ["AI agent developer", "AI automation developer"]
  },
  ai: {
    category: "ai_agent",
    keywords: ["ai"],
    queryTopics: ["AI workflow", "AI assistant"],
    jobQueryTopics: ["AI integration developer", "AI automation specialist"]
  },
  web: {
    category: "web_build",
    keywords: ["web"],
    queryTopics: ["web development", "web application"],
    jobQueryTopics: ["web developer", "web application developer"]
  },
  website: {
    category: "web_build",
    keywords: ["website"],
    queryTopics: ["website development", "website redesign"],
    jobQueryTopics: ["web developer", "frontend developer"]
  },
  react: {
    category: "frontend",
    keywords: ["react"],
    queryTopics: ["React development"],
    jobQueryTopics: ["React developer", "frontend developer"]
  },
  nextjs: {
    category: "frontend",
    keywords: ["nextjs"],
    queryTopics: ["Next.js development"],
    jobQueryTopics: ["Next.js developer", "React developer"]
  },
  "next.js": {
    category: "frontend",
    keywords: ["next.js"],
    queryTopics: ["Next.js development"],
    jobQueryTopics: ["Next.js developer", "React developer"]
  },
  developer: {
    category: "web_product_development",
    keywords: ["developer"],
    queryTopics: ["web development", "software development"],
    jobQueryTopics: ["full-stack web developer", "frontend developer"]
  },
  operations: {
    category: "technical_operations",
    keywords: ["operations"],
    queryTopics: ["technical operations consulting"],
    jobQueryTopics: ["technical operations specialist", "digital operations specialist"]
  }
};

const buyerIntentPhrases = [
  "looking for freelance developer",
  "need contractor",
  "hiring developer",
  "seeking proposal"
];

const jobIntentPhrases = [
  "hiring",
  "vacancy",
  "open role",
  "remote position",
  "contract role",
  "part-time role",
  "apply"
];

const localBuyerIntentPhrases: Partial<
  Record<TelegramSearchRequest["locations"][number], string[]>
> = {
  latvia: ["meklejam izstradataju", "vajag programmētāju"],
  lithuania: ["ieskome programuotojo", "reikia programuotojo"],
  estonia: ["otsime arendajat", "vaja arendajat"]
};

const excludedTitlePatterns = [
  "\\bguide\\b",
  "\\btutorial\\b",
  "\\bcase study\\b",
  "\\bservices?\\b",
  "\\bcost\\b",
  "\\bpricing\\b",
  "\\bcomparison\\b",
  "\\bhow to\\b",
  "\\bbest\\b",
  "\\bexamples\\b"
];

const jobExcludedTitlePatterns = [
  "\\bsalary guide\\b",
  "\\bcareer advice\\b",
  "\\bhow to\\b",
  "\\btraining\\b",
  "\\bcertification\\b",
  "\\bcourse\\b",
  "\\bwhat is\\b",
  "\\baverage salary\\b"
];

const locationTerms: Record<TelegramSearchRequest["locations"][number], string[]> = {
  latvia: ["Latvia", "Riga", "Latvija"],
  lithuania: ["Lithuania", "Vilnius", "Kaunas", "Lietuva"],
  estonia: ["Estonia", "Tallinn", "Eesti"],
  baltics: ["Baltics", "Baltic states", "Latvia", "Lithuania", "Estonia"],
  eu: ["EU", "Europe", "European"],
  remote: ["remote", "remote work", "remote contractor"]
};

function normalizeInput(input: string) {
  return input
    .toLowerCase()
    .replace(/[.,!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function detectLocations(text: string) {
  return unique(
    Object.entries(locationAliases)
      .filter(([alias]) => new RegExp(`\\b${alias}\\b`, "i").test(text))
      .map(([, location]) => location)
  );
}

function detectCategoryKeys(text: string) {
  return Object.keys(categoryDefinitions).filter((key) =>
    new RegExp(`\\b${key.replace(".", "\\.")}\\b`, "i").test(text)
  );
}

function stripCommand(text: string) {
  return text.replace(/^\/search(?:@\w+)?\s*/i, "").trim();
}

function detectAgentType(originalText: string, normalized: string) {
  if (/^\/search(?:@\w+)?\s+jobs?\b/i.test(originalText)) {
    return "jobs" as const;
  }

  if (/^\/search(?:@\w+)?\s+freelance\b/i.test(originalText)) {
    return "freelance" as const;
  }

  if (/\b(jobs?|vacanc(?:y|ies)|roles?|positions?)\b/.test(normalized)) {
    return "jobs" as const;
  }

  return "freelance" as const;
}

export function parseTelegramSearchRequest(text: string): TelegramSearchRequest | null {
  const normalized = normalizeInput(stripCommand(text));
  const isSearch =
    /^\/search/i.test(text) || /\b(find|search|look for|looking for)\b/.test(normalized);

  if (!isSearch && !normalized) {
    return null;
  }

  const locations = detectLocations(normalized);

  if (locations.length === 0) {
    return null;
  }

  const categoryKeys = detectCategoryKeys(normalized);
  const agentType = detectAgentType(text, normalized);
  const categories = unique(
    categoryKeys.map((key) => categoryDefinitions[key]?.category).filter(Boolean)
  );
  const keywords = unique(
    categoryKeys.flatMap((key) => categoryDefinitions[key]?.keywords ?? [])
  );
  const geographyMode = /\b(strict|only in|must be in)\b/.test(normalized)
    ? "strict"
    : locations.includes("remote")
      ? "remote_from"
      : "prefer";
  const timeRange = /\b(today|day|24 hours)\b/.test(normalized)
    ? "day"
    : /\b(week|7 days)\b/.test(normalized)
      ? "week"
      : /\b(year|12 months)\b/.test(normalized)
        ? "year"
        : "month";
  const maxResultsMatch = normalized.match(
    /\b(?:max|limit|top)?\s*(\d{1,2})\s*(?:results?|projects?|jobs?|vacancies)\b/
  );
  const maxResults = maxResultsMatch ? Number(maxResultsMatch[1]) : 5;

  return telegramSearchRequestSchema.parse({
    agentType,
    locations,
    categories,
    keywords,
    geographyMode,
    timeRange,
    maxResults
  });
}

function queryTopicsForRequest(request: TelegramSearchRequest) {
  if (request.keywords.length === 0 && request.categories.length === 0) {
    return request.agentType === "jobs"
      ? ["web developer", "automation specialist", "technical operations specialist"]
      : ["web development", "software development project", "business automation"];
  }

  const fromKeywords = request.keywords.flatMap((keyword) => {
    const definition = categoryDefinitions[keyword];
    return request.agentType === "jobs"
      ? (definition?.jobQueryTopics ?? definition?.queryTopics ?? [keyword])
      : (definition?.queryTopics ?? [keyword]);
  });

  return unique(fromKeywords);
}

function geographyTerms(request: TelegramSearchRequest) {
  const terms = request.locations.flatMap((location) => locationTerms[location] ?? []);

  if (request.geographyMode === "remote_from") {
    return unique([
      "remote",
      "remote contractor",
      ...terms.filter((term) => term !== "remote")
    ]);
  }

  return unique(terms);
}

function buyerIntentForRequest(request: TelegramSearchRequest) {
  const localPhrases = request.locations.flatMap(
    (location) => localBuyerIntentPhrases[location] ?? []
  );

  return unique([
    ...(request.agentType === "jobs" ? jobIntentPhrases : buyerIntentPhrases),
    ...localPhrases
  ]);
}

export function buildTemporarySearchTrack(
  request: TelegramSearchRequest,
  sourceId?: string
): SearchTrack {
  const topics = queryTopicsForRequest(request);
  const geoTerms = geographyTerms(request);
  const intentPhrases = buyerIntentForRequest(request);
  const queries = unique(
    topics.flatMap((topic) =>
      intentPhrases.slice(0, 5).map((intent, index) => {
        const geo = geoTerms[index % geoTerms.length] ?? "";
        return request.agentType === "jobs"
          ? `${intent} ${topic} ${geo} apply remote contract role`.trim()
          : `${intent} ${topic} ${geo} paid project budget proposal`.trim();
      })
    )
  ).slice(0, 8);

  const jobCategory =
    request.categories.includes("technical_operations") ||
    request.keywords.includes("operations")
      ? "technical_operations"
      : request.categories.includes("automation_ai") ||
          request.categories.includes("automation") ||
          request.categories.includes("ai_agent") ||
          request.keywords.includes("automation") ||
          request.keywords.includes("ai")
        ? "automation_ai"
        : "web_product_development";

  return {
    sourceId,
    agentType: request.agentType,
    slug: `telegram-temporary-${Date.now()}`,
    name:
      request.agentType === "jobs"
        ? "Telegram temporary job search"
        : "Telegram temporary search",
    category:
      request.agentType === "jobs"
        ? jobCategory
        : ((request.categories[0] as OpportunityCategory | undefined) ?? "other"),
    queries,
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns:
      request.agentType === "jobs" ? jobExcludedTitlePatterns : excludedTitlePatterns,
    timeRange: request.timeRange,
    freshnessDays:
      request.agentType === "jobs"
        ? request.timeRange === "week"
          ? 14
          : 30
        : request.timeRange === "week"
          ? 14
          : 90,
    socialFreshnessDays: request.timeRange === "week" ? 7 : 21,
    resultLimit: request.maxResults,
    minPrefilterScore: 40,
    notificationThreshold: 70,
    enabled: true
  };
}

export function formatTelegramSearchUsage() {
  return [
    "<b>Search examples</b>",
    "/search freelance Latvia wordpress",
    "/search jobs Latvia web developer",
    "/search jobs remote automation",
    "/search jobs Lithuania operations",
    "",
    "<b>Legacy freelance examples</b>",
    "/search Latvia",
    "/search Lithuania wordpress",
    "/search Baltics automation",
    "/search Latvia shopify",
    "/search remote ai agent",
    "",
    "You can also write:",
    "Find web development projects in Latvia",
    "Find remote web-development jobs in Europe",
    "Search for automation vacancies in Latvia",
    "Look for technical operations roles in Lithuania",
    "Search for WordPress or Shopify work in Lithuania",
    "Look for automation projects in Latvia and Estonia",
    "",
    "Supported locations: Latvia, Lithuania, Estonia, Baltics, EU, remote."
  ].join("\n");
}

export function formatParsedTelegramSearchRequest(request: TelegramSearchRequest) {
  return [
    `<b>${request.agentType === "jobs" ? "Job search started" : "Search started"}</b>`,
    `Agent: ${request.agentType === "jobs" ? "Job Search Agent" : "Freelance Agent"}`,
    `Geography: ${request.locations.join(", ")} (${request.geographyMode})`,
    `Category: ${request.categories.join(", ") || "broad"}`,
    `Keywords: ${request.keywords.join(", ") || "broad"}`,
    `Time range: ${request.timeRange}`,
    `Result limit: ${request.maxResults}`
  ].join("\n");
}
