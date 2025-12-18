// src/pages/coachDashboard/TeamPerformanceChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { Match } from '../../../types';

interface Props {
  matches: Match[];
}

const TeamPerformanceChart: React.FC<Props> = ({ matches }) => {
  const chartData = matches.map((match, index) => ({
    name: `Match ${index + 1}`,
    Goals_For: match.teamScore,
    Goals_Against: match.opponentScore,
  })).reverse(); // Reverse to show chronological order

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Goals_For" stroke="#0b63d8" strokeWidth={2} />
          <Line type="monotone" dataKey="Goals_Against" stroke="#f43f5e" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeamPerformanceChart;