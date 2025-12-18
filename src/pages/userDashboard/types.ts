// types.ts - Your original types with added helper function

// Attacking
export interface PlayerStats {
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  chancesCreated: number;
  dribblesAttempted: number;
  dribblesSuccessful: number;
  offsides: number;
  // Defending
  tackles: number;
  interceptions: number;
  clearances: number;
  // Goalkeeping
  saves: number;
  cleansheets: number;
  savePercentage: number;
  // General
  passCompletion: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  // Data for the graph (e.g., goals over the last 5 matches)
  performanceData: number[];
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: string; // 'GK', 'DEF', 'RB', 'STR', 'LB', 'MID'
  jerseyNum: string;
  stats: PlayerStats;
  imageUrl: string;
}

export interface Team {
  id: string;
  name: string;
  coachId: string;
}

// Events within a match
export interface MatchEvent {
  id: string;
  matchId: string;
  playerId: string;
  eventType: 'goal' | 'assist' | 'yellow_card' | 'red_card';
  minute?: number; // Optional: The minute the event occurred
}

// The main Match object, with team-level stats
export interface Match {
  id: string;
  teamId: string; // Your team's ID
  opponentName: string;
  teamScore: number;
  opponentScore: number;
  date: string;
  status: 'scheduled' | 'completed';
  // Team-level stats
  possession?: number; // Your team's possession %
  shots?: number;
  shotsOnTarget?: number;
  corners?: number;
  fouls?: number;
  offsides?: number; // Expected goals
  passes?: number;
  passAccuracy?: number; // %
  tackles?: number;
  saves?: number;
}

// Helper function to create position-specific default stats
export const createPositionDefaultStats = (_position: string): PlayerStats => {
  const baseStats: PlayerStats = {
    // General stats for all positions
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    chancesCreated: 0,
    dribblesAttempted: 0,
    dribblesSuccessful: 0,
    offsides: 0,
    tackles: 0,
    interceptions: 0,
    clearances: 0,
    saves: 0,
    cleansheets: 0,
    savePercentage: 0,
    passCompletion: 0,
    minutesPlayed: 0,
    yellowCards: 0,
    redCards: 0,
    performanceData: [0, 0, 0, 0, 0],
  };

  return baseStats;
};