import Link from "next/link";
import { env } from "@/config/env";
import { DashboardRepository } from "@/services/database/repositories/dashboard";
import { createSupabaseServiceClient } from "@/services/database/supabase";
import { triggerManualJobSearch } from "../actions";
import styles from "../page.module.css";

type PageProps = {
  searchParams?: Promise<{
    secret?: string;
  }>;
};

function formatDate(input?: string) {
  if (!input) {
    return "Not finished";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(input));
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dashboardSecret = params?.secret ?? "";
  const secretQuery = dashboardSecret
    ? `?secret=${encodeURIComponent(dashboardSecret)}`
    : "";
  const dashboardConfigured = Boolean(env.DASHBOARD_SECRET);
  const authorized = dashboardConfigured && dashboardSecret === env.DASHBOARD_SECRET;
  const databaseConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
  const dashboardData =
    authorized && databaseConfigured
      ? await new DashboardRepository(
          createSupabaseServiceClient()
        ).getJobsDashboardData()
      : { vacancies: [], runs: [] };

  return (
    <main className={styles.shell}>
      <nav className={styles.nav} aria-label="Primary agent navigation">
        <Link href={`/freelance${secretQuery}`}>Freelance Agent</Link>
        <Link className={styles.navActive} href={`/jobs${secretQuery}`}>
          Job Search Agent
        </Link>
      </nav>

      <section className={styles.header} aria-labelledby="page-title">
        <div>
          <p className={styles.eyebrow}>Job Search Agent</p>
          <h1 className={styles.title} id="page-title">
            Job Vacancies
          </h1>
          <p className={styles.copy}>
            Active vacancies, role-fit score, freshness, remote compatibility, CV state,
            cover-letter state, and application state.
          </p>
        </div>
        <form action={triggerManualJobSearch} className={styles.actionForm}>
          <input type="hidden" name="dashboardSecret" value={dashboardSecret} />
          <button
            className={styles.primaryButton}
            disabled={!authorized || !databaseConfigured}
          >
            Run job search
          </button>
        </form>
      </section>

      {!dashboardConfigured ? (
        <section className={styles.notice}>
          Set <code>DASHBOARD_SECRET</code> to enable the private dashboard.
        </section>
      ) : null}

      {dashboardConfigured && !authorized ? (
        <section className={styles.notice}>
          Add the dashboard secret as <code>?secret=...</code> to view operational data.
        </section>
      ) : null}

      {authorized && !databaseConfigured ? (
        <section className={styles.notice}>
          Configure Supabase service credentials to load vacancies and run history.
        </section>
      ) : null}

      {authorized && databaseConfigured ? (
        <div className={styles.grid}>
          <section className={styles.section} aria-labelledby="vacancies-title">
            <div className={styles.sectionHeader}>
              <h2 id="vacancies-title">Active Vacancies</h2>
              <span>{dashboardData.vacancies.length}</span>
            </div>

            {dashboardData.vacancies.length === 0 ? (
              <p className={styles.empty}>No job vacancies have been stored yet.</p>
            ) : (
              <div className={styles.list}>
                {dashboardData.vacancies.map((vacancy) => (
                  <article className={styles.opportunity} key={vacancy.id}>
                    <div className={styles.opportunityTopline}>
                      <div>
                        <h3>{vacancy.title}</h3>
                        <p className={styles.company}>
                          {vacancy.company ?? "Company not stated"}
                        </p>
                      </div>
                      <span className={styles.score}>{vacancy.score ?? "New"}</span>
                    </div>
                    <p>{vacancy.summary ?? vacancy.sourceTitle}</p>
                    <dl className={styles.meta}>
                      <div>
                        <dt>Status</dt>
                        <dd>{vacancy.vacancyStatus}</dd>
                      </div>
                      <div>
                        <dt>Freshness</dt>
                        <dd>{vacancy.freshnessStatus}</dd>
                      </div>
                      <div>
                        <dt>Fit</dt>
                        <dd>{vacancy.fitLevel ?? "Pending"}</dd>
                      </div>
                      <div>
                        <dt>Remote</dt>
                        <dd>{vacancy.remoteType}</dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>{vacancy.location ?? "Not stated"}</dd>
                      </div>
                      <div>
                        <dt>Employment</dt>
                        <dd>{vacancy.employmentType}</dd>
                      </div>
                      <div>
                        <dt>Salary</dt>
                        <dd>{vacancy.salary ?? "Not stated"}</dd>
                      </div>
                      <div>
                        <dt>Discovered</dt>
                        <dd>{formatDate(vacancy.discoveredAt)}</dd>
                      </div>
                      <div>
                        <dt>CV</dt>
                        <dd>
                          {vacancy.vacancyStatus === "cv_ready" ? "Ready" : "Not ready"}
                        </dd>
                      </div>
                      <div>
                        <dt>Cover Letter</dt>
                        <dd>
                          {vacancy.vacancyStatus === "cover_letter_ready"
                            ? "Ready"
                            : "Not ready"}
                        </dd>
                      </div>
                      <div>
                        <dt>Application</dt>
                        <dd>{vacancy.vacancyStatus}</dd>
                      </div>
                    </dl>
                    <div className={styles.links}>
                      {vacancy.applicationUrl ? (
                        <a className={styles.sourceLink} href={vacancy.applicationUrl}>
                          Application link
                        </a>
                      ) : null}
                      <a className={styles.sourceLink} href={vacancy.sourceUrl}>
                        Open source
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section} aria-labelledby="runs-title">
            <div className={styles.sectionHeader}>
              <h2 id="runs-title">Job Search Runs</h2>
              <span>{dashboardData.runs.length}</span>
            </div>

            {dashboardData.runs.length === 0 ? (
              <p className={styles.empty}>No job search runs recorded yet.</p>
            ) : (
              <div className={styles.runList}>
                {dashboardData.runs.map((run) => (
                  <article className={styles.run} key={run.id}>
                    <strong>{run.status}</strong>
                    <span>{run.runType}</span>
                    <time>{formatDate(run.startedAt)}</time>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
