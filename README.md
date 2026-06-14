# Freelance Agent

A personal project-acquisition agent that searches for, evaluates, and helps respond to freelance development and automation opportunities.

The system is intentionally broader than a single technology stack. It searches for business problems the owner can reasonably solve, evaluates delivery feasibility, suggests suitable technical approaches, and prepares honest, tailored proposals.

## Initial product goal

The first useful version must support this primary flow:

1. A scheduled collector searches configured project sources.
2. Results are normalized and deduplicated.
3. An AI evaluator scores fit, risk, learning effort, and commercial value.
4. The application suggests one or more plausible solution approaches.
5. Qualified opportunities are stored in Supabase.
6. Telegram sends concise notifications with review actions.
7. The user can request a tailored proposal.

Manual project submission through Telegram is a secondary fallback and testing tool, not the main product flow.

## Planned stack

- Next.js with TypeScript
- Supabase/PostgreSQL
- Telegram Bot API
- OpenRouter for AI models
- Tavily for initial public web search
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
