# Developer Guide

This guide explains how the app is organized, how to develop features, and how to test and deploy.

## Project Structure

- `src/pages/` — Page-level components grouped by domain (e.g., `userDashboard`, `coachDashboard`, `f1`)
- `src/components/` — Shared UI components
- `src/services/` — Typed service wrappers around Supabase (e.g., `matchService.ts`, `playerService.ts`, `chatService.ts`)
- `src/__test__/` — Tests for units/components/pages
- `supabaseClient.ts` — Supabase initialization
- Root configs: `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`

## Conventions

- Keep services thin and typed; UI should not contain raw SQL or Supabase calls (except auth/session retrieval when unavoidable).
- Prefer early returns and clear naming; avoid deep nesting.
- Keep comments only for non-obvious reasoning or edge cases.

## Adding a Feature

1. Create a page or component under an appropriate folder in `src/pages/` or `src/components/`.
2. Add or extend a service in `src/services/` to encapsulate data access.
3. Wire the page into routing via `src/App.tsx`.
4. Add tests in `src/__test__/` for UI behavior and services.

## Data Access Pattern

- Services call Supabase (select/insert/update/delete) and return typed results.
- Components consume services and maintain UI state.
- For realtime needs, use Supabase Channels and subscribe to `postgres_changes` with filters.

## Authentication & Protected Routes

- Use Supabase Auth to obtain the session and user.
- Gate protected pages/components (see `components/ProtectedRoute.tsx`).

## Testing

- Run `npm run test` (Vitest) for unit and component tests.
- Prefer Testing Library queries by role/label over test IDs.
- Keep service tests deterministic; use MSW or Supabase test doubles as needed.

## Environment

- Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Restart dev server after changes.

## Build & Deployment

- `npm run build` to produce `dist/`.
- Deploy static assets to host (e.g., Azure Static Web Apps), ensure env vars configured.


