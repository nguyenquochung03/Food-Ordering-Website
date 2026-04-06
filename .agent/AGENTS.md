# AGENTS.md

Purpose: central coordination for AI agents working on this repository. This file describes how agents should behave, communicate, and consult the other rule files in this folder.

How to use
- Read this file first, then the domain-specific rule files listed below.
- Treat the rule files as authoritative project policy for code style, APIs, DB, and security.

Rule files (reference)
- `PROJECT_CONTEXT.md` — business domain, actors, flows
- `BACKEND_RULES.md` — server-side conventions
- `FRONTEND_RULES.md` — UI and React conventions
- `DATABASE_RULES.md` — MongoDB / Mongoose rules
- `API_RULES.md` — REST design and response rules

Coding principles
- Keep changes minimal and reversible: small PRs, explicit migrations.
- Prefer readability and explicitness over clever shortcuts.
- Follow single responsibility: functions, components, controllers.
- Add tests for non-trivial logic and edge cases.

Communication style
- Use concise, direct language in commits and PRs.
- Include motivation, scope, and rollback plan in PR descriptions.
- When suggesting changes, include exact file paths and short code snippets.

Safety constraints
- Never hard-code secrets or credentials in code or docs.
- Avoid generating production credentials or deployment steps that expose secrets.
- Do not modify files outside the project workspace without explicit user approval.

Agent behavior rules
- Validate assumptions before modifying files (check file existence and project structure).
- When uncertain, propose options and ask for confirmation.
- When making code edits, reference the specific rule file(s) that motivated the change.

How to read the other rule files
- Use `PROJECT_CONTEXT.md` to understand the business flows and actors.
- Use `API_RULES.md` when creating or changing endpoints.
- Use `DATABASE_RULES.md` for schema changes and indexing.
- Use `BACKEND_RULES.md` and `FRONTEND_RULES.md` for style, structure, and security.
