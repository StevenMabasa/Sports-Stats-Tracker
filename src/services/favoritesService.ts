import supabase from '../../supabaseClient.ts';

export interface DbFavoriteRecord {
  user_id: string;
  team_id: string;
  created_at: string;
}

export async function fetchUserFavorites(userId: string): Promise<string[]> {
  try {
    console.log('fetchUserFavorites called with userId:', userId);
    
    const { data, error } = await supabase
      .from('favourites')
      .select('team_id')
      .eq('user_id', userId);
    
    console.log('fetchUserFavorites response:', { data, error });
    
    if (error) {
      console.error('fetchUserFavorites error', error);
      return [];
    }
    
    return (data ?? []).map(fav => fav.team_id);
  } catch (error) {
    console.error('fetchUserFavorites exception:', error);
    return [];
  }
}

export async function addFavorite(userId: string, teamId: string): Promise<boolean> {
  try {
    console.log('addFavorite called with:', { userId, teamId });
    
    // Use upsert to handle case where team is already favorited
    const { data, error } = await supabase
      .from('favourites')
      .upsert({ user_id: userId, team_id: teamId }, { 
        onConflict: 'user_id,team_id',
        ignoreDuplicates: false 
      });
    
    console.log('addFavorite response:', { data, error });
    
    if (error) {
      console.error('addFavorite error', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('addFavorite exception:', error);
    return false;
  }
}

export async function removeFavorite(userId: string, teamId: string): Promise<boolean> {
  try {
    console.log('removeFavorite called with:', { userId, teamId });
    
    const { data, error } = await supabase
      .from('favourites')
      .delete()
      .eq('user_id', userId)
      .eq('team_id', teamId);
    
    console.log('removeFavorite response:', { data, error });
    
    if (error) {
      console.error('removeFavorite error', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('removeFavorite exception:', error);
    return false;
  }
}
