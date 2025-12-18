import supabase from '../../supabaseClient.ts';

export interface DbChatRecord {
  id: string;
  match_id: string;
  user_id: string | null;
  author: string | null;
  message: string;
  inserted_at: string;
}

export async function fetchChatForMatch(matchId: string): Promise<DbChatRecord[]> {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('match_id', matchId)
    .order('inserted_at', { ascending: true });
  if (error) {
    console.error('fetchChatForMatch error', error);
    return [];
  }
  return (data ?? []) as unknown as DbChatRecord[];
}

export async function sendChatMessage(matchId: string, author: string | null, message: string, userId?: string | null) {
  const { error } = await supabase
    .from('chats')
    .insert({ match_id: matchId, author, message, user_id: userId ?? null });
  if (error) throw error;
}

export async function deleteChatMessage(id: string) {
  // Get current user to verify ownership
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Only allow deletion if user_id matches
  if (error) throw error;
}



