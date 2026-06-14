# Codex Task 01: Build the first working Project Agent

Read `AGENTS.md`, `README.md`, `docs/PROJECT.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/ROADMAP.md`, `docs/UI.md`, and `docs/CODEX_WORKFLOW.md` before changing code.

## Goal

Build the first usable version of Freelance Agent, not an empty application shell.

The completed milestone must automatically search for available projects, store and deduplicate them, evaluate promising opportunities, display them in a minimal internal dashboard, and send strong matches to Telegram.

Manual project submission is optional and secondary. The main flow must work without the user supplying each project.

## Technology

Use:

- current stable Next.js App Router;
- TypeScript with strict type checking;
- Supabase/PostgreSQL;
- Tavily as the initial public-search provider;
- OpenRouter for structured extraction and evaluation;
- Telegram Bot API for notifications and actions;
- Zod for external and model-output validation;
- Vitest for tests.

## Styling

Use custom CSS only.

- Use `globals.css`, CSS custom properties, and CSS Modules.
- Do not install or configure Tailwind.
- Do not use Bootstrap, Material UI, Chakra UI, shadcn/ui, styled-components, or another design system or CSS framework.
- Follow `docs/UI.md`.

## Required product flow

```text
Protected scheduled or manual search trigger
→ load enabled search tracks
→ search through Tavily
→ normalize results
→ canonicalize URLs and remove duplicates
→ apply inexpensive deterministic prefilters
→ store new candidates in Supabase
→ use OpenRouter to extract and evaluate promising projects
→ store evaluations and solution options
→ show opportunities in a minimal dashboard
→ notify Telegram when a result passes the notification threshold
```

## Application foundation

Create the application foundation as part of this real feature implementation:

- Next.js App Router with `src/`;
- strict TypeScript;
- ESLint and formatting;
- environment validation;
- structured server logging;
- `.env.example`;
- useful package scripts;
- GitHub Actions CI;
- health endpoint.

Do not treat these as a separate milestone or spend time creating unused placeholder abstractions.

## Database

Create Supabase migrations for the records required by this milestone:

- candidate profile;
- capabilities;
- sources;
- search tracks;
- opportunities;
- evaluations;
- solution options;
- agent runs;
- notification state.

Include the minimum proposal and portfolio structures only when they are genuinely required by the evaluation flow. Avoid building the full later-stage application-tracking system prematurely.

Implement:

- useful constraints and indexes;
- source identity;
- canonical URL handling;
- content fingerprinting;
- idempotent opportunity ingestion;
- search-run recording;
- prevention of duplicate notifications.

Add replaceable example profile and capability seed data. Do not invent achievements or client results.

## Search tracks

Create configurable initial tracks for:

- web applications and business platforms;
- completion or repair of existing projects;
- CMS and content systems;
- AI agents and workflow automation;
- non-AI business automation;
- APIs and integrations;
- agency subcontracting;
- technical consulting.

Queries should include business outcomes and project-request language, not only technology names.

## AI evaluation

Separate factual extraction from evaluation where practical.

Validate structured outputs with Zod and store:

- concise summary;
- primary and secondary categories;
- direct, adjacent, learnable, or risky fit;
- score from 0 to 100;
- match reasons;
- gaps and uncertainties;
- delivery risks;
- learning effort;
- budget and scope observations;
- suggested client questions;
- recommendation;
- one to three plausible solution options;
- model and prompt version metadata.

Apply deterministic rules after model output. Avoid AI calls for duplicates and obviously irrelevant results.

## Telegram

Implement Telegram as the notification and control interface.

Requirements:

- authorize only configured Telegram user IDs;
- verify the webhook secret;
- send strong matches automatically;
- include title, score, fit, source, reasons, risks, and source link;
- include actions for save, reject, details, and proposal placeholder;
- acknowledge callbacks quickly;
- do not send applications or outreach.

The proposal button may clearly report that proposal generation belongs to the next milestone if proposal generation is not implemented here.

## Dashboard

Create a minimal authenticated or securely private operational dashboard suitable for a single-user MVP.

Show:

- recent opportunities;
- score and recommendation;
- category and fit level;
- source and discovery time;
- evaluation summary;
- recent search-run status;
- a protected development action to run a search manually.

Use custom CSS Modules and provide responsive empty, loading, success, and error states.

Do not build a marketing page or a large admin system.

## Scheduling

Add a protected search endpoint suitable for Vercel Cron or another scheduler.

It must:

- validate a secret;
- process bounded work;
- avoid overlapping runs where practical;
- record partial failures;
- return a concise run summary.

## Tests

At minimum test:

- environment validation;
- search-track validation;
- Tavily response normalization using fixtures;
- URL canonicalization and fingerprint stability;
- deterministic prefilters;
- idempotent ingestion;
- evaluation-output validation;
- deterministic score adjustments;
- cron authorization;
- Telegram authorization and callback parsing;
- duplicate-notification prevention.

Mock external APIs in tests.

## Documentation

Update the README with:

- local setup;
- Supabase migration and seed instructions;
- required environment variables;
- Tavily, OpenRouter, and Telegram setup;
- local and scheduled search commands;
- webhook setup;
- deployment notes;
- known limitations.

## Process

Before coding:

1. inspect the repository;
2. summarize the current state;
3. propose the concrete architecture, package choices, database scope, and file tree;
4. identify risks and assumptions;
5. ensure the plan contains no Tailwind or separate bootstrap-only phase;
6. then implement.

After coding:

1. run formatting, linting, type checking, tests, and production build;
2. report exact results;
3. list changed files by subsystem;
4. list external setup still required;
5. identify incomplete or unverified behavior honestly.

## Exit criteria

- the agent automatically discovers real project candidates;
- duplicates are not repeatedly inserted or notified;
- promising candidates are evaluated and stored;
- strong matches can reach Telegram;
- the minimal dashboard displays stored opportunities and run status;
- all UI uses custom CSS or CSS Modules;
- Tailwind and UI frameworks are absent;
- lint, typecheck, tests, and build pass;
- no real credentials are committed;
- no application is sent automatically.
