alter table search_tracks
  add column if not exists agent_type text not null default 'freelance'
    check (agent_type in ('freelance', 'jobs'));

alter table agent_runs
  add column if not exists agent_type text not null default 'freelance'
    check (agent_type in ('freelance', 'jobs'));

alter table generated_documents
  add column if not exists job_vacancy_id uuid;

do $$
begin
  alter table search_tracks drop constraint if exists search_tracks_category_check;
  alter table search_tracks add constraint search_tracks_category_check check (
    category in (
      'web_build',
      'existing_project',
      'automation',
      'ai_agent',
      'integration',
      'cms',
      'backend',
      'frontend',
      'maintenance',
      'consulting',
      'other',
      'web_product_development',
      'automation_ai',
      'technical_operations'
    )
  );
end $$;

create table if not exists job_vacancies (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete set null,
  search_track_id uuid references search_tracks(id) on delete set null,
  source_type text not null,
  source_external_id text,
  source_url text not null,
  source_title text not null,
  raw_text text not null,
  content_hash text not null,
  canonical_url text not null,
  title text,
  company text,
  application_url text,
  external_vacancy_id text,
  description text,
  responsibilities jsonb not null default '[]'::jsonb,
  required_skills jsonb not null default '[]'::jsonb,
  preferred_skills jsonb not null default '[]'::jsonb,
  seniority text,
  employment_type text not null default 'unknown' check (
    employment_type in (
      'full_time',
      'part_time',
      'contract',
      'temporary',
      'internship',
      'unknown'
    )
  ),
  contract_type text,
  salary_min numeric(12, 2),
  salary_max numeric(12, 2),
  currency text,
  salary_period text,
  country text,
  city text,
  remote_type text not null default 'unspecified' check (
    remote_type in ('remote', 'hybrid', 'onsite', 'unspecified')
  ),
  timezone_expectations text,
  language_requirements jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  application_deadline timestamptz,
  discovered_at timestamptz not null default now(),
  vacancy_status text not null default 'discovered' check (
    vacancy_status in (
      'discovered',
      'validated',
      'evaluated',
      'saved',
      'cv_ready',
      'cover_letter_ready',
      'applied',
      'replied',
      'interview',
      'offer',
      'rejected',
      'closed',
      'expired',
      'archived'
    )
  ),
  freshness_status text not null default 'unknown' check (
    freshness_status in ('fresh', 'aging', 'stale', 'expired', 'unknown')
  ),
  content_type text not null default 'unknown' check (
    content_type in (
      'active_vacancy',
      'job_board_listing',
      'company_careers_page',
      'social_post',
      'salary_guide',
      'career_advice',
      'training',
      'recruiter_marketing',
      'informational',
      'search_results_page',
      'unknown'
    )
  ),
  rejection_category text check (
    rejection_category in (
      'not_a_specific_role',
      'missing_active_role_evidence',
      'informational_content',
      'generic_careers_page',
      'salary_guide',
      'training_or_certification',
      'recruiter_marketing',
      'expired_vacancy',
      'stale_result',
      'undated_social_post',
      'stale_social_post',
      'duplicate',
      'listing_page_not_expanded',
      'excluded_domain',
      'excluded_title_pattern',
      'low_prefilter_score'
    )
  ),
  rejection_reason text,
  rejected_at timestamptz,
  evaluation_status text not null default 'pending' check (
    evaluation_status in ('pending', 'evaluated', 'skipped', 'failed')
  ),
  prefilter_score integer not null default 0 check (prefilter_score between 0 and 100),
  prefilter_reasons jsonb not null default '[]'::jsonb,
  validation_evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_external_id),
  unique (canonical_url),
  unique (content_hash)
);

create table if not exists job_vacancy_evaluations (
  id uuid primary key default gen_random_uuid(),
  job_vacancy_id uuid not null references job_vacancies(id) on delete cascade,
  profile_id uuid references candidate_profiles(id) on delete set null,
  score integer not null check (score between 0 and 100),
  fit_level text not null check (fit_level in ('direct', 'adjacent', 'learnable', 'risky')),
  recommendation text not null check (
    recommendation in ('priority', 'apply', 'review', 'skip', 'reject')
  ),
  summary text not null,
  strong_matches jsonb not null default '[]'::jsonb,
  transferable_matches jsonb not null default '[]'::jsonb,
  missing_requirements jsonb not null default '[]'::jsonb,
  learning_requirements jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  salary_observations text not null,
  location_observations text not null,
  company_credibility text not null,
  application_effort text not null,
  realistic_chance text not null,
  strategic_value text not null,
  suggested_cv_emphasis jsonb not null default '[]'::jsonb,
  suggested_cover_letter_emphasis jsonb not null default '[]'::jsonb,
  suggested_interview_preparation jsonb not null default '[]'::jsonb,
  deterministic_adjustments jsonb not null default '[]'::jsonb,
  model text not null,
  prompt_version text not null,
  usage_metadata jsonb not null default '{}'::jsonb,
  evaluated_at timestamptz not null default now()
);

create table if not exists job_notification_states (
  id uuid primary key default gen_random_uuid(),
  job_vacancy_id uuid not null references job_vacancies(id) on delete cascade,
  channel text not null check (channel in ('telegram')),
  recipient text not null,
  status text not null default 'pending' check (
    status in ('pending', 'sent', 'failed', 'suppressed')
  ),
  sent_at timestamptz,
  provider_message_id text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_vacancy_id, channel, recipient)
);

do $$
begin
  alter table generated_documents
    drop constraint if exists generated_documents_job_vacancy_id_fkey;

  alter table generated_documents
    add constraint generated_documents_job_vacancy_id_fkey
    foreign key (job_vacancy_id) references job_vacancies(id) on delete set null;
end $$;

create index if not exists search_tracks_agent_type_idx on search_tracks(agent_type);
create index if not exists agent_runs_agent_type_started_at_idx
  on agent_runs(agent_type, started_at desc);
create index if not exists job_vacancies_discovered_at_idx
  on job_vacancies(discovered_at desc);
create index if not exists job_vacancies_status_idx on job_vacancies(vacancy_status);
create index if not exists job_vacancies_freshness_idx on job_vacancies(freshness_status);
create index if not exists job_vacancies_rejection_category_idx
  on job_vacancies(rejection_category);
create index if not exists job_vacancy_evaluations_vacancy_idx
  on job_vacancy_evaluations(job_vacancy_id);
create index if not exists job_vacancy_evaluations_score_idx
  on job_vacancy_evaluations(score desc);
create index if not exists job_notification_states_status_idx
  on job_notification_states(status);
create index if not exists generated_documents_job_vacancy_idx
  on generated_documents(job_vacancy_id);

do $$
declare
  tavily_source_uuid uuid := '00000000-0000-4000-8000-000000000101';
  excluded_title_patterns jsonb := '[
    "\\bsalary guide\\b",
    "\\bcareer advice\\b",
    "\\bhow to\\b",
    "\\btutorial\\b",
    "\\btraining\\b",
    "\\bcertification\\b",
    "\\bcourse\\b",
    "\\bwhat is\\b",
    "\\baverage salary\\b"
  ]'::jsonb;
begin
  insert into sources (id, type, name, enabled, configuration) values
    (tavily_source_uuid, 'tavily', 'Tavily public web search', true, '{"provider":"tavily"}'::jsonb)
  on conflict (id) do update set
    type = excluded.type,
    name = excluded.name,
    enabled = true,
    configuration = excluded.configuration,
    updated_at = now();

  insert into search_tracks (
    source_id,
    agent_type,
    slug,
    name,
    category,
    queries,
    include_domains,
    exclude_domains,
    excluded_title_patterns,
    region,
    language,
    time_range,
    freshness_days,
    social_freshness_days,
    result_limit,
    min_prefilter_score,
    notification_threshold,
    enabled
  ) values
    (tavily_source_uuid, 'jobs', 'jobs-web-product-development', 'Web and product development jobs', 'web_product_development', '["hiring full-stack web developer remote position apply", "open role React Next.js web developer contract apply", "vacancy frontend developer web application Europe remote", "join our team JavaScript developer part-time remote"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'Europe', 'en', 'month', 30, 14, 5, 45, 76, true),
    (tavily_source_uuid, 'jobs', 'jobs-cms-ecommerce-development', 'CMS and ecommerce development jobs', 'web_product_development', '["hiring CMS developer WordPress ecommerce remote apply", "open role Shopify developer contract position", "vacancy WordPress developer part-time remote Europe", "join our team ecommerce developer apply"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'Europe', 'en', 'month', 30, 14, 5, 45, 74, true),
    (tavily_source_uuid, 'jobs', 'jobs-automation-ai', 'Automation and AI jobs', 'automation_ai', '["hiring AI automation developer remote position apply", "open role workflow automation specialist n8n contract", "vacancy AI integration developer remote Europe apply", "business automation developer contract role apply"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'Europe', 'en', 'month', 30, 14, 5, 45, 76, true),
    (tavily_source_uuid, 'jobs', 'jobs-technical-operations', 'Technical operations jobs', 'technical_operations', '["hiring digital operations specialist remote apply", "open role technical operations specialist Europe remote", "vacancy business systems specialist implementation apply", "workflow process specialist contract role apply"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'Europe', 'en', 'month', 30, 14, 5, 42, 72, true)
  on conflict (slug) do update set
    source_id = excluded.source_id,
    agent_type = excluded.agent_type,
    name = excluded.name,
    category = excluded.category,
    queries = excluded.queries,
    include_domains = excluded.include_domains,
    exclude_domains = excluded.exclude_domains,
    excluded_title_patterns = excluded.excluded_title_patterns,
    region = excluded.region,
    language = excluded.language,
    time_range = excluded.time_range,
    freshness_days = excluded.freshness_days,
    social_freshness_days = excluded.social_freshness_days,
    result_limit = excluded.result_limit,
    min_prefilter_score = excluded.min_prefilter_score,
    notification_threshold = excluded.notification_threshold,
    enabled = true,
    updated_at = now();
end $$;
