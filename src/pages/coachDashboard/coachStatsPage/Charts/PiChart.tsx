// src/pages/coachDashboard/charts/WinsChart.tsx
import React from 'react';
import { Doughnut } from "react-chartjs-2";

interface Props {
  label: string[];
  values: number[];
  title: string;
}

const PiChart: React.FC<Props> = ({ label, values, title }) => (
  <section className="chart-container">
    <Doughnut
      data={{
        labels: label,
        datasets: [
          {
            label: title,
            data: values,
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",   // Blue-500
              "rgba(139, 92, 246, 0.8)",   // Violet-500
              "rgba(16, 185, 129, 0.8)",   // Emerald-500
              "rgba(251, 191, 36, 0.8)",   // Amber-400
              "rgba(236, 72, 153, 0.8)",   // Fuchsia-500
            ],
            borderColor: [
              "rgba(255, 255, 255, 1)", // clean white border between slices
            ],
            borderWidth: 2,
            hoverOffset: 20, // adds a nice "pop-out" on hover
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "30%", // makes it more like a sleek ring chart
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 20,
             
            },
            color: "#1f2937", // gray-800
          },
          legend: {
            position: "bottom",
            labels: {
              color: "#374151", // gray-700
              font: {
                size: 13,
              },
              padding: 16,
              usePointStyle: true, // round dots instead of squares
            },
          },
        },
      }}
    />
  </section>
);

export default PiChart;
