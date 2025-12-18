# Chat Component

The `Chat` component provides real-time, match-scoped chat using Supabase Realtime and the `chats` table.

## Location

- File: `src/pages/userDashboard/Chat.tsx`
- Depends on: `src/services/chatService.ts`, `supabaseClient.ts`

## Props

- `matchId: string` — ID of the match whose chat to display.
- `username: string` — Display name used when sending messages (fallbacks to "Fan").

## Behavior

- Loads historical messages for `matchId` on mount.
- Subscribes to Postgres changes on `public.chats` filtered by `match_id` for live updates (INSERT/UPDATE/DELETE).
- Automatically scrolls to the newest message.
- Shows a Delete button for messages authored by the current user only.

## Key Interactions

- Fetch: `fetchChatForMatch(matchId)`
- Send: `sendChatMessage(matchId, author, text, currentUserId)`
- Delete: `deleteChatMessage(id)` (only if `user_id` matches current user)

## UI Hooks

- Press Enter in the input or click Send to submit a message.
- Empty messages are ignored.

## Data Model (expected)

`chats` table (simplified):

- `id: uuid`
- `match_id: text|uuid`
- `user_id: uuid|null`
- `author: text|null`
- `message: text`
- `inserted_at: timestamp with time zone`

Ensure appropriate RLS policies exist to allow:
- Insert for authenticated users.
- Select for match viewers.
- Delete only by the original author (matching `user_id`).

## Extending

- Add editing by wiring an UPDATE into the service and UI.
- Add pagination by limiting initial select and fetching older messages on demand.
- Add moderation flags (e.g., `is_flagged`) and staff-only delete overrides.

