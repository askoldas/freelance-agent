# Roadmap

## Milestone 0: Repository foundation

Goal: create a reliable TypeScript application shell.

Deliverables:

- Next.js App Router project
- strict TypeScript
- environment validation
- linting and formatting
- test framework
- structured logger
- health endpoint
- `.env.example`
- basic CI

Exit criteria:

- application starts locally;
- lint, typecheck, and tests pass;
- missing environment variables fail clearly.

## Milestone 1: Database and domain foundation

Goal: create the persistent model and source-neutral domain contracts.

Deliverables:

- Supabase migration files;
- profile, capabilities, portfolio, sources, search tracks, opportunities, evaluations, solution options, proposals, application events, and agent runs;
- indexes and constraints;
- typed repository layer;
- source adapter interfaces;
- search-result and evaluation schemas;
- example profile and search-track data without secrets.

Exit criteria:

- migrations apply cleanly to a fresh project;
- critical repositories and schemas are tested;
- ingestion identity and duplicate rules are defined.

## Milestone 2: Automatic public project search

Goal: make the agent discover available projects without manual input.

Flow:

```text
Scheduled request
→ load enabled search tracks
→ search through Tavily
→ normalize results
→ deduplicate
→ apply deterministic prefilters
→ store new candidates
```

Deliverables:

- Tavily adapter;
- configurable search tracks;
- authenticated scheduled endpoint;
- query batching and provider limits;
- source-result normalization;
- duplicate detection;
- deterministic prefilters;
- agent-run records and structured logging.

Initial search tracks:

- web applications and business platforms;
- completion or repair of existing projects;
- CMS and content systems;
- AI agents and workflow automation;
- non-AI business automation;
- APIs and integrations;
- agency subcontracting;
- technical consulting.

Exit criteria:

- searches run on schedule or through a protected manual trigger;
- real project candidates are stored;
- repeated searches do not create duplicate opportunities;
- provider failures do not corrupt run state.

## Milestone 3: AI extraction and evaluation

Goal: turn discovered candidates into useful decisions.

Deliverables:

- OpenRouter provider adapter;
- structured extraction schema and prompt;
- structured evaluation schema and prompt;
- direct, adjacent, learnable, and risky fit classification;
- deterministic score adjustments;
- one to three solution options;
- model, prompt, usage, and evaluation metadata;
- bounded evaluation batches.

Exit criteria:

- discovered projects are evaluated end to end;
- invalid model output is handled safely;
- obviously weak results do not consume unnecessary model calls;
- scores and recommendations remain explainable.

## Milestone 4: Telegram notification and control

Goal: deliver strong matches to the owner and let the owner control their status.

Deliverables:

- Telegram webhook;
- single-user authorization;
- high-value opportunity notifications;
- optional digest for medium-confidence opportunities;
- inline buttons for proposal, save, reject, details, and open source;
- prevention of repeated notifications;
- compact operational alerts for failed runs.

Exit criteria:

- qualifying opportunities arrive automatically in Telegram;
- weak and duplicate results do not create notification noise;
- callbacks update stored state correctly;
- unauthorized users cannot control the bot.

## Milestone 5: Proposal generation

Goal: create honest, tailored, reviewable proposals.

Deliverables:

- proposal prompt and schema;
- verified capability and portfolio selection;
- proposal versioning;
- Telegram actions for generate, shorten, revise approach, and discard;
- no automatic sending.

Exit criteria:

- proposals use only verified claims;
- revisions create new versions;
- the user can copy a clean final proposal from Telegram.

## Milestone 6: Manual submission fallback

Goal: support opportunities the automatic collectors did not find.

Deliverables:

- Telegram command or message flow for pasted project text;
- safe public-URL submission where practical;
- reuse of the same normalization, deduplication, evaluation, and proposal pipeline;
- useful fallback for inaccessible listing content.

Exit criteria:

- manual input does not create a separate parallel architecture;
- duplicate manual and automatic discoveries resolve to one opportunity.

## Milestone 7: Application tracking and follow-ups

Goal: manage the opportunity pipeline.

Deliverables:

- status commands and buttons;
- application-event history;
- follow-up dates;
- reminder job;
- contextual follow-up drafts;
- won/lost notes.

Exit criteria:

- each opportunity has a visible history;
- reminders are idempotent;
- follow-ups remain reviewable.

## Milestone 8: Alert-email collector

Goal: add projects from services that deliver results to the user's inbox.

Deliverables:

- Google OAuth setup;
- restricted label or query-based ingestion;
- source-specific parsers where useful;
- generic structured fallback parser;
- deduplication with opportunities from public search.

Exit criteria:

- only configured messages are read;
- processed message identity is stored;
- repeated polling does not duplicate opportunities.

## Milestone 9: Minimal dashboard

Goal: provide a better overview after the Telegram workflows have been tested with real opportunities.

Possible features:

- opportunity pipeline;
- filtering and search;
- detail and evaluation views;
- proposal editor;
- profile, capability, portfolio, source, and search-track settings;
- run history and errors.

## Future options

- additional supported source adapters;
- browser helper for sending the current listing to the agent;
- employer/job-agent mode;
- proactive company lead discovery;
- contact enrichment;
- pricing assistant;
- evaluation calibration from accepted and rejected decisions;
- dedicated worker queue.

## Explicitly deferred

- autonomous application submission;
- automatic pricing commitments;
- multi-user SaaS features;
- building a dashboard before the search and Telegram flows are validated.
