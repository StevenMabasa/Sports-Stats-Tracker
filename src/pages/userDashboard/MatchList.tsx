// pages/userDashboard/MatchList.tsx
import React from "react";
import type { UiMatch, UiTeam } from "./hooks/useDbData";
import "./MatchList.css";

interface Props {
  matches: UiMatch[];
  teams: UiTeam[];
  query: string;
  setQuery: (s:string)=>void;
  onOpen: (id:string)=>void;
}

const MatchesList: React.FC<Props> = ({matches, teams, query, setQuery, onOpen}) => {
  return (
    <div>
      <div className="matches-header">
        <div>
          <h3>Matches</h3>
        </div>
        <div className="rs-actions">
          <input className="searchMatch"  placeholder="Search teams or dates" value={query} onChange={e => setQuery(e.target.value)} />
          <button className="rs-btn ghost" onClick={() => setQuery("")}>Clear</button>
        </div>
      </div>

      <div className="rs-list">
        {matches.length === 0 ? (
          <div className="no-matches">
            No matches found. {query && "Try adjusting your search."}
          </div>
        ) : (
          matches.map(m => {
            const home = teams.find(t => t.id === m.homeTeamId);
            const away = teams.find(t => t.id === m.awayTeamId);

            // Fallback names if teams aren't found
            const homeName = home?.name || `Team ${m.homeTeamId}`;
            const awayName = away?.name || `Team ${m.awayTeamId}`;

            return (
              <div key={m.id} className="fan-match-card">
                <div className="teams">
                  {homeName} <span className="vs">vs</span> {awayName}
                  <div className="meta">{m.date}</div>
                </div>
                <div className="actions">
                  <div className="score">{m.homeScore} - {m.awayScore}</div>
                  <button className="rs-btn ghost" onClick={() => { navigator.clipboard?.writeText(`${homeName} ${m.homeScore}-${m.awayScore} ${awayName}`); alert("Copied score to clipboard"); }}>Share</button>
                  <button className="rs-btn" onClick={() => onOpen(m.id)}>Details</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MatchesList;
