create table if not exists professional_overall_experience (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references candidate_profiles(id) on delete cascade,
  external_id text not null,
  area text not null,
  start_year integer,
  years_approximate integer,
  minimum_project_count integer,
  exact_count boolean,
  summary text not null,
  public_claim text,
  work_types jsonb not null default '[]'::jsonb,
  platforms jsonb not null default '[]'::jsonb,
  record_status text not null check (record_status in ('approved', 'needs_review', 'private')),
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, external_id)
);

create table if not exists professional_experience_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references candidate_profiles(id) on delete cascade,
  external_id text not null,
  company text not null,
  role text not null,
  start_year integer not null,
  end_year integer,
  employment_type text not null,
  summary text not null,
  responsibilities jsonb not null default '[]'::jsonb,
  record_status text not null check (record_status in ('approved', 'needs_review', 'private')),
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, external_id),
  check (end_year is null or end_year >= start_year)
);

create table if not exists professional_technologies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references candidate_profiles(id) on delete cascade,
  external_id text not null,
  name text not null,
  category text not null,
  proficiency text not null check (proficiency in ('strong', 'working', 'adjacent', 'learning')),
  record_status text not null check (record_status in ('approved', 'needs_review', 'private')),
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, external_id)
);

create table if not exists professional_cases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references candidate_profiles(id) on delete cascade,
  external_id text not null,
  title text not null,
  type text not null,
  url text,
  record_status text not null check (record_status in ('approved', 'needs_review', 'private')),
  project_status text not null,
  client_type text,
  client_name text,
  confidential boolean not null default false,
  public_visibility boolean not null default false,
  role jsonb not null default '[]'::jsonb,
  business_problem text,
  solution text,
  features jsonb not null default '[]'::jsonb,
  technologies jsonb not null default '[]'::jsonb,
  results jsonb not null default '[]'::jsonb,
  proposal_safe_summary text not null,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, external_id)
);

create table if not exists professional_education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references candidate_profiles(id) on delete cascade,
  external_id text not null,
  institution text not null,
  program text not null,
  start_year integer,
  end_year integer,
  record_status text not null check (record_status in ('approved', 'needs_review', 'private')),
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, external_id),
  check (end_year is null or start_year is null or end_year >= start_year)
);

create table if not exists professional_languages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references candidate_profiles(id) on delete cascade,
  external_id text not null,
  name text not null,
  level text not null,
  notes text,
  record_status text not null check (record_status in ('approved', 'needs_review', 'private')),
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, external_id)
);

create table if not exists professional_profile_settings (
  profile_id uuid primary key references candidate_profiles(id) on delete cascade,
  proposal_preferences jsonb not null default '{}'::jsonb,
  claim_rules jsonb not null default '{}'::jsonb,
  source_payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists generated_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references candidate_profiles(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete set null,
  document_type text not null check (document_type in ('proposal', 'cover_letter', 'cv', 'bio', 'platform_profile')),
  selected_source_records jsonb not null default '[]'::jsonb,
  content text not null,
  model text,
  prompt_version text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'superseded', 'discarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists generated_document_claims (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references generated_documents(id) on delete cascade,
  claim_text text not null,
  source_table text not null,
  source_record_id uuid not null,
  source_external_id text,
  created_at timestamptz not null default now()
);

create index if not exists professional_overall_experience_status_idx on professional_overall_experience(record_status);
create index if not exists professional_experience_entries_status_idx on professional_experience_entries(record_status);
create index if not exists professional_technologies_status_idx on professional_technologies(record_status);
create unique index if not exists professional_technologies_profile_name_idx on professional_technologies(profile_id, lower(name));
create index if not exists professional_cases_status_idx on professional_cases(record_status);
create unique index if not exists professional_languages_profile_name_idx on professional_languages(profile_id, lower(name));
create index if not exists generated_documents_profile_type_idx on generated_documents(profile_id, document_type);
create index if not exists generated_documents_opportunity_idx on generated_documents(opportunity_id);
create index if not exists generated_document_claims_document_idx on generated_document_claims(document_id);
