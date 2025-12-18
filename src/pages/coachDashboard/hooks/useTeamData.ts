import { useState, useEffect } from 'react';
import { getCurrentTeamId, fetchTeamById } from '../../../services/teamService';
import type { Team } from '../../../types';

export const useTeamData = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const teamId = getCurrentTeamId();
        if (!teamId) {
          setError('No team found. Please set up your team first.');
          return;
        }

        const teamData = await fetchTeamById(teamId);
        if (!teamData) {
          setError('Team not found. Please check your team setup.');
          return;
        }

        setTeam({
          id: teamData.id,
          name: teamData.name,
          coachId: teamData.coach_id || 'current-coach'
        });
      } catch (err) {
        console.error('Error loading team data:', err);
        setError('Failed to load team data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, []);

  return { team, isLoading, error };
};
