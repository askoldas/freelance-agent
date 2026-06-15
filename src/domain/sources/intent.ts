import type { SearchTrack } from "@/domain/search-tracks/schema";
import type { ContentType, RejectionCategory } from "../opportunities/schema";
import type { SourceResult } from "./schema";

export type OpportunityIntentDecision = {
  accepted: boolean;
  contentType: ContentType;
  buyerIntentEvidence: string[];
  rejectionCategory?: RejectionCategory;
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

const informationalPatterns = [
  /\bblog\b/i,
  /\bguide\b/i,
  /\bhow to\b/i,
  /\btutorial\b/i,
  /\bwhat is\b/i,
  /\bcost\b/i,
  /\bpricing\b/i,
  /\bestimate\b/i,
  /\bcomparison\b/i,
  /\bvs\.?\b/i,
  /\bbest practices\b/i
];

const documentationPatterns = [
  /\bdocs?\b/i,
  /\bdocumentation\b/i,
  /\breference\b/i,
  /\bapi reference\b/i
];

const servicePagePatterns = [
  /\bour services\b/i,
  /\bservices\b/i,
  /\bwe help\b/i,
  /\bwe build\b/i,
  /\bhire our\b/i,
  /\bbook a call\b/i,
  /\bagency\b/i
];

const portfolioPatterns = [/\bportfolio\b/i, /\bcase studies\b/i, /\bour work\b/i];
const caseStudyPatterns = [/\bcase study\b/i, /\bclient story\b/i];
const discussionPatterns = [/\bdiscussion\b/i, /\bforum\b/i, /\bcomment thread\b/i];

const buyerIntentPatterns = [
  /\b(?:we|i|our company|client|startup|business)\s+(?:need|needs|are looking for|am looking for|seek|seeking|want to hire|would like to hire)\b/i,
  /\blooking for (?:a |an )?(?:freelance|contract|part-time )?(?:developer|engineer|consultant|agency|expert|specialist|freelancer)\b/i,
  /\bneed (?:a |an )?(?:freelance|contract )?(?:developer|engineer|consultant|expert|specialist|freelancer)\b/i,
  /\bhiring (?:a |an )?(?:freelance|contract )?(?:developer|engineer|consultant|expert|specialist)\b/i,
  /\b(?:paid|budget|rate|contract|freelance project|send (?:me )?(?:a )?proposal|apply|dm me|message me)\b/i
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

function contentTypeFromText(url: URL, text: string): ContentType {
  const path = url.pathname.toLowerCase();

  if (firstMatchingSource(documentationPatterns, `${path}\n${text}`)) {
    return "documentation";
  }

  if (firstMatchingSource(caseStudyPatterns, `${path}\n${text}`)) {
    return "case_study";
  }

  if (firstMatchingSource(portfolioPatterns, `${path}\n${text}`)) {
    return "portfolio";
  }

  if (firstMatchingSource(servicePagePatterns, `${path}\n${text}`)) {
    return "service_page";
  }

  if (firstMatchingSource(discussionPatterns, `${path}\n${text}`)) {
    return "discussion";
  }

  if (/\btutorial\b/i.test(text)) {
    return "tutorial";
  }

  if (/\bcomparison\b|\bvs\.?\b/i.test(text)) {
    return "comparison";
  }

  if (firstMatchingSource(informationalPatterns, `${path}\n${text}`)) {
    return "informational";
  }

  return "unknown";
}

function getAgeDays(publishedAt: string | undefined, now: Date) {
  if (!publishedAt) {
    return undefined;
  }

  return Math.floor((now.getTime() - new Date(publishedAt).getTime()) / 86_400_000);
}

export function classifyOpportunityIntent(
  result: SourceResult,
  track: SearchTrack,
  now = new Date()
): OpportunityIntentDecision {
  const url = new URL(result.url);
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const text = `${result.title}\n${result.content}`;
  const title = result.title.toLowerCase();
  const isSocial = hostMatches(hostname, socialHosts);
  const buyerIntentEvidence = buyerIntentPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.source);

  if (hostMatches(hostname, track.excludeDomains)) {
    return {
      accepted: false,
      contentType: isSocial ? "social_post" : "unknown",
      buyerIntentEvidence,
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
      buyerIntentEvidence,
      rejectionCategory: "excluded_title_pattern",
      rejectionReason: `Title matched excluded pattern: ${excludedTitlePattern}`
    };
  }

  const ageDays = getAgeDays(result.publishedAt, now);

  if (isSocial && !result.publishedAt) {
    return {
      accepted: false,
      contentType: "social_post",
      buyerIntentEvidence,
      rejectionCategory: "undated_social_post",
      rejectionReason: "Social-media result has no reliable publication date."
    };
  }

  if (isSocial && ageDays !== undefined && ageDays > track.socialFreshnessDays) {
    return {
      accepted: false,
      contentType: "social_post",
      buyerIntentEvidence,
      rejectionCategory: "stale_social_post",
      rejectionReason: `Social-media result is ${ageDays} days old.`
    };
  }

  if (ageDays !== undefined && ageDays > track.freshnessDays) {
    return {
      accepted: false,
      contentType: "unknown",
      buyerIntentEvidence,
      rejectionCategory: "stale_result",
      rejectionReason: `Result is ${ageDays} days old.`
    };
  }

  const contentType = isSocial ? "social_post" : contentTypeFromText(url, text);

  if (buyerIntentEvidence.length === 0) {
    const rejectionCategory: RejectionCategory =
      contentType === "service_page"
        ? "service_page"
        : contentType === "portfolio"
          ? "portfolio"
          : contentType === "documentation"
            ? "documentation"
            : contentType === "case_study"
              ? "case_study"
              : contentType === "discussion"
                ? "generic_discussion"
                : contentType === "unknown"
                  ? "missing_buyer_intent"
                  : "informational_content";

    return {
      accepted: false,
      contentType,
      buyerIntentEvidence,
      rejectionCategory,
      rejectionReason:
        contentType === "unknown"
          ? "No explicit active request for paid work was found."
          : `Result appears to be ${contentType} without explicit active paid-work intent.`
    };
  }

  return {
    accepted: true,
    contentType: contentType === "unknown" ? "active_opportunity" : contentType,
    buyerIntentEvidence
  };
}
