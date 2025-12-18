// pages/userDashboard/MatchDetail.tsx
import React from "react";
import type { UiMatch, UiTeam, UiPlayer } from "./hooks/useDbData";

interface Props { match: UiMatch; homeTeam?: UiTeam|null; awayTeam?: UiTeam|null; players: UiPlayer[]; }
const MatchDetail: React.FC<Props> = ({ match, homeTeam, awayTeam, players }) => {
  if (!match) return null;
  return (
    <div className="rs-detail rs-card">
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:18,fontWeight:900}}>{homeTeam?.name} vs {awayTeam?.name}</div>
          <div style={{color:"var(--muted)"}}>{match.date} • {match.status}</div>
        </div>
        <div style={{fontSize:20,fontWeight:900}}>{match.homeScore} - {match.awayScore}</div>
      </div>
      <hr/>
      <div style={{display:"flex",gap:12}}>
        <div style={{flex:1}}>
          <h4 style={{margin:0,color:"var(--primary)"}}>{homeTeam?.name}</h4>
          {players.filter(p=>p.teamId===homeTeam?.id).map(p=>(<div key={p.id}>{p.name} • {p.position} • ⚽ {p.stats.goals}</div>))}
        </div>
        <div style={{flex:1}}>
          <h4 style={{margin:0,color:"var(--primary)"}}>{awayTeam?.name}</h4>
          {players.filter(p=>p.teamId===awayTeam?.id).map(p=>(<div key={p.id}>{p.name} • {p.position} • ⚽ {p.stats.goals}</div>))}
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
