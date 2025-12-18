# Architecture Overview

## Frontend

- React + TypeScript + Vite
- Routing via `react-router-dom`
- Feature pages under `src/pages/` with domain-specific subfolders
- Shared services under `src/services/`

## Backend / Data

- Supabase for Auth and Postgres database
- Realtime via Supabase Channels listening to Postgres changes
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Testing

- Vitest + @testing-library/react
- Config in `vite.config.ts` → `test` section and `src/setupTests.ts`

## Notable Flows

- Authentication
  - Client obtains session via Supabase Auth.
  - Protected routes/components check session state.

- Real-time Chat
  - UI fetches historical messages for a `match_id`.
  - Subscribes to `postgres_changes` on `public.chats` filtered by `match_id`.
  - UI updates on INSERT/UPDATE/DELETE events.

## Conventions

- Services should remain thin and typed.
- UIs should avoid direct Supabase calls except for auth/session queries.
- Prefer optimistic UI updates when safe; reconcile with server on confirmation.

