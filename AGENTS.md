# AGENTS.md

## Project purpose

This repository contains a personal Project Acquisition Agent. It discovers, evaluates, stores, and helps respond to freelance software-development, integration, CMS, AI-agent, and business-automation opportunities.

The product is not a narrow Next.js/Firebase job finder. It must search broadly for business problems the owner can solve and then recommend an appropriate implementation approach.

## Owner positioning

The owner is a full-stack developer and AI automation specialist focused on practical business solutions.

Strong and preferred areas include:

- Next.js, React, JavaScript, and TypeScript
- web applications and multilingual websites
- Firebase, Firestore, Supabase, PostgreSQL, and serverless backends
- Payload CMS, WordPress, headless CMS solutions, and custom admin interfaces
- authentication, payment flows, account areas, dashboards, and third-party APIs
- n8n and custom Node.js automation
- Telegram bots, Gmail/Outlook workflows, webhooks, and scheduled processes
- AI-assisted lead research, document processing, report generation, sales workflows, and internal assistants
- taking over, repairing, completing, or extending existing applications

These are preferred tools and capabilities, not mandatory project filters.

## Product principles

1. Search broadly, evaluate carefully.
2. Automatic project discovery is the core product behavior.
3. Manual project submission is a secondary fallback and testing path.
4. Evaluate the business problem before recommending technology.
5. Do not force Next.js, Firebase, Supabase, Payload, or any other stack into every project.
6. Distinguish direct fit, adjacent fit, learnable fit, and risky fit.
7. Never invent skills, clients, portfolio results, certifications, or experience.
8. Be transparent when a requested technology is unfamiliar but adjacent.
9. Prefer projects that can be delivered independently and responsibly.
10. Penalize vague, unpaid, suspicious, commission-only, or unrealistic opportunities.
11. Keep all outbound communication reviewable by the user.
12. Never automatically submit an application or send outreach without explicit user approval.

## Current implementation scope

The first useful product milestone is an automatic search-and-notification vertical slice:

1. Run scheduled searches across configured public project sources.
2. Normalize and deduplicate discovered results.
3. Apply low-cost deterministic prefilters.
4. Extract and classify project details.
5. Evaluate fit, delivery risk, learning effort, and commercial value.
6. Suggest plausible technical approaches.
7. Store the opportunity and evaluation in Supabase.
8. Notify the owner in Telegram only when an opportunity passes the configured threshold.
9. Generate a proposal only when the owner requests it.

A manual Telegram command for submitting project text or a URL may be implemented as a secondary diagnostic and fallback path. It must not replace automatic discovery.

Do not implement automatic application submission during this milestone.

## Technical direction

- Use Next.js App Router and TypeScript unless the repository already contains a clearly documented alternative.
- Enable strict TypeScript settings.
- Use Zod at every external boundary: environment variables, Telegram payloads, AI outputs, source results, and API inputs.
- Keep AI calls behind provider-independent service interfaces.
- Keep Telegram, Tavily, OpenRouter, Supabase, and future source integrations in separate adapters.
- Keep domain logic independent from framework route handlers.
- Use Supabase/PostgreSQL for persistence.
- Use SQL migrations stored in the repository.
- Make discovery and ingestion idempotent.
- Use structured logging and include correlation IDs where useful.
- Never log secrets, authorization headers, raw credentials, or sensitive session data.

## Architecture boundaries

Prefer these layers:

- `domain`: entities, schemas, scoring rules, and use cases
- `services`: AI, search, Telegram, database, and other external adapters
- `app/api`: thin HTTP handlers, webhooks, and scheduled endpoints
- `db`: migrations and repository implementations
- `prompts`: versioned prompt templates

Route handlers must not contain large prompts, SQL strings, or core scoring logic.

## AI requirements

- Request structured JSON output.
- Validate every AI response with Zod.
- Retry only a limited number of times after invalid output.
- Store prompt version, model identifier, token usage when available, and evaluation timestamp.
- Separate factual extraction from subjective evaluation where practical.
- Do not treat AI-generated scores as unquestionable truth.
- Keep deterministic eligibility and safety rules in code.
- Avoid spending model tokens on obvious duplicates or clearly irrelevant results.

## Evaluation categories

Each opportunity should be assessed for:

- business-problem fit
- direct skill fit
- adjacent and transferable skill fit
- learning effort
- delivery and deadline risk
- budget or compensation quality
- client credibility signals
- scope clarity
- strategic or portfolio value
- recommended action

The total score is 0–100, but the explanation matters more than the number.

## Opportunity categories

Use one primary category and optional secondary categories:

- `web_build`
- `existing_project`
- `automation`
- `ai_agent`
- `integration`
- `cms`
- `backend`
- `frontend`
- `maintenance`
- `consulting`
- `other`

## Search tracks

The initial source configuration should support separate search tracks for:

- web applications and business platforms
- completion or repair of existing projects
- CMS and content systems
- AI agents and workflow automation
- non-AI business-process automation
- APIs and integrations
- agency subcontracting
- technical consulting

Search queries should combine business outcomes, project-request language, and selected technology keywords. Do not search only for framework names.

## Security rules

- Never hardcode secrets.
- Never expose Supabase service-role credentials to client-side code.
- Verify Telegram webhook secrets.
- Restrict bot usage to configured Telegram user IDs.
- Validate scheduled requests with a shared secret or platform-native verification.
- Keep `.env.example` free of real values.
- Do not commit session files, cookies, OAuth tokens, or downloaded private data.

## Testing requirements

At minimum, add tests for:

- environment validation
- search result normalization
- opportunity normalization
- duplicate fingerprint generation
- search-track configuration validation
- deterministic prefilters and score adjustments
- AI output schema validation
- Telegram callback parsing
- authorization checks
- scheduled endpoint authorization and idempotency

Do not mark a milestone complete while type checking or tests fail.

## Working style for Codex

Before implementation:

1. Inspect the repository and relevant documentation.
2. Summarize the current state.
3. State assumptions and risks.
4. Propose a focused implementation plan.
5. Implement only the requested milestone.

After implementation:

1. Run formatting, linting, type checking, and tests.
2. Report what changed by file or subsystem.
3. Report commands run and their results.
4. List required manual setup.
5. Clearly identify anything incomplete or unverified.

Avoid unrelated refactors and speculative features.
