# Codex Task 01: Bootstrap the application

Read `AGENTS.md`, `README.md`, `docs/PROJECT.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/ROADMAP.md`, and `docs/CODEX_WORKFLOW.md` before making changes.

## Goal

Create the reliable TypeScript application foundation for Freelance Agent.

This milestone does not implement project search, Supabase tables, OpenRouter calls, Telegram behavior, or a dashboard. It creates the shell those features will use.

## Required implementation

Create a current stable Next.js App Router application with:

- TypeScript in strict mode;
- `src/` directory layout;
- server-side route handlers;
- ESLint;
- Prettier or an equivalent consistent formatter;
- Vitest for unit tests;
- Zod-based environment validation;
- structured server-side logging;
- a health endpoint;
- `.env.example`;
- GitHub Actions CI for install, lint, typecheck, and tests;
- package scripts for development and all validation commands.

## Architecture requirements

Create initial directories that reflect the documented boundaries, without filling them with speculative implementations:

- `src/config`
- `src/domain`
- `src/use-cases`
- `src/services`
- `src/prompts`
- `src/lib`
- `supabase/migrations`
- `tests`

Keep route handlers thin.

## Environment validation

Create a server-only environment schema that can eventually support:

- Supabase URL and service-role key;
- Tavily API key;
- OpenRouter API key and model names;
- Telegram bot token, webhook secret, and authorized user IDs;
- cron secret;
- application base URL.

Not every variable must be required during the bootstrap milestone. Separate variables required to start the basic application from variables required by later integrations. The health endpoint must work before third-party credentials are configured.

Never expose server secrets through `NEXT_PUBLIC_` variables.

## Health endpoint

Add `GET /api/health` returning a small JSON response with:

- status;
- application name;
- current timestamp;
- environment name or mode.

Do not expose configuration values or secrets.

## Logging

Create a small structured logger abstraction suitable for server routes and future background jobs. It should support context fields and error serialization without logging secret-bearing request headers.

Do not add a heavy observability platform in this milestone.

## Tests

At minimum test:

- environment parsing for valid minimal configuration;
- clear failure for invalid values;
- health response construction if logic is separated from the route;
- any logger redaction utility introduced.

## CI

Add a GitHub Actions workflow triggered for pushes and pull requests. It should use the repository lockfile and run:

1. install;
2. formatting check if configured;
3. lint;
4. typecheck;
5. tests.

## Documentation

Update `README.md` with:

- local installation;
- development command;
- validation commands;
- environment-file setup;
- current milestone status.

Do not replace the existing product overview.

## Process

Before coding:

1. inspect the repository;
2. summarize the current state;
3. propose the exact package choices and file tree;
4. identify assumptions;
5. then implement.

After coding, run all validation commands and report their exact results.

## Exit criteria

- the application starts locally;
- `/api/health` works;
- strict type checking passes;
- formatting and linting pass;
- tests pass;
- CI configuration is present;
- no real credentials or generated build artifacts are committed;
- no project-search or AI features are prematurely implemented.
