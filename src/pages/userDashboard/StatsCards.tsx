// pages/userDashboard/StatsCards.tsx
import "./StatCard.css" 
import React from "react";
import type { UiPlayer } from "./hooks/useDbData";

interface Props { 
  teams: number; 
  players: number; 
  matches: number; 
  playersWithStats?: UiPlayer[];
}

const StatsCards: React.FC<Props> = ({ teams, players, matches, playersWithStats = [] }) => {
  // Calculate some basic stats from players
  const totalMinutes = playersWithStats.reduce((sum, player) => sum + (player.stats?.minutesPlayed || 0), 0);
  
  return (
    <section className="rs-stats">
      <div className="rs-card">
        <h3>Total Teams</h3>
        <div>{teams}</div>
      </div>
      <div className="rs-card">
        <h3>Total Players</h3>
        <div>{players}</div>
      </div>
      <div className="rs-card">
        <h3>Matches</h3>
        <div>{matches}</div>
      </div>
     
      {totalMinutes > 0 && (
        <div className="rs-card">
          <h3>Total Minutes</h3>
          <div>{totalMinutes}</div>
        </div>
      )}
    </section>
  );
};

export default StatsCards;
