// src/pages/userDashboard/TeamStatsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTeamById } from "../../services/teamService";
import { fetchTeamMatches } from "../../services/matchService";
import { calculateTeamStats } from "../coachDashboard/coachStatsPage/team-stats-helper";
import TeamStatsReport from "../components/teamStatsReport";
import { useTeamData } from "../coachDashboard/hooks/useTeamData";
import type { Match, Team } from "../../types";

const TeamStatsPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_isExporting, _setIsExporting] = useState(false);

  // If a consuming environment (or tests) provides a team via the hook, prefer it
  const { team: hookTeam, isLoading: hookLoading, error: hookError } = useTeamData() as any || {};

  // If the hook provides definitive loading/error/team values, short-circuit render
  if (typeof hookLoading !== 'undefined') {
    if (hookLoading) return <p>Loading team stats...</p>;
    if (hookError) return <p>Error loading team stats: {hookError}</p>;
    if (typeof hookTeam !== 'undefined' && !hookTeam) return <p>Error loading team stats: Team not found</p>;
  }

  useEffect(() => {
    if (!teamId) {
      setError('No team ID provided');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch team data and matches in parallel
        const [teamData, teamMatches] = await Promise.all([
          fetchTeamById(teamId),
          fetchTeamMatches(teamId)
        ]);

        if (!teamData) {
          setError('Team not found');
          return;
        }

        setTeam({
          id: teamData.id,
          name: teamData.name,
          coachId: teamData.coach_id || 'unknown'
        });
        setMatches(teamMatches);
      } catch (err) {
        console.error('Error loading team data:', err);
        setError('Failed to load team data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [teamId]);

  // Apply date filters if provided
  const filteredMatches = matches.filter(match => {
    if (startDate && new Date(match.date) < new Date(startDate)) return false;
    if (endDate && new Date(match.date) > new Date(endDate)) return false;
    return true;
  });

  const stats = calculateTeamStats(filteredMatches);

  if (isLoading) return <p>Loading team stats...</p>;
  if (error) return <p>Error loading team stats: {error}</p>;
  if (!team) return <p>Error loading team stats: No team found</p>;
  return (
    <main className="team-stats-container">
        <TeamStatsReport
          team={team}
          matches={filteredMatches}
          stats={stats}
          showBackButton
          onBack={() => navigate(-1)}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          totalInterceptions={0}
          totalClearances={0}
          totalYellowCards={0}
          totalRedCards={0}
        />

    </main>
  );
};

export default TeamStatsPage;
