// src/components/PlayerManagement/KeyStatCard.tsx
import React from 'react';

interface Props {
  label: string;
  value: string | number;
}

const KeyStatCard: React.FC<Props> = ({ label, value }) => {
  return (
    <article className="rs-card key-stat-card">
      <section className="stat-value">{value}</section>
      <section className="stat-label">{label}</section>
    </article>
  );
};

export default KeyStatCard;