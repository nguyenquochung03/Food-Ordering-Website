# API_RULES.md

REST API design conventions
- Resource-oriented endpoints using plural nouns: `/users`, `/orders`, `/foods`, `/delivery-staff`.
- Use HTTP verbs: `GET` (read), `POST` (create), `PUT`/`PATCH` (update), `DELETE` (remove).
- Keep routes predictable and idempotent where appropriate.

Endpoint naming and structure
- Nested resources only when natural: `/users/:userId/orders` for a user's orders.
- Use query parameters for filtering, sorting, and pagination: e.g., `/foods?category=salad&limit=20&page=2&sort=-price`.

Response format standard
- Use a consistent JSON envelope:
  - `success` (boolean)
  - `data` (object | array | null)
  - `message` (string | null) — short human message
  - `errors` (object | null) — validation or field errors

Example
```
{ "success": true, "data": { ... }, "message": null, "errors": null }
```

Error response structure
- Use appropriate HTTP status codes (400, 401, 403, 404, 422, 500).
- Return machine-readable errors in `errors` with keys per field when validation fails.

Authentication & authorization
- Use `Authorization: Bearer <token>` header for JWTs.
- Protect sensitive endpoints with role checks and return `403` for unauthorized roles.

Pagination & limits
- Use `limit` and `page` (or cursor-based `after`) parameters for lists.
- Return pagination metadata (total, page, limit) in responses when applicable.

Rate limiting & abuse prevention
- Apply rate limits on auth endpoints and write-heavy endpoints.

Versioning
- Version APIs by prefixing with `/api/v1/` for breaking changes; maintain backward compatibility where possible.

Documentation
- Keep API docs updated (OpenAPI / Swagger) and include examples for success and error responses.
