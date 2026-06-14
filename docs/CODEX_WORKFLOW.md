# Codex Workflow

Use Codex in small, reviewable milestones. Do not ask it to build the entire agent in one task.

## Working method

For each milestone:

1. Open the repository in VS Code or Codex.
2. Give Codex the matching prompt from `codex/`.
3. Require it to inspect `AGENTS.md` and all referenced documentation first.
4. Let it propose a plan before editing code.
5. Review the plan for scope drift.
6. Let it implement the milestone.
7. Require formatting, linting, type checking, and tests.
8. Review the diff before accepting or merging changes.
9. Update documentation when implementation decisions differ from the current design.

## Branch strategy

Use one branch per milestone:

- `feat/bootstrap`
- `feat/database-foundation`
- `feat/project-search`
- `feat/ai-evaluation`
- `feat/telegram-notifications`
- `feat/proposal-generation`

Prefer a pull request for each milestone. Keep commits focused and avoid mixing product changes with unrelated refactors.

## Codex response contract

Each task should end with:

- summary of implemented behavior;
- changed files grouped by subsystem;
- commands run;
- lint, typecheck, and test results;
- environment variables added;
- database or external-service setup required;
- known limitations;
- recommended next milestone.

## Rules for corrections

When the implementation exposes a flawed assumption:

1. do not silently work around it;
2. explain the conflict;
3. update the relevant architecture or product documentation;
4. keep the milestone focused;
5. avoid introducing an unrelated framework or service merely to solve a small problem.

## Environment and secrets

Codex may create `.env.example`, but real keys must be added manually to `.env.local` or the deployment platform.

Expected services over the first milestones:

- Supabase
- Tavily
- OpenRouter
- Telegram
- Vercel or another scheduler/host

No secret may be committed.

## Review priorities

Review every milestone for:

- whether automatic project discovery remains the primary flow;
- whether source adapters are replaceable;
- whether model output is validated;
- whether obvious duplicates and irrelevant results are filtered before expensive AI calls;
- whether Telegram remains a notification and control layer rather than the discovery engine;
- whether professional claims remain verified and honest;
- whether any outbound action still requires user approval.

## Prompt order

Run prompts in numerical order. Do not begin the next prompt until the previous milestone passes its exit criteria.
