# Architecture Overview

This document summarizes the overall system design, the key modules, and how data flows through the app.

## System Diagram (conceptual)

- Browser (React + Vite) ↔ Supabase Auth (sessions)
- Browser (services) ↔ Supabase Postgres (CRUD)
- Browser (Supabase Channels) ↔ Postgres Changes (Realtime)

## Layers

- Presentation: React components and pages under `src/pages/` and `src/components/`
- Application: Hooks and services under `src/services/` and feature hooks
- Data: Supabase client in `supabaseClient.ts` connecting to Postgres

## Routing & Pages

- `src/App.tsx` wires routes; feature pages live under `src/pages/`:
  - `landingPage.tsx`, `login.tsx`, `signup.tsx`, `ProfileSettings.tsx`
  - `pages/userDashboard/**` (charts, lists, chat, reports)
  - `pages/coachDashboard/**` (coach-specific tools)
  - `pages/f1/**` (F1 reporting)

## State & Data Access

- Components call typed functions in `src/services/*` (e.g., `matchService.ts`, `playerService.ts`, `chatService.ts`)
- Supabase client in `supabaseClient.ts` handles auth and DB access
- Some pages use feature hooks (e.g., `coachDashboard/hooks/useTeamData.ts`)

## Realtime

- Supabase Realtime subscriptions are used where live updates matter (e.g., `Chat.tsx`)

## Testing

- Vitest and Testing Library; tests in `src/__test__/`
- `vite.config.ts` configures test environment and coverage

## Build & Deploy

- Vite build; environment via `VITE_*` variables
- Azure deployment supported; any static host works for the frontend, with Supabase as backend

## Security & Access

- Supabase Auth for sessions; protected routes/components enforce access
- Recommend RLS policies per table (least privilege)

## Key Tradeoffs

- Thin service layer for clarity and testability
- Client-driven rendering with realtime for responsiveness
- Supabase-managed backend to reduce ops complexity

