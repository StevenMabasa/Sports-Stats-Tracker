// src/pages/coachDashboard/StatCard.tsx
import React from 'react';
import './StatCard.css';

interface Props {
  label: string;
  value: string | number;
}

const StatCard: React.FC<Props> = ({ label, value }) => (
  
    <article className="the-card">
      <header>
        {label}
      </header>
      <section className='stat'>
        {value}
      </section>
    </article>
  
);

export default StatCard;