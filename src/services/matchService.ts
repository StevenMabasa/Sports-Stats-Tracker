import supabase from '../../supabaseClient.ts';
import type { Match, DbMatchRecord, DbPlayerStatsRecord, DbMatchEventRecord } from '../types';

export async function fetchMatches(): Promise<Match[]> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('fetchMatches error', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Raw matches data:', data);
    
    // Transform database records to Match interface
    const matches = (data ?? []).map((match: DbMatchRecord): Match => ({
      id: match.id,
      teamId: match.team_id,
      opponentName: match.opponent_name,
      teamScore: match.team_score,
      opponentScore: match.opponent_score,
      date: match.date,
      status: match.status,
      possession: match.possession,
      shots: match.shots,
      shotsOnTarget: match.shots_on_target,
      corners: match.corners,
      fouls: match.fouls,
      offsides: match.offsides,
      passes: match.passes,
      passAccuracy: match.pass_accuracy,
      tackles: match.tackles,
      saves: match.saves,
    }));
    
    console.log('Transformed matches:', matches);
    return matches;
  } catch (error) {
    console.error('fetchMatches unexpected error:', error);
    throw error;
  }
}

export async function fetchMatchEvents(matchId: string): Promise<DbMatchEventRecord[]> {
  const { data, error } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', matchId);
  
  if (error) {
    console.error('fetchMatchEvents error', error);
    return [];
  }
  
  return (data ?? []) as DbMatchEventRecord[];
}

export async function fetchPlayerStatsForMatch(matchId: string): Promise<DbPlayerStatsRecord[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select('*')
    .eq('match_id', matchId);
  
  if (error) {
    console.error('fetchPlayerStatsForMatch error', error);
    return [];
  }
  
  return (data ?? []) as DbPlayerStatsRecord[];
}

export async function fetchPlayerStatsForPlayer(playerId: string): Promise<DbPlayerStatsRecord[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('fetchPlayerStatsForPlayer error', error);
    return [];
  }
  
  return (data ?? []) as DbPlayerStatsRecord[];
}

export async function fetchTeamMatches(teamId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('team_id', teamId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('fetchTeamMatches error', error);
    return [];
  }
  
  // Transform database records to Match interface
  return (data ?? []).map((match: DbMatchRecord): Match => ({
    id: match.id,
    teamId: match.team_id,
    opponentName: match.opponent_name,
    teamScore: match.team_score,
    opponentScore: match.opponent_score,
    date: match.date,
    status: match.status,
    possession: match.possession,
    shots: match.shots,
    shotsOnTarget: match.shots_on_target,
    corners: match.corners,
    fouls: match.fouls,
    offsides: match.offsides,
    passes: match.passes,
    passAccuracy: match.pass_accuracy,
    tackles: match.tackles,
    saves: match.saves,
  }));
}

export async function createMatch(matchData: Omit<DbMatchRecord, 'id'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('matches')
    .insert([matchData])
    .select('id')
    .single();
  
  if (error) {
    console.error('createMatch error', error);
    return null;
  }
  
  return data?.id || null;
}

export async function updateMatch(matchId: string, matchData: Partial<DbMatchRecord>): Promise<boolean> {
  const { error } = await supabase
    .from('matches')
    .update(matchData)
    .eq('id', matchId);
  
  if (error) {
    console.error('updateMatch error', error);
    return false;
  }
  
  return true;
}

export async function createPlayerStats(statsData: Omit<DbPlayerStatsRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  console.log('[matchService] createPlayerStats input', statsData);
  const { data, error } = await supabase
    .from('player_stats')
    .insert([statsData])
    .select('id')
    .single();
  
  if (error) {
    console.error('createPlayerStats error', error);
    return null;
  }
  
  return data?.id || null;
}

export async function updatePlayerStats(statsId: string, statsData: Partial<DbPlayerStatsRecord>): Promise<boolean> {
  console.log('[matchService] updatePlayerStats input', { statsId, statsData });
  const { error } = await supabase
    .from('player_stats')
    .update(statsData)
    .eq('id', statsId);
  
  if (error) {
    console.error('updatePlayerStats error', error);
    return false;
  }
  
  return true;
}

// Upsert stats for a given player+match. If a record exists, update it; otherwise insert.
export async function upsertPlayerStats(
  matchId: string,
  playerId: string,
  statsData: Partial<DbPlayerStatsRecord>
): Promise<string | null> {
  try {
    console.log('[matchService] upsertPlayerStats called', { matchId, playerId, statsData });
    
    // Validate inputs
    if (!matchId || !playerId) {
      console.error('upsertPlayerStats: Missing required parameters', { matchId, playerId });
      return null;
    }

    // Ensure we have valid stats data
    const validStatsData = {
      goals: statsData.goals || 0,
      assists: statsData.assists || 0,
      shots: statsData.shots || 0,
      shots_on_target: statsData.shots_on_target || 0,
      chances_created: statsData.chances_created || 0,
      dribbles_attempted: statsData.dribbles_attempted || 0,
      dribbles_successful: statsData.dribbles_successful || 0,
      offsides: statsData.offsides || 0,
      tackles: statsData.tackles || 0,
      interceptions: statsData.interceptions || 0,
      clearances: statsData.clearances || 0,
      saves: statsData.saves || 0,
      clean_sheets: statsData.clean_sheets || 0,
      save_percentage: statsData.save_percentage || 0,
      pass_completion: statsData.pass_completion || 0,
      minutes_played: statsData.minutes_played || 0,
      yellow_cards: statsData.yellow_cards || 0,
      red_cards: statsData.red_cards || 0,
      // Position-specific stats
      passes_successful: statsData.passes_successful || 0,
      passes_attempted: statsData.passes_attempted || 0,
      goals_conceded: statsData.goals_conceded || 0,
      match_id: matchId,
      player_id: playerId
    };

    console.log('[matchService] Validated stats data:', validStatsData);

    // Check for existing record
    const { data: existing, error: fetchError } = await supabase
      .from('player_stats')
      .select('id')
      .eq('match_id', matchId)
      .eq('player_id', playerId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116: Row not found for single()
      console.error('upsertPlayerStats fetch error', fetchError);
      return null;
    }

    if (existing?.id) {
      console.log('[matchService] Updating existing record:', existing.id);
      const { data: updated, error: updateError } = await supabase
        .from('player_stats')
        .update(validStatsData)
        .eq('id', existing.id)
        .select('id')
        .single();
      
      if (updateError) {
        console.error('upsertPlayerStats update error', updateError);
        return null;
      }
      console.log('[matchService] upsertPlayerStats updated successfully', { id: updated?.id });
      return updated?.id ?? existing.id;
    }

    console.log('[matchService] Inserting new record');
    const { data: inserted, error: insertError } = await supabase
      .from('player_stats')
      .insert([validStatsData])
      .select('id')
      .single();
    
    if (insertError) {
      console.error('upsertPlayerStats insert error', insertError);
      console.error('Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return null;
    }
    
    console.log('[matchService] upsertPlayerStats inserted successfully', { id: inserted?.id });
    return inserted?.id ?? null;
  } catch (error) {
    console.error('upsertPlayerStats unexpected error', error);
    return null;
  }
}

export async function createMatchEvent(eventData: Omit<DbMatchEventRecord, 'id'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('match_events')
    .insert([eventData])
    .select('id')
    .single();
  
  if (error) {
    console.error('createMatchEvent error', error);
    return null;
  }
  
  return data?.id || null;
}

export async function deleteMatchEvent(eventId: string): Promise<boolean> {
  const { error } = await supabase
    .from('match_events')
    .delete()
    .eq('id', eventId);
  
  if (error) {
    console.error('deleteMatchEvent error', error);
    return false;
  }
  
  return true;
}



