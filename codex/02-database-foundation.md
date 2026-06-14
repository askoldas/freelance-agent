# Codex Task 02: Database and domain foundation

Run this task only after Task 01 passes.

Read `AGENTS.md`, `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md` first.

## Goal

Implement the database model and domain contracts required for automatic discovery, evaluation, notifications, and proposals.

Do not implement search-provider calls, AI evaluation, Telegram notifications, or a dashboard yet.

## Required work

Create versioned Supabase SQL migrations for:

- candidate profiles;
- capabilities;
- portfolio items;
- sources;
- search tracks;
- opportunities;
- evaluations;
- solution options;
- proposals;
- application events;
- agent runs.

Follow `docs/DATA_MODEL.md`. Add foreign keys, constraints, timestamps, useful indexes, and uniqueness rules for idempotent ingestion.

Create Zod schemas and TypeScript types for:

- source results;
- search tracks;
- normalized opportunities;
- evaluations;
- solution options;
- proposals;
- agent runs.

Create focused repository interfaces and Supabase implementations for:

- search tracks;
- opportunities;
- evaluations;
- profile, capabilities, and portfolio;
- agent runs.

The opportunity repository must support idempotent ingestion based on source identity, canonical URL, and content fingerprint.

Implement deterministic utilities for:

- URL canonicalization;
- title and source-identifier normalization;
- content fingerprint generation;
- stable duplicate keys.

Add safe example seed data for one candidate profile, representative capabilities, and initial search tracks. Do not invent portfolio results.

## Tests

Test:

- schema validation;
- URL canonicalization;
- fingerprint stability;
- duplicate-key behavior;
- idempotent opportunity ingestion;
- search-track validation.

Document any integration-test requirements that need a local Supabase instance.

## Documentation

Document migration commands, local Supabase setup, seed usage, and any justified deviation from `docs/DATA_MODEL.md`.

## Exit criteria

- migrations apply to a fresh database;
- schemas compile and are tested;
- idempotent opportunity ingestion works;
- repository boundaries are clear;
- lint, typecheck, and tests pass.
