# Professional Profile Integration Instructions

## Goal

Use `data/professional-profile.json` as the human-reviewed source of truth for proposals, cover letters, CVs, bios and platform-profile text.

Do not infer or invent professional claims outside this file.

## Add the file

Copy `professional-profile.json` to:

```text
data/professional-profile.json
```

## Validation and status rules

Create a Zod schema covering the complete document.

Use only these record statuses:

- `approved`
- `needs_review`
- `private`

Rules:

- `approved` may be used in public generated documents.
- `needs_review` may be stored and shown internally but must not be used publicly.
- `private` may be used only for internal matching and must never appear in public text.

Keep record approval separate from project lifecycle:

- `status` = approval state
- `projectStatus` = implemented, deployed, active development, etc.

## Scripts

Add:

```json
{
  "scripts": {
    "profile:validate": "tsx scripts/validate-professional-profile.ts",
    "profile:import": "tsx scripts/import-professional-profile.ts"
  }
}
```

`profile:validate` must not require Supabase.

`profile:import` must validate and idempotently upsert the records into Supabase. It must preserve opportunities, evaluations and agent runs.

## Database model

Reuse current tables where practical. Add new migrations for missing entities such as:

- experience entries
- overall experience
- technologies
- cases or portfolio items
- education entries
- languages
- proposal preferences
- generated documents
- document claims

Do not edit already-applied migrations.

## Relevance selection

Before generating a document:

1. classify the opportunity;
2. select only relevant approved capabilities;
3. select relevant technologies;
4. select one or two relevant cases;
5. select matching experience entries;
6. select approved overall-experience claims;
7. exclude unrelated records.

Examples:

- WordPress work: use CMS/ecommerce experience, the 15+ project claim, and WordPress/PrestaShop/Shopify background.
- Automation work: use the medical-holding automation, Airtable workflow, Freelance Agent and process-design experience.
- Next.js work: use iLab, Riga iLab, Freelance Agent and recent React/Next.js experience.
- Operations work: use Nets, Create and Scribe, Baltictex and process-improvement experience.

## Claim safety

Generated public text may use only `approved` records.

The iLab traffic-growth claim is currently `needs_review`; exclude it from public output until evidence source and comparison period are completed and the status is changed to `approved`.

Allowed:

```text
Around 20 years of web-development experience.
```

Forbidden:

```text
20 years of Next.js experience.
```

## Proposal generation

- Start with the client's actual problem.
- Stay concise by default.
- Use no more than two relevant cases.
- Mention only relevant technologies.
- Include one useful clarification question.
- Avoid generic claims.
- Never send automatically.

## Confidential work

For the Latvian medical holding:

- public wording may mention only the client type;
- do not expose the client name;
- use the proposal-safe summary;
- project status is `implemented`.

## Tests

Add tests confirming:

- invalid profile data fails validation;
- only approved claims are used publicly;
- needs-review and private claims are excluded;
- irrelevant cases are excluded;
- no more than two cases are selected for proposals;
- broad experience is not misapplied to a specific technology;
- repeated imports remain idempotent.

## Codex task prompt

```text
Read AGENTS.md and the professional-profile integration instructions.

Implement the professional-profile knowledge base using data/professional-profile.json as the human-reviewed source of truth.

Do not rewrite or invent the content of the dataset.

Before coding:
1. inspect the existing schema and proposal/evaluation pipeline;
2. propose the required migration and data model;
3. explain which existing tables can be reused;
4. show how relevance selection and claim safety will work;
5. wait for approval.

After approval:
- add Zod validation;
- add profile:validate and profile:import scripts;
- add new migrations only;
- implement idempotent import;
- add relevance selection;
- ensure only approved data is used in public documents;
- add tests;
- document the workflow.
```
