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

// The main Match object, with team-level stats - matches database schema exactly
export interface Match {
  id: string;
  teamId: string; // Your team's ID
  opponentName: string;
  teamScore: number;
  opponentScore: number;
  date: string;
  status: 'scheduled' | 'completed';
  // Team-level stats - all from database, no stubs
  possession?: number; // Your team's possession %
  shots?: number;
  shotsOnTarget?: number;
  corners?: number;
  fouls?: number;
  offsides?: number;
  passes?: number;
  passAccuracy?: number; // %
  tackles?: number;
  saves?: number;
}

// Database record interfaces for type safety
export interface DbMatchRecord {
  id: string;
  team_id: string;
  opponent_name: string;
  team_score: number;
  opponent_score: number;
  date: string;
  status: 'scheduled' | 'completed';
  possession?: number;
  shots?: number;
  shots_on_target?: number;
  corners?: number;
  fouls?: number;
  offsides?: number;
  passes?: number;
  pass_accuracy?: number;
  tackles?: number;
  saves?: number;
}

export interface DbPlayerStatsRecord {
  id: string;
  player_id: string;
  match_id: string;
  goals: number;
  assists: number;
  shots: number;
  shots_on_target: number;
  chances_created: number;
  dribbles_attempted: number;
  dribbles_successful: number;
  offsides: number;
  tackles: number;
  interceptions: number;
  clearances: number;
  saves: number;
  clean_sheets: number;
  save_percentage: number;
  pass_completion: number;
  minutes_played: number;
  yellow_cards: number;
  red_cards: number;
  // Position-specific stats (matching actual DB schema)
  passes_successful?: number;
  passes_attempted?: number;
  goals_conceded?: number;
  created_at: string;
  updated_at: string;
}

// Add missing DbMatchEventRecord interface
export interface DbMatchEventRecord {
  id: string;
  match_id: string;
  player_id: string;
  event_type: 'goal' | 'assist' | 'yellow_card' | 'red_card';
  minute?: number;
  created_at: string;
}

// Helper function to create default stats for any position
export const createPositionDefaultStats = (_position: string): PlayerStats => {
  return {
    // Attacking
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    chancesCreated: 0,
    dribblesAttempted: 0,
    dribblesSuccessful: 0,
    offsides: 0,
    // Defending
    tackles: 0,
    interceptions: 0,
    clearances: 0,
    // Goalkeeping
    saves: 0,
    cleansheets: 0,
    savePercentage: 0,
    // General
    passCompletion: 0,
    minutesPlayed: 0,
    yellowCards: 0,
    redCards: 0,
    // Data for the graph (e.g., goals over the last 5 matches)
    performanceData: [0, 0, 0, 0, 0],
  };
};