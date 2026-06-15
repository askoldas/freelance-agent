# Freelance Agent

A personal project-acquisition agent that searches for, evaluates, stores, and helps review freelance development and automation opportunities.

The primary flow is automatic discovery. Manual Telegram submission is intentionally secondary and is not implemented in this first working slice.

## What This Version Does

- Runs protected scheduled or manual searches through Tavily.
- Normalizes and deduplicates discovered results.
- Applies deterministic prefilters before spending AI tokens.
- Uses OpenRouter for structured extraction and evaluation.
- Stores opportunities, evaluations, solution options, run history, and notification state in Supabase/PostgreSQL.
- Sends strong matches to Telegram with save, reject, details, and proposal-placeholder actions.
- Provides a minimal private operational dashboard.
- Uses custom CSS, CSS custom properties, and CSS Modules only.

No applications or outreach are sent automatically.

## Stack

- Next.js App Router
- TypeScript with strict checking
- Supabase/PostgreSQL
- Tavily search
- OpenRouter AI models
- Telegram Bot API
- Zod
- Vitest
- Custom CSS only

Tailwind and UI frameworks are not used.

## Local Setup

Install dependencies:

```bash
npm install
```

Create local environment values:

```bash
cp .env.example .env.local
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/?secret=YOUR_DASHBOARD_SECRET
```

## Environment Variables

Required for the full search/evaluation/notification flow:

```text
APP_BASE_URL
CRON_SECRET
DASHBOARD_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TAVILY_API_KEY
OPENROUTER_API_KEY
OPENROUTER_MODEL
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
TELEGRAM_ALLOWED_USER_IDS
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- `TELEGRAM_ALLOWED_USER_IDS` is a comma-separated list of numeric Telegram user IDs.
- `OPENROUTER_MODEL` should be a model that reliably returns structured JSON.
- Real secrets must never be committed.

## Supabase Setup

Create a Supabase project, then apply migrations in order from:

```text
supabase/migrations/
```

The current migrations create:

- candidate profile
- capabilities
- sources
- search tracks
- opportunities
- evaluations
- solution options
- agent runs
- notification state

The seed migration includes replaceable example profile/capability data. Replace it with verified owner-specific wording before using generated proposal text in a future milestone.

## Professional Profile Knowledge Base

The editable source of truth for professional background is:

```text
data/professional-profile.json
```

Do not duplicate or rewrite those professional facts in prompts, migrations, or source code. To update a professional fact, edit the JSON, validate it, then import it.

Validate without Supabase credentials:

```bash
npm run profile:validate
```

After applying migrations, import into Supabase:

```bash
npm run profile:import
```

Apply the profile migration before import:

```bash
supabase db push
```

Or apply the SQL file manually:

```text
supabase/migrations/0005_professional_profile_knowledge_base.sql
```

Profile record statuses:

- `approved`: may be used in public generated documents.
- `needs_review`: may be stored and used internally, but not in public generated documents.
- `private`: internal matching only; never public text.

Project lifecycle status is separate and stored as `projectStatus` in the JSON.

Generated public documents must use only traceable approved claims. Every factual claim should reference a source record in `generated_document_claims`. Broad claims must stay broad: “Around 20 years of web-development experience” is allowed, but technology-specific inflation such as “20 years of Next.js experience” is forbidden.

For confidential work, use only the `proposalSafeSummary`; do not expose client names or internal implementation details.

Relevance selection uses a compact subset of the profile for each opportunity:

- relevant approved capabilities;
- relevant approved technologies;
- relevant approved overall-experience claims;
- matching experience entries;
- no more than two matching cases by default;
- education or language details only when useful.

## Tavily Setup

Create a Tavily API key and set:

```text
TAVILY_API_KEY
```

Search tracks are seeded in the database and can be edited there. Queries intentionally combine business-problem language with technology terms.

## OpenRouter Setup

Create an OpenRouter API key and set:

```text
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

The agent separates factual extraction from evaluation and validates both responses with Zod.

## Telegram Setup

Create a Telegram bot with BotFather and set:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
TELEGRAM_ALLOWED_USER_IDS
```

Configure the webhook:

```text
https://YOUR_DOMAIN/api/telegram/webhook
```

Use Telegram's `secret_token` webhook option with the same value as `TELEGRAM_WEBHOOK_SECRET`.

Telegram actions:

- Save
- Reject
- Details
- Proposal placeholder

Proposal generation is not implemented in this slice.

## Running Search

Scheduled endpoint:

```text
POST /api/cron/search
Authorization: Bearer YOUR_CRON_SECRET
```

Alternative headers/query supported:

```text
x-cron-secret: YOUR_CRON_SECRET
/api/cron/search?secret=YOUR_CRON_SECRET
```

The dashboard also includes a protected server-side "Run search" action when `DASHBOARD_SECRET` is configured.

## Dashboard

The dashboard is private by shared secret for this single-user MVP:

```text
/?secret=YOUR_DASHBOARD_SECRET
```

It shows:

- recent opportunities
- score, recommendation, category, fit, source, and discovery time
- evaluation summary
- recent search-run status
- protected manual search trigger

## Verification

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run format:check
npm run build
npm audit
```

## Deployment Notes

- Deploy to a Node-compatible host such as Vercel.
- Add all environment variables in the deployment platform.
- Configure a scheduled job to call `/api/cron/search` with `CRON_SECRET`.
- Keep Supabase service-role credentials server-only.
- Keep Telegram restricted to configured user IDs.

## Known Limitations

- Manual Telegram opportunity submission is acknowledged but not implemented.
- Proposal generation is a placeholder action.
- Dashboard authentication is a shared-secret MVP guard, not a full auth system.
- No live external API calls are made in tests.
- Migrations are provided, but applying them requires a configured Supabase project.
