import React from "react";
import { useNavigate } from "react-router-dom";
import "./PlayersList.css";

interface Player { id: string; name: string; teamId: string; position: string; stats: { goals: number; assists: number; minutesPlayed: number } }
interface Team { id: string; name: string }

interface Props { players: Player[]; teams: Team[] }

const PlayersList: React.FC<Props> = ({ players, teams }) => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");

  const handlePlayerClick = (playerId: string) => {
    navigate(`/players/${playerId}`);
  };

  const filteredPlayers = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return players;
    return players.filter(p => {
      const teamName = teams.find(t => t.id === p.teamId)?.name?.toLowerCase() || "";
      return (
        p.name.toLowerCase().includes(search) ||
        (p.position || "").toLowerCase().includes(search) ||
        teamName.includes(search)
      );
    });
  }, [players, teams, query]);

  return (
    <div>
      <div className="players-header">
        <div>
          <h3>Players</h3>
          <div className="subtitle">Click on a player to view detailed statistics</div>
        </div>
      </div>
      <div className="rs-actions">
          <input
            placeholder="Search by name, position, or team"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="rs-btn" onClick={() => setQuery(query)}>
            Search
          </button>
          <button className="rs-btn ghost" onClick={() => setQuery("")}>Clear</button>
        </div>
      <div className="rs-list">
        {filteredPlayers.map(p => {
          const team = teams.find(t => t.id === p.teamId);
          return (
            <div
              key={p.id}
              className="rs-player"
              onClick={() => handlePlayerClick(p.id)}
            >
              <div>
                <div style={{ fontWeight: 800 }}>
                  {p.name} <span className="meta">{p.position}</span>
                </div>
                <div className="meta">Team: {team?.name || p.teamId}</div>
              </div>
              <div className="stats">G {p.stats.goals} • A {p.stats.assists}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayersList;



