import { useCallback, useEffect, useState } from "react";
import { fetchUserFavorites, addFavorite, removeFavorite } from "../../../services/favoritesService.ts";
import supabase from "../../../../supabaseClient.ts";

export function useFavoriteTeams() {
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);

  // Check if we have Supabase credentials
  useEffect(() => {
    const checkCredentials = () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const hasCreds = !!(url && key);
      setHasCredentials(hasCreds);
      console.log('Supabase credentials check:', { hasCreds, url: !!url, key: !!key });
      return hasCreds;
    };
    
    checkCredentials();
  }, []);

  // Create user profile if it doesn't exist
  const ensureUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Ensuring user profile exists for:', userId);
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking user profile:', checkError);
        return false;
      }
      
      if (!existingProfile) {
        console.log('Creating new user profile for:', userId);
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({ id: userId });
        
        if (createError) {
          console.error('Error creating user profile:', createError);
          return false;
        }
        
        console.log('User profile created successfully');
        return true;
      } else {
        console.log('User profile already exists');
        return true;
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return false;
    }
  }, []);

  // Get current user ID and load favorites
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        console.log('Getting current user...');
        
        if (!hasCredentials) {
          console.log('No Supabase credentials, using localStorage only');
          const storedFavorites = localStorage.getItem('rs_favorite_teams_v1');
          if (storedFavorites) {
            try {
              const parsed = JSON.parse(storedFavorites);
              console.log('Favorites from localStorage:', parsed);
              setFavoriteTeamIds(parsed);
            } catch (e) {
              console.warn('Failed to parse stored favorites');
            }
          }
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        console.log('User data:', user);
        
        if (user) {
          setUserId(user.id);
          console.log('User authenticated, ensuring profile exists...');
          
          // Ensure user profile exists before loading favorites
          const profileReady = await ensureUserProfile(user.id);
          if (profileReady) {
            console.log('Loading favorites from DB...');
            const favorites = await fetchUserFavorites(user.id);
            console.log('Favorites from DB:', favorites);
            setFavoriteTeamIds(favorites);
          } else {
            console.log('Failed to ensure user profile, using localStorage');
            const storedFavorites = localStorage.getItem('rs_favorite_teams_v1');
            if (storedFavorites) {
              try {
                const parsed = JSON.parse(storedFavorites);
                setFavoriteTeamIds(parsed);
              } catch (e) {
                console.warn('Failed to parse stored favorites');
              }
            }
          }
        } else {
          console.log('No authenticated user, loading from localStorage...');
          // Load from localStorage as fallback
          const storedFavorites = localStorage.getItem('rs_favorite_teams_v1');
          if (storedFavorites) {
            try {
              const parsed = JSON.parse(storedFavorites);
              console.log('Favorites from localStorage:', parsed);
              setFavoriteTeamIds(parsed);
            } catch (e) {
              console.warn('Failed to parse stored favorites');
            }
          }
        }
      } catch (error) {
        console.error('Error getting user:', error);
        // Fallback to localStorage
        const storedFavorites = localStorage.getItem('rs_favorite_teams_v1');
        if (storedFavorites) {
          try {
            const parsed = JSON.parse(storedFavorites);
            setFavoriteTeamIds(parsed);
          } catch (e) {
            console.warn('Failed to parse stored favorites');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    getCurrentUser();
  }, [hasCredentials, ensureUserProfile]);

  const isFavorite = useCallback((teamId: string) => {
    const result = favoriteTeamIds.includes(teamId);
    console.log(`Checking if ${teamId} is favorite:`, result);
    return result;
  }, [favoriteTeamIds]);

  const toggleFavorite = useCallback(async (teamId: string) => {
    console.log('Toggle favorite called for team:', teamId);
    console.log('Current favorites:', favoriteTeamIds);
    console.log('Current user ID:', userId);
    console.log('Has credentials:', hasCredentials);
    
    const isCurrentlyFavorite = favoriteTeamIds.includes(teamId);
    console.log('Is currently favorite:', isCurrentlyFavorite);
    
    try {
      if (hasCredentials && userId) {
        console.log('User authenticated, ensuring profile before database operation...');
        
        // Ensure user profile exists before database operation
        const profileReady = await ensureUserProfile(userId);
        if (!profileReady) {
          console.log('Failed to ensure user profile, falling back to localStorage');
          // Fallback to localStorage
          if (isCurrentlyFavorite) {
            const newFavorites = favoriteTeamIds.filter(id => id !== teamId);
            setFavoriteTeamIds(newFavorites);
            localStorage.setItem('rs_favorite_teams_v1', JSON.stringify(newFavorites));
          } else {
            const newFavorites = [...favoriteTeamIds, teamId];
            setFavoriteTeamIds(newFavorites);
            localStorage.setItem('rs_favorite_teams_v1', JSON.stringify(newFavorites));
          }
          return;
        }
        
        // Try database operation
        if (isCurrentlyFavorite) {
          console.log('Removing from favorites...');
          const success = await removeFavorite(userId, teamId);
          console.log('Remove success:', success);
          if (success) {
            const newFavorites = favoriteTeamIds.filter(id => id !== teamId);
            setFavoriteTeamIds(newFavorites);
            localStorage.setItem('rs_favorite_teams_v1', JSON.stringify(newFavorites));
            console.log('Updated favorites after remove:', newFavorites);
          }
        } else {
          console.log('Adding to favorites...');
          const success = await addFavorite(userId, teamId);
          console.log('Add success:', success);
          if (success) {
            const newFavorites = [...favoriteTeamIds, teamId];
            setFavoriteTeamIds(newFavorites);
            localStorage.setItem('rs_favorite_teams_v1', JSON.stringify(newFavorites));
            console.log('Updated favorites after add:', newFavorites);
          }
        }
      } else {
        console.log('No credentials or user ID, using localStorage only...');
        // Fallback to localStorage if no user or credentials
        if (isCurrentlyFavorite) {
          const newFavorites = favoriteTeamIds.filter(id => id !== teamId);
          setFavoriteTeamIds(newFavorites);
          localStorage.setItem('rs_favorite_teams_v1', JSON.stringify(newFavorites));
          console.log('Updated localStorage favorites after remove:', newFavorites);
        } else {
          const newFavorites = [...favoriteTeamIds, teamId];
          setFavoriteTeamIds(newFavorites);
          localStorage.setItem('rs_favorite_teams_v1', JSON.stringify(newFavorites));
          console.log('Updated localStorage favorites after add:', newFavorites);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Fallback to localStorage on error
      if (isCurrentlyFavorite) {
        const newFavorites = favoriteTeamIds.filter(id => id !== teamId);
        setFavoriteTeamIds(newFavorites);
        localStorage.setItem('rs_favorite_teams_v1', JSON.stringify(newFavorites));
      } else {
        const newFavorites = [...favoriteTeamIds, teamId];
        setFavoriteTeamIds(newFavorites);
        localStorage.setItem('rs_favorite_teams_v1', JSON.stringify(newFavorites));
      }
    }
  }, [userId, favoriteTeamIds, hasCredentials, ensureUserProfile]);

  return { favoriteTeamIds, isFavorite, toggleFavorite, loading } as const;
}



