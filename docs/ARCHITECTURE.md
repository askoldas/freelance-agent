# Architecture

## Overview

Freelance Agent is a code-first TypeScript application. The core system does not depend on n8n.

```text
Telegram / future dashboard / scheduled collectors
                    |
                    v
             Application API
                    |
          Domain use cases and rules
          /         |          \
         v          v           v
     Supabase   OpenRouter    Tavily
```

## Recommended runtime

Use Next.js App Router with server-side route handlers and TypeScript.

The first version may be deployed to Vercel. Long-running or high-volume workers can later move to a dedicated Node worker without changing the domain layer.

## Main components

### Telegram adapter

Responsibilities:

- receive webhook updates;
- verify the Telegram webhook secret;
- authorize configured Telegram user IDs;
- parse commands, messages, URLs, and callback buttons;
- render concise result messages;
- delegate all business logic to use cases.

It must not contain project evaluation logic or large AI prompts.

### Opportunity ingestion

Input sources initially include:

- pasted project descriptions;
- manually submitted URLs;
- Telegram forwarded text.

Later adapters may include:

- Tavily public web search;
- Gmail alert ingestion;
- public feeds and permitted APIs;
- a browser extension or share-to-agent action.

Every source must return a common normalized input shape.

### URL handling

For milestone one, URL ingestion should be conservative:

1. detect that the message contains a URL;
2. try to retrieve public text using a bounded, safe fetcher;
3. reject unsupported protocols and local/private addresses;
4. limit redirects, response size, and timeout;
5. fall back to asking the user to paste the listing when content is unavailable or login-protected.

Do not attempt authenticated browsing in milestone one.

### Extraction service

Converts unstructured text into structured project facts:

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

Extraction should be separate from evaluation to reduce hallucination and make testing easier.

### Evaluation service

Uses the normalized opportunity, candidate profile, capability records, preferences, and selected portfolio items.

It returns a validated structured assessment. Deterministic rules then apply caps or penalties where needed.

Examples of deterministic rules:

- unpaid or commission-only work cannot receive a priority recommendation;
- missing budget should be flagged but not automatically rejected;
- blocked categories or unsafe work should be rejected;
- an evaluation with high delivery risk cannot be `priority`;
- scores must remain between 0 and 100.

### Solution advisor

Suggests one to three plausible approaches. Each suggestion should include:

- summary;
- likely stack or services;
- why it fits the project;
- key trade-offs;
- unknowns that must be clarified.

The advisor may recommend the client's requested stack, a preferred stack, or another suitable approach. It must not imply that a suggestion is a final architecture before requirements are clarified.

### Proposal writer

Generates reviewable proposals from:

- opportunity facts;
- evaluation;
- selected verified capabilities;
- selected portfolio items;
- user instructions such as shorter, more technical, or different pricing framing.

Proposals are stored with model and prompt metadata.

### Persistence

Use Supabase/PostgreSQL with repository interfaces. Keep database operations behind a domain-friendly data layer.

Use the service-role key only on the server. A client-side dashboard should use a separate authenticated Supabase client and row-level security when introduced.

## Suggested directory structure

```text
src/
  app/
    api/
      health/route.ts
      telegram/webhook/route.ts
      cron/search/route.ts
      cron/follow-ups/route.ts
  config/
    env.ts
  domain/
    opportunities/
    evaluations/
    proposals/
    profiles/
  use-cases/
    ingest-opportunity.ts
    evaluate-opportunity.ts
    generate-proposal.ts
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

The exact structure can evolve, but framework handlers must remain thin.

## External service interfaces

### AI provider

Define an interface that supports:

- structured generation;
- model selection;
- timeout and limited retries;
- usage metadata;
- provider error normalization.

The first adapter uses OpenRouter, but domain code must not depend directly on its HTTP response shape.

### Search provider

Define a source-neutral interface. The first public-search adapter uses Tavily.

### Database repositories

Prefer small repositories grouped by aggregate rather than one generic database client used everywhere.

### Telegram client

Wrap message formatting, editing, callback acknowledgement, and inline keyboards.

## Scheduling

Initial scheduled work can use Vercel Cron or another authenticated HTTP scheduler.

Cron routes must:

- verify a secret;
- be idempotent;
- process bounded batches;
- record run status;
- return before platform timeouts;
- avoid overlapping runs where possible.

## Observability

Record:

- correlation ID;
- source type;
- opportunity ID;
- workflow stage;
- elapsed time;
- model and prompt version;
- success or normalized error code.

Never log secrets or full private messages unless explicitly configured for local development with redaction.

## Reliability

- validate all external input;
- use bounded retries with backoff for transient failures;
- avoid retrying invalid user data;
- make insert operations idempotent;
- acknowledge Telegram callbacks promptly;
- store workflow errors where they can be reviewed;
- degrade gracefully when a model or search provider is unavailable.

## Security

- Telegram is single-user by default;
- authorize by numeric Telegram user ID;
- use a webhook secret token;
- prevent SSRF in URL fetching;
- limit fetched content size;
- keep service-role credentials server-only;
- validate cron secrets;
- never store marketplace passwords in this application;
- do not implement CAPTCHA bypass or stealth scraping.

## Future extensions

- Gmail OAuth collector;
- authenticated dashboard;
- feedback-driven scoring calibration;
- application and follow-up tracking;
- permitted marketplace APIs;
- browser extension for sending the current listing to the agent;
- dedicated background worker and queue when volume requires it.
