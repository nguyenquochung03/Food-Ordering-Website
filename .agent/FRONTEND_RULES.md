# FRONTEND_RULES.md

React + Vite guidelines
- Use functional components and hooks; prefer small reusable components.
- Co-locate component styles and tests with components when practical.

Component structure
- Use `components/` for reusable UI bits, `pages/` (or `views/`) for route-level screens.
- Component files: `MyComponent.jsx`, `MyComponent.module.css` (or `*.scss`) and `MyComponent.test.jsx`.
- Prefer composition over prop drilling; use slots/children and small focused props.

State management
- Use Context for app-wide state (auth, cart, theme). Keep context minimal and focused.
- Local UI state should remain in component state (`useState`, `useReducer`).
- Avoid copying server state into global state; fetch when needed and cache selectively.

API calling conventions
- Centralize HTTP calls in a client wrapper (e.g., `apiClient.js`) that handles base URL, headers, token refresh, and error parsing.
- Use `Authorization: Bearer <token>` header for authenticated requests.
- Handle loading and error states explicitly in UI; surface user-friendly messages.

Forms & validation
- Validate on the client for UX but repeat validation server-side. Use form libraries (React Hook Form + Zod) for consistent validation.

UI/UX consistency
- Use a small design token set: colors, spacing, font sizes in a shared file (`src/styles/variables`).
- Provide accessible semantics: proper HTML elements, ARIA attributes where necessary, focus management after navigation.

Performance
- Use code-splitting for large routes (React.lazy + Suspense).
- Memoize expensive computations and components with `useMemo`/`useCallback` only when measured and necessary.

Testing
- Unit test pure components and logic; use React Testing Library for integration of components and hooks.
