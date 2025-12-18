import supabase from '../../supabaseClient';

const AVATAR_BUCKET = 'avatars';

async function deleteAllAvatarFiles(userId: string): Promise<void> {
  try {
    // List files under the user's folder
    const { data: files, error: listError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(userId, { limit: 100, offset: 0 });

    if (listError || !files || files.length === 0) return;

    const paths = files.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from(AVATAR_BUCKET).remove(paths);
  } catch (_) {
    // Swallow storage errors to avoid blocking user deletion
  }
}

export async function deleteUserCompletely(userId: string): Promise<boolean> {
  try {
    // 1) Delete dependent rows first
    await Promise.all([
      // Chats authored by user
      supabase.from('chats').delete().eq('user_id', userId),
      // Favourites by user
      supabase.from('favourites').delete().eq('user_id', userId),
      // Remove coach link from teams (set to null)
      supabase.from('teams').update({ coach_id: null }).eq('coach_id', userId),
    ]);

    // 2) Delete profile rows and profile media
    await deleteAllAvatarFiles(userId);
    await Promise.all([
      supabase.from('user_profiles').delete().eq('id', userId),
      supabase.from('profiles').delete().eq('id', userId),
    ]);

    // 3) Delete user row
    const { error: userDelError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userDelError) {
      console.error('Error deleting user:', userDelError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('deleteUserCompletely failed:', error);
    return false;
  }
}

export default {
  deleteUserCompletely,
};


