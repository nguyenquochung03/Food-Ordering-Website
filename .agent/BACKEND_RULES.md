# BACKEND_RULES.md

Node.js + Express conventions
- Keep `controllers/` thin: handle request/response and delegate business logic to `services/` (create `services/` when logic grows).
- Keep `routes/` for route definitions and validation middleware only.
- Prefer explicit exports and named functions for easier testing.

Controller-service pattern
- Controller: parse input, call service, return standardized response.
- Service: pure-ish functions for business logic and DB access; raise errors with typed shapes.
- Data-access (models): use Mongoose models only in service layer (avoid DB calls in controllers).

Error handling
- Use centralized error handler middleware: map thrown errors to HTTP status codes and consistent JSON shape.
- Throw or pass Error objects with `status` and `code` fields (e.g., `error.status = 400`).
- For validation errors respond 400, unauthorized 401, forbidden 403, not found 404, server errors 500.

Middleware usage
- Use middleware for: auth, role-based authorization, request validation, rate limiting, CORS, file uploads.
- Validate inputs at route-level using a validation library (Joi/Zod/express-validator). Return early on invalid input.

Security rules
- Authentication: JWT in `Authorization: Bearer <token>` header. Validate token and attach user to `req.user`.
- Passwords: always hash with bcrypt (salt rounds >= 10) and never log raw passwords.
- Sanitize user input before DB writes; validate file uploads (types and size) and store outside webroot if possible.
- Protect admin routes with role check middleware (e.g., `requireRole('Admin')`).
- Use HTTPS in production and set secure cookie flags when using cookies.
- Implement basic rate limiting on auth endpoints.

Logging & monitoring
- Log errors with context (user id, route, payload summary) but never log secrets.
- Use structured logs where possible and include correlation/request id for tracing.

Testing
- Unit test services and important controller flows. Use Supertest for integration tests on routes.
