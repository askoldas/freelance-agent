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

## Milestone 1: Database foundation

Goal: create the persistent domain model.

Deliverables:

- Supabase migration files;
- tables for profile, capabilities, portfolio, sources, opportunities, evaluations, solution options, proposals, application events, and agent runs;
- indexes and constraints;
- typed repository layer;
- seed/example profile data that contains no secrets.

Exit criteria:

- migrations apply cleanly to a fresh Supabase project;
- repository tests cover critical reads, writes, and idempotent ingestion.

## Milestone 2: Manual Telegram analysis

Goal: complete the first useful vertical slice.

Flow:

```text
Telegram text or public URL
→ authorize user
→ extract project facts
→ normalize and deduplicate
→ store opportunity
→ evaluate fit
→ suggest solution options
→ send Telegram summary
```

Deliverables:

- Telegram webhook;
- single-user authorization;
- text and safe public-URL ingestion;
- OpenRouter structured extraction and evaluation;
- deterministic score adjustments;
- Telegram result formatting;
- inline buttons for proposal, save, reject, and details.

Exit criteria:

- real project text can be analyzed end to end;
- duplicate submissions do not create duplicate records;
- invalid AI output is handled safely;
- login-protected URLs produce a useful fallback message.

## Milestone 3: Proposal generation

Goal: create honest, tailored, reviewable proposals.

Deliverables:

- proposal prompt and schema;
- capability and portfolio selection;
- proposal versioning;
- Telegram actions for generate, shorten, revise approach, and discard;
- no automatic sending.

Exit criteria:

- proposals use only verified profile and portfolio claims;
- revisions create new versions;
- the user can copy a clean final proposal from Telegram.

## Milestone 4: Public search collector

Goal: discover opportunities without manual input.

Deliverables:

- Tavily adapter;
- configurable search tracks;
- scheduled authenticated search endpoint;
- result normalization and deduplication;
- preliminary filtering;
- bounded batch evaluation;
- Telegram notification for qualifying opportunities.

Search tracks:

- web applications and business platforms;
- existing application completion and repair;
- CMS and content systems;
- AI agents and workflow automation;
- non-AI business automation;
- APIs and integrations;
- agency subcontracting;
- technical consulting.

Exit criteria:

- searches run on schedule;
- repeated results are not repeatedly announced;
- provider failure does not corrupt run state;
- low-quality results are filtered or clearly scored.

## Milestone 5: Application tracking and follow-ups

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
- follow-ups remain reviewable and are never sent automatically.

## Milestone 6: Gmail alert collector

Goal: process authenticated-platform alerts without marketplace scraping.

Deliverables:

- Google OAuth setup;
- restricted Gmail queries or label-based ingestion;
- sender-specific parsers where useful;
- generic AI fallback parser;
- deduplication with opportunities from other sources.

Exit criteria:

- only configured messages are read;
- processed email identity is stored;
- repeated polling does not duplicate opportunities.

## Milestone 7: Minimal dashboard

Goal: provide a better overview once real usage clarifies requirements.

Possible features:

- opportunity pipeline;
- filtering and search;
- detail and evaluation views;
- proposal editor;
- profile, capability, portfolio, and search-track settings;
- run history and errors.

Do not build this milestone before the Telegram workflows have been used with real opportunities.

## Future options

- browser extension to send the current authenticated listing to the agent;
- official marketplace APIs where permitted;
- employer/job-agent mode;
- proactive company lead discovery;
- contact enrichment;
- pricing assistant;
- evaluation calibration from accepted/rejected decisions;
- dedicated worker queue.

## Explicitly deferred

- automatic application submission;
- stealth browser automation;
- CAPTCHA bypass;
- storing marketplace passwords;
- mass outreach;
- autonomous price commitments;
- multi-user SaaS features.
