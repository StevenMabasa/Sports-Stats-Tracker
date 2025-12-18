// src/pages/coachDashboard/TeamShotsChart.tsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { Match } from "../../../../types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  matches: Match[];
}

const TeamShotsChart: React.FC<Props> = ({ matches }) => {
  
  const labels = matches.map((_, i) => `Match ${i + 1}`).reverse();

  const data = {
    labels,
    datasets: [
      {
        label: "Shots",
        data: matches.map((m) => m.shots || 0).reverse(),
        backgroundColor: "rgba(11, 99, 216, 0.7)",
      },
      {
        label: "Shots on Target",
        data: matches.map((m) => m.shotsOnTarget || 0).reverse(),
        backgroundColor: "rgba(244, 63, 94, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <section className='graph'>
   
      <Bar data={data} options={options} />
   
    </section>
  );
};

export default TeamShotsChart;