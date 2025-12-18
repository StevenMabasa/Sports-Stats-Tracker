import supabase from '../../supabaseClient.ts';
import type { Player, PlayerStats, DbPlayerStatsRecord } from '../types';

export interface DbPlayerRecord {
  id: string;
  team_id: string;
  name: string;
  position: string | null;
  jersey_num: string | null;
  image_url: string | null;
}

export async function fetchPlayers(): Promise<DbPlayerRecord[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*');
  if (error) {
    console.error('fetchPlayers error', error);
    return [];
  }
  return (data ?? []) as unknown as DbPlayerRecord[];
}

export async function fetchPlayersWithStats(teamId: string): Promise<Player[]> {
  try {
    // Fetch players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId);
    
    if (playersError) {
      console.error('fetchPlayersWithStats players error:', playersError);
      return [];
    }

    if (!players || players.length === 0) {
      return [];
    }

    // Fetch stats for all players
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .in('player_id', players.map(p => p.id));
    
    if (statsError) {
      console.error('fetchPlayersWithStats stats error:', statsError);
      return [];
    }

    // Transform to Player interface with aggregated stats
    return players.map(player => {
      const playerStats = stats?.filter(s => s.player_id === player.id) || [];
      const aggregatedStats = aggregatePlayerStats(playerStats);
      
      return {
        id: player.id,
        name: player.name,
        teamId: player.team_id,
        position: player.position || 'Unknown',
        jerseyNum: player.jersey_num || '',
        stats: aggregatedStats,
        imageUrl: player.image_url || '',
      };
    });
  } catch (error) {
    console.error('fetchPlayersWithStats error:', error);
    return [];
  }
}

export async function fetchPlayerStats(playerId: string): Promise<PlayerStats | null> {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('fetchPlayerStats error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return aggregatePlayerStats(data);
  } catch (error) {
    console.error('fetchPlayerStats error:', error);
    return null;
  }
}

// Fetch and aggregate stats for multiple players at once
export async function fetchAggregatedStatsForPlayers(playerIds: string[]): Promise<Record<string, PlayerStats>> {
  try {
    if (!playerIds || playerIds.length === 0) {
      console.log('fetchAggregatedStatsForPlayers: No player IDs provided');
      return {};
    }

    console.log('fetchAggregatedStatsForPlayers: Fetching stats for players:', playerIds);

    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .in('player_id', playerIds);

    if (error) {
      console.error('fetchAggregatedStatsForPlayers error:', error);
      return {};
    }

    console.log('fetchAggregatedStatsForPlayers: Raw data from database:', data);

    const byPlayer: Record<string, DbPlayerStatsRecord[]> = {};
    (data ?? []).forEach((stat: any) => {
      const pid = stat.player_id as string;
      if (!byPlayer[pid]) byPlayer[pid] = [] as unknown as DbPlayerStatsRecord[];
      byPlayer[pid].push(stat as DbPlayerStatsRecord);
    });

    const result: Record<string, PlayerStats> = {};
    playerIds.forEach(pid => {
      const statsRecords = byPlayer[pid] || [];
      result[pid] = aggregatePlayerStats(statsRecords);
    });

    console.log('fetchAggregatedStatsForPlayers: Aggregated result:', result);
    return result;
  } catch (error) {
    console.error('fetchAggregatedStatsForPlayers unexpected error:', error);
    return {};
  }
}

export async function fetchPlayerStatsByMatch(playerId: string): Promise<DbPlayerStatsRecord[]> {
  try {
    console.log('fetchPlayerStatsByMatch called with playerId:', playerId);
    
    // Fetch specific player stats
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });
    
    console.log('Supabase response for specific player - data:', data, 'error:', error);
    
    if (error) {
      console.error('fetchPlayerStatsByMatch error:', error);
      return [];
    }

    console.log('Returning stats:', data);
    return (data ?? []) as DbPlayerStatsRecord[];
  } catch (error) {
    console.error('fetchPlayerStatsByMatch error:', error);
    return [];
  }
}

export async function createPlayer(playerData: Omit<DbPlayerRecord, 'id'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert([playerData])
      .select('id')
      .single();
    
    if (error) {
      console.error('createPlayer error:', error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('createPlayer error:', error);
    return null;
  }
}

export async function updatePlayer(playerId: string, playerData: Partial<DbPlayerRecord>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .update(playerData)
      .eq('id', playerId);
    
    if (error) {
      console.error('updatePlayer error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('updatePlayer error:', error);
    return false;
  }
}

export async function deletePlayer(playerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);
    
    if (error) {
      console.error('deletePlayer error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('deletePlayer error:', error);
    return false;
  }
}

// Helper function to aggregate player stats across multiple matches
function aggregatePlayerStats(statsRecords: DbPlayerStatsRecord[]): PlayerStats {
  if (statsRecords.length === 0) {
    return {
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      chancesCreated: 0,
      dribblesAttempted: 0,
      dribblesSuccessful: 0,
      offsides: 0,
      tackles: 0,
      interceptions: 0,
      clearances: 0,
      saves: 0,
      cleansheets: 0,
      savePercentage: 0,
      passCompletion: 0,
      minutesPlayed: 0,
      yellowCards: 0,
      redCards: 0,
      performanceData: [0, 0, 0, 0, 0],
    };
  }

  const totalMatches = statsRecords.length;
  
  // Sum all stats
  const totals = statsRecords.reduce((acc, stat) => ({
    goals: acc.goals + (stat.goals || 0),
    assists: acc.assists + (stat.assists || 0),
    shots: acc.shots + (stat.shots || 0),
    shotsOnTarget: acc.shotsOnTarget + (stat.shots_on_target || 0),
    chancesCreated: acc.chancesCreated + (stat.chances_created || 0),
    dribblesAttempted: acc.dribblesAttempted + (stat.dribbles_attempted || 0),
    dribblesSuccessful: acc.dribblesSuccessful + (stat.dribbles_successful || 0),
    offsides: acc.offsides + (stat.offsides || 0),
    tackles: acc.tackles + (stat.tackles || 0),
    interceptions: acc.interceptions + (stat.interceptions || 0),
    clearances: acc.clearances + (stat.clearances || 0),
    saves: acc.saves + (stat.saves || 0),
    cleansheets: acc.cleansheets + (stat.clean_sheets || 0),
    passCompletion: acc.passCompletion + (stat.pass_completion || 0),
    minutesPlayed: acc.minutesPlayed + (stat.minutes_played || 0),
    yellowCards: acc.yellowCards + (stat.yellow_cards || 0),
    redCards: acc.redCards + (stat.red_cards || 0),
  }), {
    goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, chancesCreated: 0,
    dribblesAttempted: 0, dribblesSuccessful: 0, offsides: 0, tackles: 0,
    interceptions: 0, clearances: 0, saves: 0, cleansheets: 0,
    passCompletion: 0, minutesPlayed: 0, yellowCards: 0, redCards: 0,
  });

  // Calculate averages
  const averages = {
    passCompletion: totalMatches > 0 ? totals.passCompletion / totalMatches : 0,
    savePercentage: totalMatches > 0 ? (totals.saves > 0 ? (totals.saves / (totals.saves + totals.goals)) * 100 : 0) : 0,
  };

  // Get performance data from last 5 matches
  const performanceData = statsRecords
    .slice(0, 5)
    .map(stat => stat.goals || 0)
    .reverse();

  // Pad with zeros if less than 5 matches
  while (performanceData.length < 5) {
    performanceData.unshift(0);
  }

  return {
    ...totals,
    savePercentage: averages.savePercentage,
    passCompletion: averages.passCompletion,
    performanceData,
  };
}



