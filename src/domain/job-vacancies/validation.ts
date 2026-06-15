import type { SearchTrack } from "@/domain/search-tracks/schema";
import type { SourceResult } from "@/domain/sources/schema";
import {
  determineJobFreshness,
  type JobFreshnessStatus,
  type JobVacancyContentType,
  type JobVacancyRejectionCategory
} from "./schema";

export type JobVacancyValidationDecision = {
  accepted: boolean;
  contentType: JobVacancyContentType;
  freshnessStatus: JobFreshnessStatus;
  validationEvidence: string[];
  rejectionCategory?: JobVacancyRejectionCategory;
  rejectionReason?: string;
};

const socialHosts = [
  "linkedin.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
  "threads.net",
  "reddit.com"
];

const salaryGuidePatterns = [
  /\bsalary guide\b/i,
  /\baverage salary\b/i,
  /\bpay scale\b/i,
  /\bcompensation report\b/i,
  /\bwhat does .* earn\b/i
];

const careerAdvicePatterns = [
  /\bcareer advice\b/i,
  /\bhow to become\b/i,
  /\binterview tips\b/i,
  /\bresume tips\b/i,
  /\bcv tips\b/i
];

const trainingPatterns = [
  /\btraining\b/i,
  /\bcertification\b/i,
  /\bcourse\b/i,
  /\bbootcamp\b/i,
  /\blearn\b/i
];

const recruiterMarketingPatterns = [
  /\bwe help companies hire\b/i,
  /\btalent solutions\b/i,
  /\brecruitment services\b/i,
  /\bstaffing agency\b/i
];

const listingPagePatterns = [
  /\b\d+\s+(?:open )?(?:jobs|roles|positions|vacancies)\b/i,
  /\bsearch results\b/i,
  /\bjobs matching\b/i,
  /\bfilter by\b/i,
  /\bview all jobs\b/i,
  /\bopen positions\b/i
];

const genericCareersPatterns = [
  /\bcareers at\b/i,
  /\bjoin our team\b/i,
  /\blife at\b/i,
  /\bwork with us\b/i,
  /\bopen applications\b/i
];

const closedPatterns = [
  /\bexpired\b/i,
  /\bclosed\b/i,
  /\bno longer accepting applications\b/i,
  /\bapplications are closed\b/i,
  /\bthis job is no longer available\b/i
];

const activeRoleSignals = [
  {
    label: "clear role title",
    pattern:
      /\b(?:developer|engineer|specialist|consultant|manager|operations|product|implementation|onboarding|integrations?)\b/i
  },
  {
    label: "hiring or vacancy intent",
    pattern:
      /\b(?:hiring|vacancy|open role|open position|remote position|contract role|part-time role|apply|application|join our team)\b/i
  },
  {
    label: "responsibilities or requirements",
    pattern:
      /\b(?:responsibilities|requirements|you will|we are looking for|skills|experience with|must have|nice to have)\b/i
  },
  {
    label: "employment context",
    pattern:
      /\b(?:full[-\s]?time|part[-\s]?time|contract|temporary|internship|freelance|b2b|remote|hybrid|onsite)\b/i
  },
  {
    label: "application path",
    pattern:
      /\b(?:apply now|apply for this job|send your cv|send your resume|application form|submit application)\b/i
  }
];

function hostMatches(hostname: string, domains: string[]) {
  return domains.some((domain) => {
    const normalized = domain.toLowerCase().replace(/^www\./, "");
    return hostname === normalized || hostname.endsWith(`.${normalized}`);
  });
}

function firstMatchingSource(patterns: RegExp[], value: string) {
  return patterns.find((pattern) => pattern.test(value));
}

function classifyContentType(url: URL, text: string): JobVacancyContentType {
  const combined = `${url.pathname}\n${text}`;

  if (firstMatchingSource(salaryGuidePatterns, combined)) {
    return "salary_guide";
  }

  if (firstMatchingSource(careerAdvicePatterns, combined)) {
    return "career_advice";
  }

  if (firstMatchingSource(trainingPatterns, combined)) {
    return "training";
  }

  if (firstMatchingSource(recruiterMarketingPatterns, combined)) {
    return "recruiter_marketing";
  }

  if (firstMatchingSource(listingPagePatterns, combined)) {
    return "job_board_listing";
  }

  if (firstMatchingSource(genericCareersPatterns, combined)) {
    return "company_careers_page";
  }

  return "unknown";
}

function rejectionForContentType(
  contentType: JobVacancyContentType
): JobVacancyRejectionCategory {
  if (contentType === "salary_guide") {
    return "salary_guide";
  }

  if (contentType === "training") {
    return "training_or_certification";
  }

  if (contentType === "recruiter_marketing") {
    return "recruiter_marketing";
  }

  if (contentType === "job_board_listing") {
    return "listing_page_not_expanded";
  }

  if (contentType === "company_careers_page") {
    return "generic_careers_page";
  }

  return "informational_content";
}

function expiredByDeadline(raw: unknown, now: Date) {
  if (!raw || typeof raw !== "object" || !("application_deadline" in raw)) {
    return false;
  }

  const deadline = (raw as { application_deadline?: unknown }).application_deadline;

  if (typeof deadline !== "string") {
    return false;
  }

  return new Date(deadline) < now;
}

function reliableDeadline(raw: unknown) {
  if (!raw || typeof raw !== "object" || !("application_deadline" in raw)) {
    return undefined;
  }

  const deadline = (raw as { application_deadline?: unknown }).application_deadline;
  return typeof deadline === "string" ? deadline : undefined;
}

function getAgeDays(publishedAt: string | undefined, now: Date) {
  if (!publishedAt) {
    return undefined;
  }

  return Math.floor((now.getTime() - new Date(publishedAt).getTime()) / 86_400_000);
}

export function classifyJobVacancyIntent(
  result: SourceResult,
  track: SearchTrack,
  now = new Date()
): JobVacancyValidationDecision {
  const url = new URL(result.url);
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const text = `${result.title}\n${result.content}`;
  const title = result.title.toLowerCase();
  const isSocial = hostMatches(hostname, socialHosts);
  const deadline = reliableDeadline(result.raw);
  const freshnessStatus = determineJobFreshness({
    publishedAt: result.publishedAt,
    applicationDeadline: deadline,
    now
  });

  if (hostMatches(hostname, track.excludeDomains)) {
    return {
      accepted: false,
      contentType: isSocial ? "social_post" : "unknown",
      freshnessStatus,
      validationEvidence: [],
      rejectionCategory: "excluded_domain",
      rejectionReason: `Domain is excluded: ${hostname}`
    };
  }

  const excludedTitlePattern = track.excludedTitlePatterns.find((pattern) =>
    new RegExp(pattern, "i").test(title)
  );

  if (excludedTitlePattern) {
    return {
      accepted: false,
      contentType: isSocial ? "social_post" : "unknown",
      freshnessStatus,
      validationEvidence: [],
      rejectionCategory: "excluded_title_pattern",
      rejectionReason: `Title matched excluded pattern: ${excludedTitlePattern}`
    };
  }

  if (expiredByDeadline(result.raw, now) || firstMatchingSource(closedPatterns, text)) {
    return {
      accepted: false,
      contentType: isSocial ? "social_post" : "active_vacancy",
      freshnessStatus: "expired",
      validationEvidence: [],
      rejectionCategory: "expired_vacancy",
      rejectionReason: "Vacancy appears closed or past its application deadline."
    };
  }

  const ageDays = getAgeDays(result.publishedAt, now);

  if (isSocial && !result.publishedAt) {
    return {
      accepted: false,
      contentType: "social_post",
      freshnessStatus: "unknown",
      validationEvidence: [],
      rejectionCategory: "undated_social_post",
      rejectionReason: "Social-media vacancy result has no reliable publication date."
    };
  }

  if (isSocial && ageDays !== undefined && ageDays > track.socialFreshnessDays) {
    return {
      accepted: false,
      contentType: "social_post",
      freshnessStatus: ageDays > 30 ? "stale" : "aging",
      validationEvidence: [],
      rejectionCategory: "stale_social_post",
      rejectionReason: `Social-media vacancy result is ${ageDays} days old.`
    };
  }

  if (ageDays !== undefined && ageDays > track.freshnessDays) {
    return {
      accepted: false,
      contentType: "unknown",
      freshnessStatus: "stale",
      validationEvidence: [],
      rejectionCategory: "stale_result",
      rejectionReason: `Vacancy result is ${ageDays} days old.`
    };
  }

  const contentType = isSocial ? "social_post" : classifyContentType(url, text);
  const validationEvidence = activeRoleSignals
    .filter((signal) => signal.pattern.test(text))
    .map((signal) => signal.label);

  if (
    contentType !== "unknown" &&
    contentType !== "social_post" &&
    validationEvidence.length < 3
  ) {
    return {
      accepted: false,
      contentType,
      freshnessStatus,
      validationEvidence,
      rejectionCategory: rejectionForContentType(contentType),
      rejectionReason: `Result appears to be ${contentType}, not a specific active vacancy.`
    };
  }

  if (validationEvidence.length < 3) {
    return {
      accepted: false,
      contentType,
      freshnessStatus,
      validationEvidence,
      rejectionCategory: "missing_active_role_evidence",
      rejectionReason: "No sufficient evidence of a specific active vacancy was found."
    };
  }

  return {
    accepted: true,
    contentType: contentType === "unknown" ? "active_vacancy" : contentType,
    freshnessStatus,
    validationEvidence
  };
}
