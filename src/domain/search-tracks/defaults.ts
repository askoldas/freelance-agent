import type { SearchTrack } from "./schema";

export const defaultSearchTracks: SearchTrack[] = [
  {
    agentType: "freelance",
    slug: "web-applications-business-platforms",
    name: "Web applications and business platforms",
    category: "web_build",
    queries: [
      "freelance project build customer portal web application",
      "looking for developer build business dashboard portal",
      "need web app developer for client platform"
    ],
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns: [],
    timeRange: "month",
    freshnessDays: 90,
    socialFreshnessDays: 21,
    resultLimit: 5,
    minPrefilterScore: 40,
    notificationThreshold: 78,
    enabled: true
  },
  {
    agentType: "freelance",
    slug: "existing-project-repair",
    name: "Completion or repair of existing projects",
    category: "existing_project",
    queries: [
      "need developer finish existing React project",
      "fix broken Next.js app authentication deployment",
      "take over incomplete web application project"
    ],
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns: [],
    timeRange: "month",
    freshnessDays: 90,
    socialFreshnessDays: 21,
    resultLimit: 5,
    minPrefilterScore: 40,
    notificationThreshold: 76,
    enabled: true
  },
  {
    agentType: "freelance",
    slug: "cms-content-systems",
    name: "CMS and content systems",
    category: "cms",
    queries: [
      "need CMS website developer structured content workflow",
      "Payload CMS developer freelance project",
      "WordPress headless CMS migration project"
    ],
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns: [],
    timeRange: "month",
    freshnessDays: 90,
    socialFreshnessDays: 21,
    resultLimit: 5,
    minPrefilterScore: 40,
    notificationThreshold: 74,
    enabled: true
  },
  {
    agentType: "freelance",
    slug: "ai-agents-workflow-automation",
    name: "AI agents and workflow automation",
    category: "ai_agent",
    queries: [
      "AI agent workflow automation freelance project",
      "automate document processing with AI developer needed",
      "internal AI assistant business workflow project"
    ],
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns: [],
    timeRange: "month",
    freshnessDays: 90,
    socialFreshnessDays: 21,
    resultLimit: 5,
    minPrefilterScore: 42,
    notificationThreshold: 78,
    enabled: true
  },
  {
    agentType: "freelance",
    slug: "business-process-automation",
    name: "Non-AI business automation",
    category: "automation",
    queries: [
      "automate spreadsheet CRM email workflow developer",
      "business process automation freelancer webhooks API",
      "n8n automation developer project"
    ],
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns: [],
    timeRange: "month",
    freshnessDays: 90,
    socialFreshnessDays: 21,
    resultLimit: 5,
    minPrefilterScore: 42,
    notificationThreshold: 76,
    enabled: true
  },
  {
    agentType: "freelance",
    slug: "apis-integrations",
    name: "APIs and integrations",
    category: "integration",
    queries: [
      "API integration freelancer payment auth CRM",
      "connect CRM email reporting dashboard developer",
      "third party API integration project developer"
    ],
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns: [],
    timeRange: "month",
    freshnessDays: 90,
    socialFreshnessDays: 21,
    resultLimit: 5,
    minPrefilterScore: 40,
    notificationThreshold: 74,
    enabled: true
  },
  {
    agentType: "freelance",
    slug: "agency-subcontracting",
    name: "Agency subcontracting",
    category: "consulting",
    queries: [
      "agency looking for freelance React Next.js developer subcontractor",
      "white label web development subcontractor project",
      "agency needs automation developer subcontractor"
    ],
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns: [],
    timeRange: "month",
    freshnessDays: 90,
    socialFreshnessDays: 21,
    resultLimit: 5,
    minPrefilterScore: 38,
    notificationThreshold: 72,
    enabled: true
  },
  {
    agentType: "freelance",
    slug: "technical-consulting",
    name: "Technical consulting",
    category: "consulting",
    queries: [
      "MVP technical planning consultant web app",
      "automation feasibility consultant project",
      "review existing codebase architecture freelance"
    ],
    includeDomains: [],
    excludeDomains: [],
    excludedTitlePatterns: [],
    timeRange: "month",
    freshnessDays: 90,
    socialFreshnessDays: 21,
    resultLimit: 5,
    minPrefilterScore: 38,
    notificationThreshold: 72,
    enabled: true
  }
];
