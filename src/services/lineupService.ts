import supabase from '../../supabaseClient.ts';

export interface DbLineupRecord {
  id: string;
  team_id: string; // Changed from UUID to string to match teams table
  player_id: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface LineupPlayer {
  playerId: string;
  positionX: number;
  positionY: number;
}

export async function saveLineup(teamId: string, lineupPlayers: LineupPlayer[]): Promise<boolean> {
  try {
    console.log('🔄 Saving lineup to database:', { teamId, playerCount: lineupPlayers.length });
    
    // First, delete existing lineup for this team
    const { error: deleteError } = await supabase
      .from('lineups')
      .delete()
      .eq('team_id', teamId);
    
    if (deleteError) {
      console.error('❌ Error deleting existing lineup:', deleteError);
      return false;
    }

    console.log('✅ Deleted existing lineup for team:', teamId);

    // If no players in lineup, just return success
    if (lineupPlayers.length === 0) {
      console.log('ℹ️ No players in lineup, returning success');
      return true;
    }

    // Insert new lineup data
    const lineupData = lineupPlayers.map(player => ({
      team_id: teamId,
      player_id: player.playerId,
      position_x: player.positionX,
      position_y: player.positionY,
    }));

    console.log('📝 Inserting lineup data:', lineupData);

    const { data, error: insertError } = await supabase
      .from('lineups')
      .insert(lineupData)
      .select();
    
    if (insertError) {
      console.error('❌ Error saving lineup:', insertError);
      return false;
    }

    console.log('✅ Successfully saved lineup to database:', data);
    return true;
  } catch (error) {
    console.error('❌ Error saving lineup:', error);
    return false;
  }
}

export async function loadLineup(teamId: string): Promise<LineupPlayer[]> {
  try {
    console.log('🔄 Loading lineup from database for team:', teamId);
    
    const { data, error } = await supabase
      .from('lineups')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error loading lineup:', error);
      return [];
    }

    const lineupPlayers = (data || []).map((record: DbLineupRecord) => ({
      playerId: record.player_id,
      positionX: record.position_x,
      positionY: record.position_y,
    }));

    console.log('✅ Loaded lineup from database:', { teamId, playerCount: lineupPlayers.length, data });
    return lineupPlayers;
  } catch (error) {
    console.error('❌ Error loading lineup:', error);
    return [];
  }
}

export async function updatePlayerPosition(
  teamId: string, 
  playerId: string, 
  positionX: number, 
  positionY: number
): Promise<boolean> {
  try {
    console.log('🔄 Updating player position:', { teamId, playerId, positionX, positionY });
    
    const { data, error } = await supabase
      .from('lineups')
      .update({
        position_x: positionX,
        position_y: positionY,
        updated_at: new Date().toISOString(),
      })
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .select();
    
    if (error) {
      console.error('❌ Error updating player position:', error);
      return false;
    }

    console.log('✅ Successfully updated player position:', data);
    return true;
  } catch (error) {
    console.error('❌ Error updating player position:', error);
    return false;
  }
}

export async function addPlayerToLineup(
  teamId: string, 
  playerId: string, 
  positionX: number, 
  positionY: number
): Promise<boolean> {
  try {
    console.log('🔄 Adding player to lineup:', { teamId, playerId, positionX, positionY });
    
    const { data, error } = await supabase
      .from('lineups')
      .insert({
        team_id: teamId,
        player_id: playerId,
        position_x: positionX,
        position_y: positionY,
      })
      .select();
    
    if (error) {
      console.error('❌ Error adding player to lineup:', error);
      return false;
    }

    console.log('✅ Successfully added player to lineup:', data);
    return true;
  } catch (error) {
    console.error('❌ Error adding player to lineup:', error);
    return false;
  }
}

export async function removePlayerFromLineup(teamId: string, playerId: string): Promise<boolean> {
  try {
    console.log('🔄 Removing player from lineup:', { teamId, playerId });
    
    const { data, error } = await supabase
      .from('lineups')
      .delete()
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .select();
    
    if (error) {
      console.error('❌ Error removing player from lineup:', error);
      return false;
    }

    console.log('✅ Successfully removed player from lineup:', data);
    return true;
  } catch (error) {
    console.error('❌ Error removing player from lineup:', error);
    return false;
  }
}

// Debug function to check current lineup in database
export async function debugLineup(teamId: string): Promise<void> {
  try {
    console.log('🔍 Debugging lineup for team:', teamId);
    
    const { data, error } = await supabase
      .from('lineups')
      .select(`
        *,
        players(name, position, jersey_num)
      `)
      .eq('team_id', teamId);
    
    if (error) {
      console.error('❌ Error debugging lineup:', error);
      return;
    }

    console.log('📊 Current lineup in database:', data);
  } catch (error) {
    console.error('❌ Error debugging lineup:', error);
  }
}
