// src/pages/coachDashboard/playerManagement/PlayerManagementPage.tsx

import React, { useEffect, useState } from 'react';
import supabase from '../../../../supabaseClient';
import { getCurrentTeamId } from '../../../services/teamService';
import { fetchPlayersWithStats } from '../../../services/playerService';
import { loadLineup, saveLineup, updatePlayerPosition, debugLineup, removePlayerFromLineup } from '../../../services/lineupService';
import RosterManagement from './RosterManagement';
import LineupSelection from './LineupSelection';
import './PlayerManagement.css';

// Import the Player type from your central types file
import type { Player } from "../../../types";

const PlayerManagementPage: React.FC = () => {
  const currentTeamId = getCurrentTeamId();

  const [players, setPlayers] = useState<Player[]>([]);
  const [lineup, setLineup] = useState<Player[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      if (!currentTeamId) {
        setErrorMsg('No team found. Please set up your team first.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Use the service function that fetches players with real stats from database
        const playersWithStats = await fetchPlayersWithStats(currentTeamId);
        setPlayers(playersWithStats);
        
        // Load saved lineup from database
        await loadSavedLineup(currentTeamId, playersWithStats);
      } catch (error) {
        console.error('Error loading players:', error);
        setErrorMsg('We could not load your players. Please refresh or try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadPlayers();
  }, [currentTeamId]);

  const loadSavedLineup = async (teamId: string, allPlayers: Player[]) => {
    try {
      const savedLineupData = await loadLineup(teamId);
      
      // Map saved lineup data to Player objects
      const savedLineup: Player[] = [];
      for (const lineupPlayer of savedLineupData) {
        const player = allPlayers.find(p => p.id === lineupPlayer.playerId);
        if (player) {
          savedLineup.push(player);
        }
      }
      
      setLineup(savedLineup);
    } catch (error) {
      console.error('Error loading saved lineup:', error);
      // Don't show error for lineup loading, just start with empty lineup
    }
  };

  const handleAddPlayer = async (
    playerData: Omit<Player, 'id' | 'stats' | 'imageUrl' | 'teamId'>
  ) => {
    const { name, position, jerseyNum } = playerData;
    if (!currentTeamId) {
      setErrorMsg('No team found. Please set up your team first.');
      return;
    }

    // Check for duplicate jersey number
    if (jerseyNum && players.some(player => player.jerseyNum === jerseyNum)) {
      setErrorMsg(`Jersey number ${jerseyNum} is already taken. Please choose another number.`);
      // Clear error message after 3 seconds
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .insert([
          {
            team_id: currentTeamId,
            name,
            position,
            jersey_num: jerseyNum,
            image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=80&bold=true`
          }
        ])
        .select();

      if (error) {
        console.error('Error adding player:', error);
        setErrorMsg('We could not add that player. Please try again.');
        return;
      }

      // Fetch updated players list with stats
      const updatedPlayers = await fetchPlayersWithStats(currentTeamId);
      setPlayers(updatedPlayers);
      setSuccessMsg(`${name} has been added to your team!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error('Error adding player:', error);
      setErrorMsg('We could not add that player. Please try again.');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      // Remove from lineup first
      setLineup(prev => prev.filter(p => p.id !== playerId));
      
      // Remove from players list
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      
      // Delete from database
      const { error } = await supabase.from('players').delete().eq('id', playerId);
      
      if (error) {
        console.error('Error removing player:', error);
        setErrorMsg('We could not remove that player. Please try again.');
      } else {
        setSuccessMsg('Player has been removed from your team.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error) {
      console.error('Error removing player:', error);
      setErrorMsg('We could not remove that player. Please try again.');
    }
  };

  const handleAddToLineup = async (player: Player) => {
    // Check if lineup already has 11 players
    if (lineup.length >= 11) {
      setErrorMsg('Maximum 11 players allowed in the lineup. Please remove a player first.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    // Check if player is already in lineup
    if (lineup.find(p => p.id === player.id)) {
      setErrorMsg(`${player.name} is already in the lineup.`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    try {
      // Add to local state
      const newLineup = [...lineup, player];
      setLineup(newLineup);

      // Save to database
      const success = await saveLineup(currentTeamId!, newLineup.map(p => ({
        playerId: p.id,
        positionX: 50, // Default center position
        positionY: 50,
      })));

      if (success) {
        console.log('[PlayerManagement] Added to lineup and saved', { teamId: currentTeamId, playerId: player.id });
        setSuccessMsg(`${player.name} has been added to the lineup!`);
        setTimeout(() => setSuccessMsg(null), 3000);
        // Debug: Check what's in the database
        await debugLineup(currentTeamId!);
      } else {
        console.error('[PlayerManagement] Failed to save lineup after add', { teamId: currentTeamId });
        setErrorMsg('Could not save lineup to database. Please try again.');
        setTimeout(() => setErrorMsg(null), 3000);
      }
    } catch (error) {
      console.error('Error adding player to lineup:', error);
      setErrorMsg('Could not add player to lineup. Please try again.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleRemoveFromLineup = async (playerId: string) => {
    try {
      const playerToRemove = lineup.find(p => p.id === playerId);
      if (!playerToRemove) return;

      // Optimistically update local state
      setLineup(prev => prev.filter(p => p.id !== playerId));

      // Directly delete from DB to avoid full overwrite race conditions
      const success = await removePlayerFromLineup(currentTeamId!, playerId);

      if (success) {
        console.log('[PlayerManagement] Removed from lineup', { teamId: currentTeamId, playerId });
        setSuccessMsg(`${playerToRemove.name} has been removed from the lineup.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        console.error('[PlayerManagement] Failed to remove from lineup', { teamId: currentTeamId, playerId });
        setErrorMsg('Could not update lineup in database. Please try again.');
        setTimeout(() => setErrorMsg(null), 3000);
      }
    } catch (error) {
      console.error('Error removing player from lineup:', error);
      setErrorMsg('Could not remove player from lineup. Please try again.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handlePlayerPositionUpdate = async (playerId: string, x: number, y: number) => {
    try {
      const success = await updatePlayerPosition(currentTeamId!, playerId, x, y);
      if (!success) {
        console.error('Failed to update player position in database');
      }
    } catch (error) {
      console.error('Error updating player position:', error);
    }
  };
  
  if (isLoading) {
    return (
      <main className="management-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading players...</p>
        </div>
      </main>
    );
  }
  
  return (
    <main className="management-container">

      <RosterManagement
       errorMsg={errorMsg}
       setErrorMsg={setErrorMsg}
       successMsg={successMsg}
       setSuccessMsg={setSuccessMsg}
        players={players}
        lineupIds={new Set(lineup.map(p => p.id))}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onAddToLineup={handleAddToLineup}
      />

      <LineupSelection
        lineup={lineup}
        onRemoveFromLineup={handleRemoveFromLineup}
        onPositionUpdate={handlePlayerPositionUpdate}
      />
    </main>
  );
};

export default PlayerManagementPage;