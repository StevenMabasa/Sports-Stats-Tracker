// pages/userDashboard/PlayerDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPlayerStatsByMatch, fetchPlayers } from "../../services/playerService";
import { fetchTeamById } from "../../services/teamService";
import { fetchMatches } from "../../services/matchService";
import type { DbPlayerStatsRecord, Match } from "../../types";

interface PlayerStatsWithMatch extends DbPlayerStatsRecord {
  match?: Match;
}

interface Team {
  id: string;
  name: string;
}

interface Props {
  onBack: () => void;
}

const PlayerDetails: React.FC<Props> = ({ onBack }) => {
  const { playerId } = useParams<{ playerId: string }>();
  const [playerStats, setPlayerStats] = useState<PlayerStatsWithMatch[]>([]);
  const [playerInfo, setPlayerInfo] = useState<{ name: string; position: string; teamId: string } | null>(null);
  const [teams, setTeams] = useState<Map<string, Team>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlayerData = async () => {
      console.log('loadPlayerData called with playerId:', playerId);
      if (!playerId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch player stats by match
        console.log('Fetching stats for player:', playerId);
        const stats = await fetchPlayerStatsByMatch(playerId);
        console.log('Raw stats data:', stats);
        
        if (stats.length === 0) {
          console.log('No stats found for player');
          // Do not treat as an error; show the no-stats UI instead
          setPlayerStats([]);
          return;
        }

        // Fetch player information
        const allPlayers = await fetchPlayers();
        const player = allPlayers.find(p => p.id === playerId);
        
        if (player) {
          setPlayerInfo({
            name: player.name,
            position: player.position || "Unknown",
            teamId: player.team_id
          });
        } else {
          setPlayerInfo({
            name: `Player ${playerId.slice(0, 8)}`, // Placeholder name
            position: "Unknown",
            teamId: stats[0].match_id // Use first match as fallback
          });
        }

        // Fetch match information for all matches referenced in stats
        const matchIds = [...new Set(stats.map(stat => stat.match_id))];
        const allMatches = await fetchMatches();
        const matchesMap = new Map<string, Match>();
        
        matchIds.forEach(matchId => {
          const match = allMatches.find(m => m.id === matchId);
          if (match) {
            matchesMap.set(matchId, match);
          }
        });

        // Fetch team information for all teams referenced in matches
        const teamIds = new Set<string>();
        matchesMap.forEach(match => {
          teamIds.add(match.teamId);
        });

        const teamPromises = Array.from(teamIds).map(async (teamId) => {
          const team = await fetchTeamById(teamId);
          return team ? { id: teamId, name: team.name } : null;
        });

        const teamResults = await Promise.all(teamPromises);
        const teamsMap = new Map<string, Team>();
        teamResults.filter(Boolean).forEach(team => {
          if (team) teamsMap.set(team.id, team);
        });
        setTeams(teamsMap);

        // Combine stats with match data
        const statsWithMatches = stats.map(stat => ({
          ...stat,
          match: matchesMap.get(stat.match_id)
        }));
        
        setPlayerStats(statsWithMatches);

      } catch (err) {
        console.error('Error loading player data:', err);
        setError('Failed to load player data');
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [playerId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTeamName = (teamId: string) => {
    return teams.get(teamId)?.name || teamId;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
        <div>Loading player statistics...</div>
        <div style={{ fontSize: "14px", marginTop: "8px" }}>Please wait while we fetch the data</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "var(--danger)" }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Error Loading Player Data</div>
        <div>{error}</div>
        <button 
          style={{ marginTop: "10px", padding: "8px 16px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (playerStats.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
        <div>No statistics found for this player</div>
        <button 
          style={{ marginTop: "10px", padding: "8px 16px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={onBack}
        >
          Return to Players
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="rs-card">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--text-primary)" }}>
            {playerInfo?.name || `Player ${playerId?.slice(0, 8)}`}
          </h2>
          <div style={{ color: "var(--muted)", fontSize: "14px" }}>
            {playerInfo?.position} • {getTeamName(playerInfo?.teamId || '')}
          </div>
        </div>
        <button 
          className="rs-btn ghost"
          onClick={onBack}
        >
          ← Back to Players
        </button>
      </div>

      {/* Return to Players Button - More Prominent */}
      <div style={{ marginBottom: "20px" }}>
        <button 
          className="rs-btn"
          onClick={onBack}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "var(--primary)", 
            color: "white", 
            border: "none", 
            borderRadius: "6px", 
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500"
          }}
        >
          ← Return to Players List
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg)", borderRadius: "8px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Season Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {playerStats.reduce((sum, stat) => sum + (stat.goals || 0), 0)}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Goals</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {playerStats.reduce((sum, stat) => sum + (stat.assists || 0), 0)}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Assists</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {playerStats.length}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Matches</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {playerStats.reduce((sum, stat) => sum + (stat.minutes_played || 0), 0)}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Minutes</div>
          </div>
        </div>
      </div>

      {/* Stats Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="player-stats-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Opponent</th>
              <th>Score</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>Shots</th>
              <th>Shots on Target</th>
              <th>Pass %</th>
              <th>Minutes</th>
              <th>Tackles</th>
              <th>Cards</th>
            </tr>
          </thead>
          <tbody>
            {playerStats.filter(stat => stat.match).map((stat) => {
              const match = stat.match!;
              
              const yellowCards = stat.yellow_cards || 0;
              const redCards = stat.red_cards || 0;
              const cards = yellowCards + redCards > 0 ? `${yellowCards}Y${redCards > 0 ? ` ${redCards}R` : ''}` : '-';
              
              return (
                <tr key={stat.id}>
                  <td>{formatDate(match.date)}</td>
                  <td>{match.opponentName}</td>
                  <td style={{ fontWeight: "600" }}>
                    {match.teamScore} - {match.opponentScore}
                  </td>
                  <td>{stat.goals || 0}</td>
                  <td>{stat.assists || 0}</td>
                  <td>{stat.shots || 0}</td>
                  <td>{stat.shots_on_target || 0}</td>
                  <td>
                    {stat.pass_completion ? `${stat.pass_completion}%` : '-'}
                  </td>
                  <td>{stat.minutes_played || 0}</td>
                  <td>{stat.tackles || 0}</td>
                  <td>{cards}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Additional Stats Section */}
      <div style={{ marginTop: "24px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Detailed Statistics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "16px", backgroundColor: "var(--bg)", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--muted)" }}>Attacking</h4>
            <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
              <div>Chances Created: {playerStats.reduce((sum, stat) => sum + (stat.chances_created || 0), 0)}</div>
              <div>Dribbles: {playerStats.reduce((sum, stat) => sum + (stat.dribbles_successful || 0), 0)}/{playerStats.reduce((sum, stat) => sum + (stat.dribbles_attempted || 0), 0)}</div>
              <div>Offsides: {playerStats.reduce((sum, stat) => sum + (stat.offsides || 0), 0)}</div>
            </div>
          </div>
          <div style={{ padding: "16px", backgroundColor: "var(--bg)", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--muted)" }}>Defending</h4>
            <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
              <div>Interceptions: {playerStats.reduce((sum, stat) => sum + (stat.interceptions || 0), 0)}</div>
              <div>Clearances: {playerStats.reduce((sum, stat) => sum + (stat.clearances || 0), 0)}</div>
              <div>Saves: {playerStats.reduce((sum, stat) => sum + (stat.saves || 0), 0)}</div>
            </div>
          </div>
          <div style={{ padding: "16px", backgroundColor: "var(--bg)", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--muted)" }}>Discipline</h4>
            <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
              <div>Yellow Cards: {playerStats.reduce((sum, stat) => sum + (stat.yellow_cards || 0), 0)}</div>
              <div>Red Cards: {playerStats.reduce((sum, stat) => sum + (stat.red_cards || 0), 0)}</div>
              <div>Clean Sheets: {playerStats.reduce((sum, stat) => sum + (stat.clean_sheets || 0), 0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PlayerDetails;
