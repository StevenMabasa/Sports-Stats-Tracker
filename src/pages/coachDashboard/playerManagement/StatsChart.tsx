// src/components/PlayerManagement/StatsChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  data: number[];
}

const StatsChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((value, index) => ({
    name: `M${index + 1}`,
    value: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip cursor={{fill: 'rgba(11, 99, 216, 0.1)'}}/>
        <Bar dataKey="value" fill="#0b63d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StatsChart;