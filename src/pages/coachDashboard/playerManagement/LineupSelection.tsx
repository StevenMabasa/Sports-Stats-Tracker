// src/components/PlayerManagement/LineupSelection.tsx

import React, { useState, useRef, useEffect } from 'react';


export interface Player {
  id: string;
  name: string;
  jerseyNum: string;
  teamId: string;
  position: string;
  stats: PlayerStats;
  imageUrl: string;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
}

interface Props {
  lineup: Player[];
  onRemoveFromLineup: (playerId: string) => void;
  onPositionUpdate?: (playerId: string, x: number, y: number) => void;
}

// Simplified position mapping for field placement
const getPlayerFieldPosition = (position: string, playerIndex: number, totalPlayersInPosition: number) => {
  const positionMap: { [key: string]: { category: string; baseY: number } } = {
    'GK': { category: 'goalkeeper', baseY: 85 },
    'CB': { category: 'defender', baseY: 70 },
    'LB': { category: 'defender', baseY: 70 },
    'RB': { category: 'defender', baseY: 70 },
    'LWB': { category: 'defender', baseY: 70 },
    'RWB': { category: 'defender', baseY: 70 },
    'DEF': { category: 'defender', baseY: 70 },
    'CDM': { category: 'midfielder', baseY: 50 },
    'CM': { category: 'midfielder', baseY: 50 },
    'CAM': { category: 'midfielder', baseY: 50 },
    'LM': { category: 'midfielder', baseY: 50 },
    'RM': { category: 'midfielder', baseY: 50 },
    'MID': { category: 'midfielder', baseY: 50 },
    'LW': { category: 'forward', baseY: 25 },
    'RW': { category: 'forward', baseY: 25 },
    'ST': { category: 'forward', baseY: 25 },
    'CF': { category: 'forward', baseY: 25 },
    'STR': { category: 'forward', baseY: 25 }
  };
  
  const fieldPos = positionMap[position.toUpperCase()] || { category: 'midfielder', baseY: 50 };
  
  // Calculate horizontal spread based on position and number of players
  let x = 50; // Default center
  if (fieldPos.category === 'goalkeeper') {
    x = 50; // Always center for goalkeeper
  } else if (totalPlayersInPosition === 1) {
    x = 50; // Center if only one player
  } else {
    // Spread players horizontally
    const spacing = 80 / (totalPlayersInPosition - 1); // 80% of field width
    const startX = 10; // Start at 10% from left
    x = startX + (playerIndex * spacing);
  }
  
  return { category: fieldPos.category, x, y: fieldPos.baseY };
};

interface DraggedPlayer {
  id: string;
  x: number;
  y: number;
}

const LineupSelection: React.FC<Props> = ({ lineup, onRemoveFromLineup, onPositionUpdate }) => {
  const [draggedPlayer, setDraggedPlayer] = useState<DraggedPlayer | null>(null);
  const [playerPositions, setPlayerPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const fieldRef = useRef<HTMLDivElement>(null);

  // Initialize player positions based on their positions with horizontal spreading
  useEffect(() => {
    const positions: { [key: string]: { x: number; y: number } } = {};
    
    // Group players by position category
    const goalkeepers = lineup.filter(p => getPlayerFieldPosition(p.position, 0, 1).category === 'goalkeeper');
    const defenders = lineup.filter(p => getPlayerFieldPosition(p.position, 0, 1).category === 'defender');
    const midfielders = lineup.filter(p => getPlayerFieldPosition(p.position, 0, 1).category === 'midfielder');
    const forwards = lineup.filter(p => getPlayerFieldPosition(p.position, 0, 1).category === 'forward');
    
    // Position goalkeepers
    goalkeepers.forEach((player, index) => {
      const fieldPos = getPlayerFieldPosition(player.position, index, goalkeepers.length);
      positions[player.id] = { x: fieldPos.x, y: fieldPos.y };
    });
    
    // Position defenders
    defenders.forEach((player, index) => {
      const fieldPos = getPlayerFieldPosition(player.position, index, defenders.length);
      positions[player.id] = { x: fieldPos.x, y: fieldPos.y };
    });
    
    // Position midfielders
    midfielders.forEach((player, index) => {
      const fieldPos = getPlayerFieldPosition(player.position, index, midfielders.length);
      positions[player.id] = { x: fieldPos.x, y: fieldPos.y };
    });
    
    // Position forwards
    forwards.forEach((player, index) => {
      const fieldPos = getPlayerFieldPosition(player.position, index, forwards.length);
      positions[player.id] = { x: fieldPos.x, y: fieldPos.y };
    });
    
    setPlayerPositions(positions);
  }, [lineup]);

  const handleMouseDown = (e: React.MouseEvent, playerId: string) => {
    e.preventDefault();
    if (!fieldRef.current) return;

    const fieldRect = fieldRef.current.getBoundingClientRect();
    const x = ((e.clientX - fieldRect.left) / fieldRect.width) * 100;
    const y = ((e.clientY - fieldRect.top) / fieldRect.height) * 100;

    setDraggedPlayer({ id: playerId, x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPlayer || !fieldRef.current) return;

    const fieldRect = fieldRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - fieldRect.left) / fieldRect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - fieldRect.top) / fieldRect.height) * 100));

    setDraggedPlayer({ ...draggedPlayer, x, y });
  };

  const handleMouseUp = () => {
    if (draggedPlayer) {
      setPlayerPositions(prev => ({
        ...prev,
        [draggedPlayer.id]: { x: draggedPlayer.x, y: draggedPlayer.y }
      }));
      
      // Call the position update callback if provided
      if (onPositionUpdate) {
        onPositionUpdate(draggedPlayer.id, draggedPlayer.x, draggedPlayer.y);
      }
      
      setDraggedPlayer(null);
    }
  };

  // Add event listeners for mouse up outside the field
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (draggedPlayer) {
        setPlayerPositions(prev => ({
          ...prev,
          [draggedPlayer.id]: { x: draggedPlayer.x, y: draggedPlayer.y }
        }));
        
        // Call the position update callback if provided
        if (onPositionUpdate) {
          onPositionUpdate(draggedPlayer.id, draggedPlayer.x, draggedPlayer.y);
        }
        
        setDraggedPlayer(null);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [draggedPlayer, onPositionUpdate]);

  return (
    <section className="management-section lineup-section">
      <h2 className="section-title">Starting Lineup</h2>
      {lineup.length === 0 ? (
        <p className="empty-message">Add players from the roster to build your lineup.</p>
      ) : (
        <div className="soccer-field">
          <div 
            className="field-container" 
            ref={fieldRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Field background */}
            <div className="field-background">
              <div className="center-circle"></div>
              <div className="center-line"></div>
              <div className="penalty-area-left"></div>
              <div className="penalty-area-right"></div>
              <div className="goal-area-left"></div>
              <div className="goal-area-right"></div>
            </div>
            
            {/* Draggable players positioned on field */}
            {lineup.map(player => {
              const position = playerPositions[player.id] || { x: 50, y: 50 };
              const fieldPos = getPlayerFieldPosition(player.position, 0, 1);
              const isDragging = draggedPlayer?.id === player.id;
              const displayPosition = isDragging ? draggedPlayer! : position;
              const category = fieldPos.category;

              return (
                <div
                  key={player.id}
                  className={`draggable-player ${category} ${isDragging ? 'dragging' : ''}`}
                  style={{
                    left: `${displayPosition.x}%`,
                    top: `${displayPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute',
                    zIndex: isDragging ? 1000 : 10,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, player.id)}
                >
                  <div className="player-marker">
                    <span className="jersey-number">{player.jerseyNum}</span>
                    <span className="player-name">{player.name}</span>
                    <button 
                      type="button"
                      onMouseDown={(e) => { e.stopPropagation(); }}
                      onMouseUp={(e) => { e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromLineup(player.id);
                      }} 
                      className="remove-player-btn"
                      title="Remove from lineup"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formation display */}
          <div className="formation-display">
            <h3>Formation: {lineup.filter(p => getPlayerFieldPosition(p.position, 0, 1).category === 'defender').length}-{lineup.filter(p => getPlayerFieldPosition(p.position, 0, 1).category === 'midfielder').length}-{lineup.filter(p => getPlayerFieldPosition(p.position, 0, 1).category === 'forward').length}</h3>
            <p>Total Players: {lineup.length}/11</p>
            <p className="drag-instruction">💡 Drag players to reposition them on the field</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default LineupSelection;