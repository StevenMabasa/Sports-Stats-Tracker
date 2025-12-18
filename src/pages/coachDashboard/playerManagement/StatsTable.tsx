// src/components/PlayerManagement/StatsTable.tsx
import React from 'react';
import type { Player } from '../../../types';
import { getPositionSpecificStats } from './stats-helper';

interface Props {
  player: Player; // Changed from stats to player to get position info
}

const StatsTable: React.FC<Props> = ({ player }) => {
  const { generalStats, positionStats } = getPositionSpecificStats(player);

  return (
    <div className="stats-table">
      {/* General Stats Section */}
      <div className="stats-section">
        <h4 className="stats-section-title">General Statistics</h4>
        {generalStats.map((stat, index) => (
          <div key={`general-${index}`} className="stat-row">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Position-Specific Stats Section */}
      {positionStats.length > 0 && (
        <div className="stats-section">
          <h4 className="stats-section-title">
            {player.position} Statistics
          </h4>
          {positionStats.map((stat, index) => (
            <div key={`position-${index}`} className="stat-row">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsTable;