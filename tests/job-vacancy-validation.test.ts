import { describe, expect, it } from "vitest";
import type { SearchTrack } from "../src/domain/search-tracks/schema";
import type { SourceResult } from "../src/domain/sources/schema";
import { classifyJobVacancyIntent } from "../src/domain/job-vacancies/validation";

const now = new Date("2026-06-15T00:00:00.000Z");

const track: SearchTrack = {
  agentType: "jobs",
  slug: "jobs-broad",
  name: "Broad job search",
  category: "web_product_development",
  queries: ["hiring web developer remote position apply"],
  includeDomains: [],
  excludeDomains: ["blocked.example"],
  excludedTitlePatterns: ["\\bwebinar\\b"],
  timeRange: "month",
  freshnessDays: 30,
  socialFreshnessDays: 14,
  resultLimit: 5,
  minPrefilterScore: 40,
  notificationThreshold: 75,
  enabled: true
};

function classify(result: SourceResult) {
  return classifyJobVacancyIntent(result, track, now);
}

describe("job vacancy validation", () => {
  it("accepts a current remote web developer vacancy", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Remote Full-stack Web Developer",
      url: "https://company.example/jobs/full-stack-web-developer",
      content:
        "We are hiring a full-stack web developer for a remote position. You will build customer-facing web application features, work with APIs, and improve dashboards. Requirements include JavaScript, React, REST APIs, and product thinking. Apply now with your CV.",
      publishedAt: "2026-06-10T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(true);
    expect(decision.contentType).toBe("active_vacancy");
    expect(decision.freshnessStatus).toBe("fresh");
    expect(decision.validationEvidence).toContain("application path");
  });

  it("accepts a current automation role", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Workflow Automation Specialist",
      url: "https://automation.example/careers/workflow-automation-specialist",
      content:
        "Open role: workflow automation specialist. We are looking for someone to improve business processes, connect APIs, and build automations. Contract role, remote Europe. Responsibilities include requirements clarification and implementation. Submit application through the form.",
      publishedAt: "2026-06-04T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(true);
    expect(decision.validationEvidence).toContain("employment context");
  });

  it("accepts a technical operations role with transferable fit", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Technical Operations Specialist",
      url: "https://ops.example/jobs/technical-operations-specialist",
      content:
        "Vacancy for a technical operations specialist. You will support onboarding, documentation, process improvement, payment operations, and business systems. Hybrid or remote position in Europe. Requirements include workflow coordination and strong communication. Apply for this job online.",
      publishedAt: "2026-06-01T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(true);
    expect(decision.contentType).toBe("active_vacancy");
  });

  it("rejects an expired vacancy", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Frontend Developer",
      url: "https://company.example/jobs/frontend-developer",
      content:
        "Frontend developer vacancy. Applications are closed and this job is no longer available.",
      publishedAt: "2026-06-01T00:00:00.000Z",
      raw: { application_deadline: "2026-06-05T00:00:00.000Z" }
    });

    expect(decision.accepted).toBe(false);
    expect(decision.freshnessStatus).toBe("expired");
    expect(decision.rejectionCategory).toBe("expired_vacancy");
  });

  it("rejects a salary-guide article", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Web Developer Salary Guide 2026",
      url: "https://content.example/web-developer-salary-guide",
      content:
        "This salary guide explains average salary levels, compensation bands, and what web developers earn in Europe.",
      publishedAt: "2026-06-12T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(false);
    expect(decision.contentType).toBe("salary_guide");
    expect(decision.rejectionCategory).toBe("salary_guide");
  });

  it("rejects a generic careers page without a specific role", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Careers at Example Co",
      url: "https://company.example/careers",
      content:
        "Careers at Example Co. Join our team and work with us. We value creativity, teamwork, and learning. View all departments and open applications.",
      publishedAt: "2026-06-12T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(false);
    expect(decision.contentType).toBe("company_careers_page");
    expect(decision.rejectionCategory).toBe("generic_careers_page");
  });

  it("rejects a stale LinkedIn vacancy post", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Hiring React developer",
      url: "https://www.linkedin.com/posts/company-hiring-react-developer",
      content:
        "We are hiring a React developer for a contract role. Requirements include frontend experience. Apply now by messaging the recruiter.",
      publishedAt: "2026-05-01T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(false);
    expect(decision.contentType).toBe("social_post");
    expect(decision.rejectionCategory).toBe("stale_social_post");
  });

  it("rejects a job-board listing page until child vacancies are expanded", () => {
    const decision = classify({
      sourceType: "tavily",
      title: "Software Developer Jobs in Europe",
      url: "https://jobs.example/search?q=developer",
      content:
        "35 open jobs matching software developer. Filter by location, salary, remote type, and company. View all jobs and search results.",
      publishedAt: "2026-06-13T00:00:00.000Z"
    });

    expect(decision.accepted).toBe(false);
    expect(decision.contentType).toBe("job_board_listing");
    expect(decision.rejectionCategory).toBe("listing_page_not_expanded");
  });
});
