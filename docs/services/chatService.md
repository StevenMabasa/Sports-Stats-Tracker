# chatService API

Source: `src/services/chatService.ts`

Thin wrapper around Supabase for chat CRUD tied to a `match_id`.

## Types

- `DbChatRecord`: `{ id, match_id, user_id, author, message, inserted_at }`

## Functions

- `fetchChatForMatch(matchId: string): Promise<DbChatRecord[]>`
  - Selects from `public.chats` where `match_id = matchId`, ordered by `inserted_at` ascending.
  - Returns `[]` on error (logs to console).

- `sendChatMessage(matchId: string, author: string|null, message: string, userId?: string|null): Promise<void>`
  - Inserts a new chat row with provided fields.
  - Throws on Supabase error.

- `deleteChatMessage(id: string): Promise<void>`
  - Verifies current user via `supabase.auth.getUser()`.
  - Deletes where `id = id` AND `user_id = currentUserId` (prevents deleting others' messages).
  - Throws on Supabase error.

## Notes and Guarantees

- Client-side checks ensure only the author's messages show a Delete button, but authorization must be enforced by Supabase RLS as well.
- Errors thrown from send/delete should be handled by callers for user feedback.

## Suggested RLS (illustrative)

- Select: allow authenticated users for relevant matches.
- Insert: `auth.uid() IS NOT NULL`.
- Delete: `auth.uid() = user_id`.

