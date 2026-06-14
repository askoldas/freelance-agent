# Architecture

## Overview

Freelance Agent is a code-first TypeScript application. The core system does not depend on n8n.

```text
Scheduled collectors / manual fallback
                 |
                 v
        Source adapters and search
                 |
                 v
       Normalize and deduplicate
                 |
                 v
        Extract and evaluate
                 |
        +--------+--------+
        |                 |
        v                 v
    Supabase          Telegram
                           |
                           v
                   Proposal on request
```

The first useful product behavior is automatic discovery. Telegram is primarily the review and control interface, not the main source of opportunities.

## Recommended runtime

Use Next.js App Router with server-side route handlers and TypeScript.

The first version may be deployed to Vercel. Long-running or high-volume workers can later move to a dedicated Node worker without changing the domain layer.

## Main components

### Scheduled search coordinator

Responsibilities:

- run configured search tracks on schedule;
- call one or more source adapters;
- keep each run bounded;
- prevent overlapping or duplicate processing;
- record run status and provider errors;
- pass new results to the ingestion pipeline.

### Source adapters

Initial adapter:

- Tavily public web search.

Later adapters may include:

- alert-email ingestion;
- public feeds and supported APIs;
- direct adapters for useful project sources;
- a browser-to-agent submission path.

Every source returns a common normalized result shape.

### Search-track configuration

Search tracks should be data-driven rather than hardcoded into route handlers.

Each track may define:

- name and category;
- search queries;
- included or excluded domains;
- language and region hints;
- result limit;
- minimum prefilter score;
- notification threshold;
- enabled state;
- last run metadata.

### Opportunity ingestion

The ingestion pipeline:

1. validates a source result;
2. derives source identity and canonical URL;
3. creates a content fingerprint;
4. checks for existing opportunities;
5. applies deterministic prefilters;
6. stores or updates the normalized opportunity;
7. sends qualifying results to extraction and evaluation.

Manual Telegram text or URL submission uses the same ingestion pipeline as a secondary fallback.

### Extraction service

Converts source content into structured project facts:

- title;
- client or company when present;
- description;
- required outcomes;
- requested technologies;
- budget and currency;
- deadline;
- source URL;
- location or timezone;
- explicit constraints;
- missing information.

Extraction should be separate from evaluation.

### Evaluation service

Uses the normalized opportunity, candidate profile, capabilities, preferences, and selected portfolio items.

It returns a validated structured assessment. Deterministic rules then apply caps or penalties.

Examples:

- clearly irrelevant results should not consume a full evaluation call;
- unpaid or unrealistic work cannot receive a priority recommendation;
- missing budget is flagged but does not automatically reject a project;
- high delivery risk cannot produce a `priority` recommendation;
- scores remain between 0 and 100.

### Solution advisor

Suggests one to three plausible approaches. Each suggestion includes:

- summary;
- likely stack or services;
- why it fits;
- key trade-offs;
- unknowns to clarify.

The advisor may recommend the client's stack, a preferred stack, or another suitable approach.

### Telegram adapter

Responsibilities:

- receive webhook updates and callbacks;
- authorize configured Telegram user IDs;
- send high-value project notifications;
- provide actions such as proposal, save, reject, details, and open source;
- support manual submission as a fallback;
- delegate business logic to use cases.

It must not contain prompts, SQL, or scoring logic.

### Proposal writer

Generates reviewable proposals from opportunity facts, evaluation, verified capabilities, selected portfolio items, and user instructions.

Proposals are stored with model and prompt metadata.

### Persistence

Use Supabase/PostgreSQL with repository interfaces. Keep database operations behind a domain-friendly data layer.

Use the service-role key only on the server.

## Suggested directory structure

```text
src/
  app/
    api/
      health/route.ts
      telegram/webhook/route.ts
      cron/search/route.ts
  config/
    env.ts
  domain/
    sources/
    search-tracks/
    opportunities/
    evaluations/
    proposals/
    profiles/
  use-cases/
    run-project-search.ts
    ingest-search-result.ts
    evaluate-opportunity.ts
    generate-proposal.ts
    submit-manual-opportunity.ts
  services/
    ai/
    search/
    telegram/
    database/
    web-content/
  prompts/
  lib/
supabase/
  migrations/
tests/
```

## External service interfaces

### AI provider

Support structured generation, model selection, timeouts, limited retries, usage metadata, and normalized errors.

The first adapter uses OpenRouter, but domain code must not depend on its response shape.

### Search provider

Define a source-neutral interface. The first adapter uses Tavily.

### Database repositories

Prefer repositories grouped by aggregate rather than a generic database client used throughout the application.

### Telegram client

Wrap notification formatting, message editing, callback acknowledgement, and inline keyboards.

## Scheduling

Initial scheduled work can use Vercel Cron or another authenticated HTTP scheduler.

Scheduled routes must:

- verify a secret;
- be idempotent;
- process bounded batches;
- record run status;
- avoid overlapping runs where possible;
- return before platform timeouts.

## Notification policy

- strong matches: notify individually;
- medium matches: optionally include in a digest;
- weak or duplicate results: do not notify;
- provider or pipeline failures: send a compact operational alert only when action is required.

## Observability

Record correlation ID, search track, source type, opportunity ID, workflow stage, elapsed time, model and prompt version, and normalized outcome.

Never log secrets or unredacted sensitive content.

## Reliability

- validate all external input;
- use bounded retries for transient failures;
- make discovery and ingestion idempotent;
- avoid repeated notifications;
- acknowledge Telegram callbacks promptly;
- store workflow errors for review;
- degrade gracefully when a provider is unavailable.

## Security

- Telegram is single-user by default;
- authorize by numeric Telegram user ID;
- use a webhook secret token;
- keep service credentials server-only;
- validate scheduled requests;
- prevent unsafe URL fetching;
- do not commit private integration data.

## Future extensions

- alert-email collector;
- authenticated dashboard;
- feedback-driven scoring calibration;
- application and follow-up tracking;
- additional supported project-source integrations;
- dedicated worker and queue when volume requires it.
