# Codex Task 03: Automatic project search

Run this task only after Tasks 01 and 02 pass.

Read `AGENTS.md`, `docs/PROJECT.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md` first.

## Goal

Implement the first real agent behavior: automatically search for available projects, normalize results, remove duplicates, apply inexpensive prefilters, and store new candidates.

This task must not depend on the user manually sending each project to Telegram.

## Required work

### Search-provider abstraction

Create a provider-neutral search interface supporting:

- query text;
- optional included and excluded domains;
- result limits;
- language and region hints where supported;
- normalized provider errors;
- timeout and bounded retries.

Implement Tavily as the first adapter.

### Search tracks

Load enabled search tracks from the database. Each track should support:

- name;
- category;
- one or more queries;
- optional domain filters;
- result limit;
- prefilter threshold;
- enabled state;
- run metadata.

Provide initial tracks for:

- web applications and business platforms;
- existing-project completion and repair;
- CMS and content systems;
- AI agents and workflow automation;
- non-AI business automation;
- APIs and integrations;
- agency subcontracting;
- technical consulting.

Queries must combine business outcomes and project-request language. Do not search only for framework names.

### Scheduled search use case

Implement a `runProjectSearch` use case that:

1. loads enabled tracks;
2. runs bounded queries;
3. normalizes provider results;
4. canonicalizes URLs;
5. computes duplicate keys and fingerprints;
6. applies deterministic prefilters;
7. stores new candidates idempotently;
8. records an agent run with counts and redacted errors.

### Protected trigger

Add a protected scheduled endpoint such as `GET` or `POST /api/cron/search`.

It must validate a cron secret, avoid accidental overlapping runs where practical, and return a concise run summary.

Do not add Telegram notifications or AI evaluation in this task.

### Prefilters

Implement explainable, low-cost prefilters for signals such as:

- project-request or hiring intent;
- relevant project category;
- excluded employment-only or irrelevant content where clearly detectable;
- obvious spam or empty pages;
- result freshness when metadata is available;
- duplicate identity.

Do not reject uncertain but potentially useful projects solely because a technology keyword is absent.

### Cost and reliability

- keep query and result counts bounded;
- do not call AI in this milestone;
- record provider usage metadata when available;
- handle partial provider failure without losing successful results;
- ensure repeated scheduled runs do not repeatedly insert the same project.

## Tests

Test:

- Tavily response normalization with fixtures;
- search-track expansion;
- deterministic prefilters;
- duplicate handling;
- scheduled-endpoint authorization;
- idempotent repeated runs;
- partial provider errors.

Mock external requests in unit tests.

## Documentation

Document:

- required Tavily environment variables;
- how to run a search locally;
- how to configure search tracks;
- how scheduling is intended to work in deployment;
- known limits of public web search.

## Exit criteria

- a protected trigger discovers real project candidates automatically;
- results are normalized and stored;
- duplicates are not reinserted;
- run history is recorded;
- no manual opportunity input is required;
- no AI or Telegram layer is prematurely added;
- lint, typecheck, and tests pass.
