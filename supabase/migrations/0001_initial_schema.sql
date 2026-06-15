create extension if not exists pgcrypto;

create table candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  headline text not null,
  summary text not null,
  location text,
  timezone text,
  languages jsonb not null default '[]'::jsonb,
  preferred_project_types jsonb not null default '[]'::jsonb,
  excluded_project_types jsonb not null default '[]'::jsonb,
  minimum_hourly_rate numeric(10, 2),
  minimum_project_budget numeric(12, 2),
  preferred_currencies jsonb not null default '[]'::jsonb,
  availability_notes text,
  proposal_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table capabilities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references candidate_profiles(id) on delete cascade,
  name text not null,
  category text not null,
  proficiency text not null check (proficiency in ('strong', 'working', 'adjacent', 'learning')),
  description text not null,
  evidence_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index capabilities_profile_name_idx on capabilities(profile_id, lower(name));

create table sources (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('manual', 'telegram', 'tavily', 'gmail', 'feed', 'other')),
  name text not null,
  enabled boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, name)
);

create table search_tracks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete set null,
  slug text not null unique,
  name text not null,
  category text not null,
  queries jsonb not null,
  include_domains jsonb not null default '[]'::jsonb,
  exclude_domains jsonb not null default '[]'::jsonb,
  excluded_title_patterns jsonb not null default '[]'::jsonb,
  region text,
  language text,
  time_range text check (time_range in ('day', 'week', 'month', 'year')),
  start_date date,
  freshness_days integer not null default 90 check (freshness_days between 1 and 730),
  social_freshness_days integer not null default 21 check (social_freshness_days between 1 and 180),
  result_limit integer not null default 5 check (result_limit between 1 and 20),
  min_prefilter_score integer not null default 40 check (min_prefilter_score between 0 and 100),
  notification_threshold integer not null default 75 check (notification_threshold between 0 and 100),
  enabled boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table opportunities (
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
  client_name text,
  company_name text,
  description text,
  primary_category text check (
    primary_category in (
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
      'other'
    )
  ),
  secondary_categories jsonb not null default '[]'::jsonb,
  requested_outcomes jsonb not null default '[]'::jsonb,
  requested_technologies jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '[]'::jsonb,
  missing_information jsonb not null default '[]'::jsonb,
  budget_min numeric(12, 2),
  budget_max numeric(12, 2),
  currency text,
  compensation_period text,
  deadline_text text,
  location_text text,
  published_at timestamptz,
  content_type text not null default 'unknown' check (
    content_type in (
      'active_opportunity',
      'social_post',
      'informational',
      'service_page',
      'portfolio',
      'documentation',
      'discussion',
      'tutorial',
      'case_study',
      'comparison',
      'unknown'
    )
  ),
  buyer_intent_evidence jsonb not null default '[]'::jsonb,
  rejection_category text check (
    rejection_category in (
      'excluded_domain',
      'excluded_title_pattern',
      'informational_content',
      'service_page',
      'portfolio',
      'documentation',
      'case_study',
      'generic_discussion',
      'missing_buyer_intent',
      'stale_result',
      'undated_social_post',
      'stale_social_post',
      'low_prefilter_score'
    )
  ),
  rejection_reason text,
  rejected_at timestamptz,
  discovered_at timestamptz not null default now(),
  status text not null default 'new' check (
    status in (
      'new',
      'evaluated',
      'saved',
      'proposal_draft',
      'applied',
      'replied',
      'interview',
      'won',
      'lost',
      'rejected',
      'archived'
    )
  ),
  prefilter_score integer not null default 0 check (prefilter_score between 0 and 100),
  prefilter_reasons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_external_id),
  unique (canonical_url)
);

create unique index opportunities_content_hash_idx on opportunities(content_hash);
create index opportunities_discovered_at_idx on opportunities(discovered_at desc);
create index opportunities_status_idx on opportunities(status);
create index opportunities_rejection_category_idx on opportunities(rejection_category);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  profile_id uuid references candidate_profiles(id) on delete set null,
  score integer not null check (score between 0 and 100),
  recommendation text not null check (recommendation in ('priority', 'apply', 'review', 'skip', 'reject')),
  fit_level text not null check (fit_level in ('direct', 'adjacent', 'learnable', 'risky')),
  summary text not null,
  match_reasons jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  learning_effort text not null,
  budget_assessment text not null,
  credibility_assessment text not null,
  scope_clarity text not null,
  suggested_questions jsonb not null default '[]'::jsonb,
  deterministic_adjustments jsonb not null default '[]'::jsonb,
  model text not null,
  prompt_version text not null,
  usage_metadata jsonb not null default '{}'::jsonb,
  evaluated_at timestamptz not null default now()
);

create index evaluations_opportunity_id_idx on evaluations(opportunity_id);
create index evaluations_score_idx on evaluations(score desc);

create table solution_options (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references evaluations(id) on delete cascade,
  position integer not null check (position between 1 and 3),
  title text not null,
  summary text not null,
  technologies jsonb not null default '[]'::jsonb,
  fit_reason text not null,
  tradeoffs jsonb not null default '[]'::jsonb,
  open_questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evaluation_id, position)
);

create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null check (run_type in ('search', 'evaluation', 'notification', 'manual_submission')),
  correlation_id text not null,
  source_id uuid references sources(id) on delete set null,
  search_track_id uuid references search_tracks(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  status text not null check (status in ('running', 'completed', 'partial_failure', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_code text,
  error_message_redacted text,
  metadata jsonb not null default '{}'::jsonb
);

create index agent_runs_started_at_idx on agent_runs(started_at desc);
create index agent_runs_status_idx on agent_runs(status);

create table notification_states (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  channel text not null check (channel in ('telegram')),
  recipient text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'suppressed')),
  sent_at timestamptz,
  provider_message_id text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, channel, recipient)
);

create index notification_states_status_idx on notification_states(status);
