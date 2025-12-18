import React from "react";
import { useNavigate } from "react-router-dom";
import "./TeamsList.css";

interface Team {
  id: string;
  name: string;
  isFavorite?: boolean;
}

interface Props {
  teams: Team[];
  isFavorite: (teamId: string) => boolean;
  toggleFavorite: (teamId: string) => Promise<void>;
  loading: boolean;
}

const TeamsList: React.FC<Props> = ({ teams, isFavorite, toggleFavorite, loading }) => {
  const [togglingTeamId, setTogglingTeamId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();

  const handleStarClick = async (teamId: string) => {
    console.log(
      "Star clicked for team:",
      teamId,
      "Current favorite status:",
      isFavorite(teamId)
    );
    setTogglingTeamId(teamId);
    try {
      await toggleFavorite(teamId);
    } finally {
      setTogglingTeamId(null);
    }
  };

  return (
    <section>
      <header className="teams-section-header">
        <h2>Teams</h2>
      </header>

      <div className="rs-actions" style={{ marginBottom: "12px" }}>
        <input
          placeholder="Search for team"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="rs-btn" onClick={() => setQuery(query)}>Search</button>
        <button className="rs-btn ghost" onClick={() => setQuery("")}>Clear</button>
      </div>

      <ul className="rs-list">
        {(React.useMemo(() => {
          const q = query.trim().toLowerCase();
          if (!q) return teams;
          return teams.filter(t => t.name.toLowerCase().includes(q));
        }, [teams, query])).map((t) => (
          <li key={t.id} className="rs-match">
            {/* Navigate to Team Stats */}
            <button
              className="team-link"
              onClick={() => navigate(`/teams/${t.id}/stats`)}
            >
              {t.name}
            </button>

            {/* Favorite star button */}
            <button
              aria-label={isFavorite(t.id) ? "Remove from favorites" : "Add to favorites"}
              className={`rs-btn ghost${isFavorite(t.id) ? " favorited" : ""}`}
              onClick={() => handleStarClick(t.id)}
              title={isFavorite(t.id) ? "Unfavorite" : "Favorite"}
              disabled={loading || togglingTeamId === t.id}
            >
              {togglingTeamId === t.id ? "⏳" : isFavorite(t.id) ? "★" : "☆"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TeamsList;
