import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dashboard route separation", () => {
  it("keeps freelance and job dashboards on separate routes", () => {
    const rootPage = readFileSync("src/app/page.tsx", "utf8");
    const freelancePage = readFileSync("src/app/freelance/page.tsx", "utf8");
    const jobsPage = readFileSync("src/app/jobs/page.tsx", "utf8");

    expect(rootPage).toContain("redirect(`/freelance");
    expect(freelancePage).toContain("Freelance Agent");
    expect(freelancePage).toContain("getFreelanceDashboardData");
    expect(jobsPage).toContain("Job Search Agent");
    expect(jobsPage).toContain("getJobsDashboardData");
    expect(jobsPage).toContain("Run job search");
  });

  it("filters run history by agent type", () => {
    const repository = readFileSync(
      "src/services/database/repositories/dashboard.ts",
      "utf8"
    );

    expect(repository).toContain('.eq("agent_type", "freelance")');
    expect(repository).toContain('.eq("agent_type", "jobs")');
    expect(repository).toContain('.from("job_vacancies")');
    expect(repository).toContain("job_vacancy_evaluations");
  });
});
