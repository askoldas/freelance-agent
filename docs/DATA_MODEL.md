# Data Model

This document defines the initial logical model. Codex may refine types and constraints during implementation, but material changes should be documented.

## General conventions

- Primary keys use UUIDs.
- Timestamps use `timestamptz`.
- Store source-specific raw data only when useful for debugging or reprocessing.
- Use enums or check constraints for stable statuses.
- Use JSONB for flexible structured metadata, not as a replacement for all relational design.
- Add `created_at` and `updated_at` where records change over time.

## `candidate_profiles`

The professional identity used for evaluation and proposal generation.

Suggested fields:

- `id`
- `name`
- `headline`
- `summary`
- `location`
- `timezone`
- `languages jsonb`
- `preferred_project_types jsonb`
- `excluded_project_types jsonb`
- `minimum_hourly_rate`
- `minimum_project_budget`
- `preferred_currencies jsonb`
- `availability_notes`
- `proposal_preferences jsonb`
- timestamps

The application is single-user initially, but the profile should still have a stable ID.

## `capabilities`

Verified capabilities that the system may safely mention.

Suggested fields:

- `id`
- `profile_id`
- `name`
- `category`
- `proficiency`: `strong`, `working`, `adjacent`, or `learning`
- `description`
- `evidence_notes`
- `is_active`
- timestamps

Examples include Next.js, Firebase, Supabase, Payload CMS, multilingual applications, authentication, Telegram bots, n8n, API integrations, and AI workflow design.

## `portfolio_items`

Projects or examples that may be referenced in proposals.

Suggested fields:

- `id`
- `profile_id`
- `title`
- `short_description`
- `business_problem`
- `solution`
- `verified_results`
- `technologies jsonb`
- `categories jsonb`
- `public_url`
- `repository_url`
- `is_confidential`
- `proposal_safe_text`
- `is_active`
- timestamps

Never generate public claims from confidential notes.

## `sources`

Configuration for manual and automatic opportunity sources.

Suggested fields:

- `id`
- `type`: `manual`, `telegram`, `tavily`, `gmail`, `feed`, or `other`
- `name`
- `enabled`
- `configuration jsonb`
- `last_checked_at`
- timestamps

Sensitive credentials must not be stored in plain source configuration.

## `opportunities`

Normalized project records.

Suggested fields:

- `id`
- `source_id`
- `source_type`
- `source_external_id`
- `source_url`
- `source_title`
- `raw_text`
- `content_hash`
- `canonical_url`
- `title`
- `client_name`
- `company_name`
- `description`
- `primary_category`
- `secondary_categories jsonb`
- `requested_outcomes jsonb`
- `requested_technologies jsonb`
- `constraints jsonb`
- `missing_information jsonb`
- `budget_min`
- `budget_max`
- `currency`
- `compensation_period`
- `deadline_text`
- `location_text`
- `published_at`
- `discovered_at`
- `status`
- timestamps

Suggested opportunity statuses:

- `new`
- `evaluated`
- `saved`
- `proposal_draft`
- `applied`
- `replied`
- `interview`
- `won`
- `lost`
- `rejected`
- `archived`

Use a unique index based on a normalized source key where possible. Use `content_hash` as a secondary duplicate signal, not the only identity mechanism.

## `evaluations`

Versioned assessment records. Do not overwrite history when re-evaluating with a new prompt or profile.

Suggested fields:

- `id`
- `opportunity_id`
- `profile_id`
- `score`
- `recommendation`
- `fit_level`
- `summary`
- `match_reasons jsonb`
- `gaps jsonb`
- `risks jsonb`
- `learning_effort`
- `budget_assessment`
- `credibility_assessment`
- `scope_clarity`
- `suggested_questions jsonb`
- `deterministic_adjustments jsonb`
- `model`
- `prompt_version`
- `usage_metadata jsonb`
- `evaluated_at`

Suggested recommendations:

- `priority`
- `apply`
- `review`
- `skip`
- `reject`

Suggested fit levels:

- `direct`
- `adjacent`
- `learnable`
- `risky`

## `solution_options`

Possible approaches associated with an evaluation.

Suggested fields:

- `id`
- `evaluation_id`
- `position`
- `title`
- `summary`
- `technologies jsonb`
- `fit_reason`
- `tradeoffs jsonb`
- `open_questions jsonb`
- timestamps

## `proposals`

Reviewable proposal versions.

Suggested fields:

- `id`
- `opportunity_id`
- `evaluation_id`
- `version`
- `style`
- `body`
- `selected_portfolio_item_ids jsonb`
- `user_instruction`
- `model`
- `prompt_version`
- `usage_metadata jsonb`
- `status`: `draft`, `approved`, `superseded`, or `discarded`
- timestamps

## `application_events`

Append-only history of user decisions and project progress.

Suggested fields:

- `id`
- `opportunity_id`
- `event_type`
- `notes`
- `metadata jsonb`
- `occurred_at`
- `created_at`

Examples:

- opportunity saved
- proposal generated
- proposal approved
- application submitted
- reply received
- follow-up scheduled
- project won or lost

## `agent_runs`

Operational record for ingestion, evaluation, proposal, search, and follow-up jobs.

Suggested fields:

- `id`
- `run_type`
- `correlation_id`
- `source_id`
- `opportunity_id`
- `status`
- `started_at`
- `finished_at`
- `error_code`
- `error_message_redacted`
- `metadata jsonb`

## Duplicate strategy

Use multiple signals:

1. source external ID;
2. normalized canonical URL;
3. normalized title plus client/company;
4. content fingerprint;
5. optional similarity matching later.

Ingestion must be idempotent and should update discovery metadata without creating repeated opportunities.

## Row-level security

Milestone one may use server-only database access. Before introducing a browser dashboard:

- add application authentication;
- enable RLS on user-facing tables;
- associate rows with an owner ID;
- keep service-role operations confined to trusted server code.
