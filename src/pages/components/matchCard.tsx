import React from 'react';
import './Matchcard.css';

interface MatchCardProps {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ teamA, teamB, scoreA, scoreB, date }) => {
  return (
    <article className="match-card">
      <div className="match-teams">
        <span className="name">{teamA}</span>
        <span className="score">{scoreA} - {scoreB}</span>
        <span className="name">{teamB}</span>
      </div>
      <div className="match-date">{new Date(date).toLocaleDateString()}</div>
    </article>
  );
};

export default MatchCard;
