import supabase from '../../supabaseClient.ts';

export const AVATAR_BUCKET = 'avatars';

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const path = `${userId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: true });
  if (error) {
    console.warn('uploadAvatar warning:', error?.message || error);
    return null;
  }
  const { data: publicUrl } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(data.path);
  return publicUrl?.publicUrl ?? null;
}

export interface UpsertProfilePayload {
  id: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export async function upsertUserProfile(payload: UpsertProfilePayload) {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: payload.id,
      display_name: payload.display_name ?? null,
      bio: payload.bio ?? null,
      avatar_url: payload.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('display_name, bio, avatar_url')
    .eq('id', userId)
    .maybeSingle();
  if (error && (error as any).code !== 'PGRST116') throw error;
  return data ?? null;
}


