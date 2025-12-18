// src/components/PlayerCard/PlayerCard.tsx
import React from 'react';
import './PlayerCard.css';

interface PlayerCardProps {
  imageUrl: string;
  name: string;
  jerseyNum: string;
  position: string;
  children?: React.ReactNode; // Allow buttons or other elements to be passed in
}

const PlayerCard: React.FC<PlayerCardProps> = ({ name, position, children,jerseyNum }) => {
  return (
    <article className="player-card">
      {/* <figure className="player-figure">
        <img src={imageUrl} alt={name} className="player-image" />
        <figcaption className="player-info">
          
        </figcaption>
      </figure> */}
      <h2 className="player-nam">{name}</h2>
          <p className="player-position">{jerseyNum}</p>
          <p className="player-position">{position}</p>
      {children && <div className="player-card-actions">{children}</div>}
    </article>
  );
};

export default PlayerCard;