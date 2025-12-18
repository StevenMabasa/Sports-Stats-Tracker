// src/pages/coachDashboard/charts/GoalsChart.tsx
import React from 'react';
import { Bar } from "react-chartjs-2";

interface Props {
  label: string[];
  values: number[];
  title: string;
}

const BarChart: React.FC<Props> = ({ label, values, title }) => (
  <section className='chart-container'>
    <Bar
      data={{
        labels: label,
        datasets: [
          {
            label: title,
            data: values,
            backgroundColor: [
              "rgba(59, 130, 246, 0.7)",   // Blue-500 (sleek primary)
              "rgba(139, 92, 246, 0.7)",   // Violet-500 (modern accent)
              "rgba(236, 72, 153, 0.7)",   // Fuchsia-500 (fresh pop)
              "rgba(20, 184, 166, 0.7)",   // Teal-500 (balanced tone)
              "rgba(251, 191, 36, 0.7)",   // Amber-400 (warm highlight)
            ],
            borderColor: [
              "rgba(59, 130, 246, 1)",
              "rgba(139, 92, 246, 1)",
              "rgba(236, 72, 153, 1)",
              "rgba(20, 184, 166, 1)",
              "rgba(251, 191, 36, 1)",
            ],
            borderWidth: 2,
            borderRadius: 6, // smooth rounded bars
            barThickness: 40, // cleaner width
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 18,
            },
            color: "#1f2937", // gray-800 for sleek text
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false, // cleaner look
            },
            ticks: {
              color: "#6b7280", // gray-500
              font: {
                size: 13,
              },
            },
          },
          y: {
            grid: {
              color: "rgba(229, 231, 235, 0.5)", // subtle gray grid
            },
            ticks: {
              color: "#6b7280",
              font: {
                size: 13,
              },
            },
          },
        },
      }}
    />
  </section>
);

export default BarChart;
