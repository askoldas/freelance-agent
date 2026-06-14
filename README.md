# Freelance Agent

A personal project-acquisition agent that discovers, evaluates, and helps respond to freelance development and automation opportunities.

The system is intentionally broader than a single technology stack. It searches for business problems the owner can reasonably solve, evaluates delivery feasibility, suggests suitable technical approaches, and prepares honest, tailored proposals.

## Initial product goal

The first working version must support this flow:

1. The user sends a project description or URL to a Telegram bot.
2. The application extracts and normalizes the opportunity.
3. An AI evaluator scores fit, risk, learning effort, and commercial value.
4. The application suggests one or more plausible solution approaches.
5. The result is stored in Supabase.
6. Telegram returns a concise summary with actions.
7. The user can request a tailored proposal.

Automatic marketplace login, scraping, messaging, and application submission are not part of the initial milestone.

## Planned stack

- Next.js with TypeScript
- Supabase/PostgreSQL
- Telegram Bot API
- OpenRouter for AI models
- Tavily for public web search
- Zod for runtime validation
- Vercel or another Node-compatible host

n8n is not part of the core architecture.

## Documentation

- [Product definition](docs/PROJECT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Roadmap](docs/ROADMAP.md)
- [Codex workflow](docs/CODEX_WORKFLOW.md)
- [Codex task prompts](codex/)

## Development status

The repository currently contains the product and implementation specification. Start with `codex/01-bootstrap.md` and complete tasks in numerical order.

## Core product rule

Search broadly, evaluate carefully, and never claim experience the user does not have.
