import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardOpportunity = {
  id: string;
  title: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: string;
  discoveredAt: string;
  status: string;
  primaryCategory?: string;
  score?: number;
  recommendation?: string;
  fitLevel?: string;
  summary?: string;
};

export type DashboardRun = {
  id: string;
  runType: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  metadata: Record<string, unknown>;
};

export type DashboardData = {
  opportunities: DashboardOpportunity[];
  runs: DashboardRun[];
};

export type DashboardJobVacancy = {
  id: string;
  title: string;
  company?: string;
  sourceTitle: string;
  sourceUrl: string;
  applicationUrl?: string;
  discoveredAt: string;
  vacancyStatus: string;
  freshnessStatus: string;
  employmentType: string;
  remoteType: string;
  location?: string;
  salary?: string;
  score?: number;
  recommendation?: string;
  fitLevel?: string;
  summary?: string;
};

export type JobsDashboardData = {
  vacancies: DashboardJobVacancy[];
  runs: DashboardRun[];
};

type OpportunityRow = {
  id: string;
  title: string | null;
  source_title: string;
  source_url: string;
  source_type: string;
  discovered_at: string;
  status: string;
  primary_category: string | null;
  evaluations?: Array<{
    score: number;
    recommendation: string;
    fit_level: string;
    summary: string;
    evaluated_at: string;
  }>;
};

type RunRow = {
  id: string;
  run_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  metadata: Record<string, unknown>;
};

type JobVacancyRow = {
  id: string;
  title: string | null;
  company: string | null;
  source_title: string;
  source_url: string;
  application_url: string | null;
  discovered_at: string;
  vacancy_status: string;
  freshness_status: string;
  employment_type: string;
  remote_type: string;
  country: string | null;
  city: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  salary_period: string | null;
  job_vacancy_evaluations?: Array<{
    score: number;
    recommendation: string;
    fit_level: string;
    summary: string;
    evaluated_at: string;
  }>;
};

export class DashboardRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getDashboardData(): Promise<DashboardData> {
    return this.getFreelanceDashboardData();
  }

  async getFreelanceDashboardData(): Promise<DashboardData> {
    const { data: opportunities, error: opportunityError } = await this.client
      .from("opportunities")
      .select(
        "id,title,source_title,source_url,source_type,discovered_at,status,primary_category,evaluations(score,recommendation,fit_level,summary,evaluated_at)"
      )
      .order("discovered_at", { ascending: false })
      .limit(20);

    if (opportunityError) {
      throw opportunityError;
    }

    const { data: runs, error: runError } = await this.client
      .from("agent_runs")
      .select("id,run_type,status,started_at,finished_at,metadata")
      .eq("agent_type", "freelance")
      .order("started_at", { ascending: false })
      .limit(8);

    if (runError) {
      throw runError;
    }

    return {
      opportunities: ((opportunities ?? []) as OpportunityRow[]).map((row) => {
        const latestEvaluation = row.evaluations?.[0];

        return {
          id: row.id,
          title: row.title ?? row.source_title,
          sourceTitle: row.source_title,
          sourceUrl: row.source_url,
          sourceType: row.source_type,
          discoveredAt: row.discovered_at,
          status: row.status,
          primaryCategory: row.primary_category ?? undefined,
          score: latestEvaluation?.score,
          recommendation: latestEvaluation?.recommendation,
          fitLevel: latestEvaluation?.fit_level,
          summary: latestEvaluation?.summary
        };
      }),
      runs: ((runs ?? []) as RunRow[]).map((row) => ({
        id: row.id,
        runType: row.run_type,
        status: row.status,
        startedAt: row.started_at,
        finishedAt: row.finished_at ?? undefined,
        metadata: row.metadata ?? {}
      }))
    };
  }

  async getJobsDashboardData(): Promise<JobsDashboardData> {
    const { data: vacancies, error: vacancyError } = await this.client
      .from("job_vacancies")
      .select(
        "id,title,company,source_title,source_url,application_url,discovered_at,vacancy_status,freshness_status,employment_type,remote_type,country,city,salary_min,salary_max,currency,salary_period,job_vacancy_evaluations(score,recommendation,fit_level,summary,evaluated_at)"
      )
      .order("discovered_at", { ascending: false })
      .limit(20);

    if (vacancyError) {
      throw vacancyError;
    }

    const { data: runs, error: runError } = await this.client
      .from("agent_runs")
      .select("id,run_type,status,started_at,finished_at,metadata")
      .eq("agent_type", "jobs")
      .order("started_at", { ascending: false })
      .limit(8);

    if (runError) {
      throw runError;
    }

    return {
      vacancies: ((vacancies ?? []) as JobVacancyRow[]).map((row) => {
        const latestEvaluation = row.job_vacancy_evaluations?.[0];

        return {
          id: row.id,
          title: row.title ?? row.source_title,
          company: row.company ?? undefined,
          sourceTitle: row.source_title,
          sourceUrl: row.source_url,
          applicationUrl: row.application_url ?? undefined,
          discoveredAt: row.discovered_at,
          vacancyStatus: row.vacancy_status,
          freshnessStatus: row.freshness_status,
          employmentType: row.employment_type,
          remoteType: row.remote_type,
          location: [row.city, row.country].filter(Boolean).join(", ") || undefined,
          salary: formatSalary(row),
          score: latestEvaluation?.score,
          recommendation: latestEvaluation?.recommendation,
          fitLevel: latestEvaluation?.fit_level,
          summary: latestEvaluation?.summary
        };
      }),
      runs: ((runs ?? []) as RunRow[]).map((row) => ({
        id: row.id,
        runType: row.run_type,
        status: row.status,
        startedAt: row.started_at,
        finishedAt: row.finished_at ?? undefined,
        metadata: row.metadata ?? {}
      }))
    };
  }
}

function formatSalary(
  row: Pick<JobVacancyRow, "salary_min" | "salary_max" | "currency" | "salary_period">
) {
  if (!row.salary_min && !row.salary_max) {
    return undefined;
  }

  const currency = row.currency ? ` ${row.currency}` : "";
  const period = row.salary_period ? ` / ${row.salary_period}` : "";

  if (row.salary_min && row.salary_max) {
    return `${row.salary_min}-${row.salary_max}${currency}${period}`;
  }

  return `${row.salary_min ?? row.salary_max}${currency}${period}`;
}
