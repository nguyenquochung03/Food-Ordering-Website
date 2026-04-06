# DATABASE_RULES.md

MongoDB + Mongoose conventions
- Use Mongoose schemas with explicit field definitions, types, default values, and `required` where applicable.
- Prefer `timestamps: true` for createdAt/updatedAt fields.

Schema design rules
- Keep documents focused: embed for 1:many small sets (e.g., item options), reference for large or growing relations (orders → user, order → items).
- Use consistent field naming: `camelCase` for keys (e.g., `createdAt`, `orderStatus`).
- Keep arrays bounded in size; avoid unbounded arrays in documents that grow indefinitely.

Indexes & query optimization
- Add indexes for fields used in filters, sorts, and lookups (e.g., `userId`, `status`, `createdAt`, `category`).
- Use compound indexes for common multi-field queries.
- Project only required fields (`select`) to reduce payload and memory.

Data validation rules
- Validate at schema level (Mongoose validators) and at application level (request validation).
- Enforce enum values for constrained fields (e.g., order statuses).

Transactions & consistency
- Use multi-document transactions for operations that must be atomic across collections (requires replica set or Atlas).
- Prefer eventual consistency for analytics counters; use background jobs for heavy aggregation.

Population & relations
- Use `populate()` sparingly; for heavy-read paths, consider denormalized fields or aggregation pipelines to reduce N+1 issues.

Backup & migrations
- Keep schema change scripts and data migrations in `migrations/` or documented steps. Test migrations on a copy of production data.
