import Link from "next/link";
import { env } from "@/config/env";
import { DashboardRepository } from "@/services/database/repositories/dashboard";
import { createSupabaseServiceClient } from "@/services/database/supabase";
import { triggerManualSearch } from "../actions";
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

export default async function FreelancePage({ searchParams }: PageProps) {
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
        ).getFreelanceDashboardData()
      : { opportunities: [], runs: [] };

  return (
    <main className={styles.shell}>
      <nav className={styles.nav} aria-label="Primary agent navigation">
        <Link className={styles.navActive} href={`/freelance${secretQuery}`}>
          Freelance Agent
        </Link>
        <Link href={`/jobs${secretQuery}`}>Job Search Agent</Link>
      </nav>

      <section className={styles.header} aria-labelledby="page-title">
        <div>
          <p className={styles.eyebrow}>Freelance Agent</p>
          <h1 className={styles.title} id="page-title">
            Project Opportunities
          </h1>
          <p className={styles.copy}>
            Recent discovered freelance projects, evaluation status, proposal state, and
            project search runs.
          </p>
        </div>
        <form action={triggerManualSearch} className={styles.actionForm}>
          <input type="hidden" name="dashboardSecret" value={dashboardSecret} />
          <button
            className={styles.primaryButton}
            disabled={!authorized || !databaseConfigured}
          >
            Run freelance search
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
          Configure Supabase service credentials to load project opportunities and run
          history.
        </section>
      ) : null}

      {authorized && databaseConfigured ? (
        <div className={styles.grid}>
          <section className={styles.section} aria-labelledby="opportunities-title">
            <div className={styles.sectionHeader}>
              <h2 id="opportunities-title">Freelance Projects</h2>
              <span>{dashboardData.opportunities.length}</span>
            </div>

            {dashboardData.opportunities.length === 0 ? (
              <p className={styles.empty}>No freelance projects have been stored yet.</p>
            ) : (
              <div className={styles.list}>
                {dashboardData.opportunities.map((opportunity) => (
                  <article className={styles.opportunity} key={opportunity.id}>
                    <div className={styles.opportunityTopline}>
                      <h3>{opportunity.title}</h3>
                      <span className={styles.score}>{opportunity.score ?? "New"}</span>
                    </div>
                    <p>{opportunity.summary ?? opportunity.sourceTitle}</p>
                    <dl className={styles.meta}>
                      <div>
                        <dt>Status</dt>
                        <dd>{opportunity.status}</dd>
                      </div>
                      <div>
                        <dt>Fit</dt>
                        <dd>{opportunity.fitLevel ?? "Pending"}</dd>
                      </div>
                      <div>
                        <dt>Proposal</dt>
                        <dd>
                          {opportunity.status === "proposal_draft" ? "Draft" : "None"}
                        </dd>
                      </div>
                      <div>
                        <dt>Discovered</dt>
                        <dd>{formatDate(opportunity.discoveredAt)}</dd>
                      </div>
                    </dl>
                    <a className={styles.sourceLink} href={opportunity.sourceUrl}>
                      Open source
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section} aria-labelledby="runs-title">
            <div className={styles.sectionHeader}>
              <h2 id="runs-title">Freelance Search Runs</h2>
              <span>{dashboardData.runs.length}</span>
            </div>

            {dashboardData.runs.length === 0 ? (
              <p className={styles.empty}>No freelance search runs recorded yet.</p>
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
