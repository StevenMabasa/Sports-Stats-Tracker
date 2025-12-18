// src/components/PlayerManagement/stats-helper.ts
import type { Player } from '../../../types';

const positionGroups = {
  GK: ['GK'],
  DEF: ['CB', 'RB', 'LB','RWB','LWB'],
  MID: ['CDM',"CM","CAM","LM","RM"],
  STR: ['ST',"CF","LW","RW"]
};

export const getPlayerKeyStats = (player: Player) => {
  const { stats, position } = player;
  let keyStats = [];
  let chartStat = { label: 'Performance', dataKey: '' };

  if (positionGroups.GK.includes(position)) {
    keyStats = [
      { label: 'Saves', value: stats.saves },
      { label: 'Save %', value: `${stats.savePercentage}%` },
      { label: 'Clean Sheets', value: stats.cleansheets }
    ];
    chartStat = { label: 'Saves', dataKey: 'saves' };
  } else if (positionGroups.DEF.includes(position)) {
    keyStats = [
      { label: 'Tackles', value: stats.tackles },
      { label: 'Interceptions', value: stats.interceptions },
      { label: 'Pass %', value: `${stats.passCompletion}%` }
    ];
    chartStat = { label: 'Tackles', dataKey: 'tackles' };
  } else if (positionGroups.MID.includes(position)) {
    keyStats = [
      { label: 'Goals', value: stats.goals },
      { label: 'Assists', value: stats.assists },
      { label: 'Pass %', value: `${stats.passCompletion}%` }
    ];
    chartStat = { label: 'Assists', dataKey: 'assists' };
  } else if (positionGroups.STR.includes(position)) {
    const shotAccuracy = stats.shots > 0 
      ? Math.round((stats.shotsOnTarget / stats.shots) * 100) 
      : 0;
    keyStats = [
      { label: 'Goals', value: stats.goals },
      { label: 'Shots', value: stats.shots },
      { label: 'Shot Accuracy', value: `${shotAccuracy}%` }
    ];
    chartStat = { label: 'Goals', dataKey: 'goals' };
  } else {
    // Default fallback
    keyStats = [
      { label: 'Goals', value: stats.goals },
      { label: 'Assists', value: stats.assists },
      { label: 'Minutes', value: stats.minutesPlayed }
    ];
    chartStat = { label: 'Goals', dataKey: 'goals' };
  }

  return { keyStats, chartStat };
};

// Helper function to get position-specific stats for display
export const getPositionSpecificStats = (player: Player) => {
  const { stats, position } = player;
  
  // Define the stat item type
  interface StatItem {
    label: string;
    value: string | number;
  }
  
  const generalStats: StatItem[] = [
    { label: 'Goals', value: stats.goals },
    { label: 'Assists', value: stats.assists },
    { label: 'Yellow Cards', value: stats.yellowCards },
    { label: 'Red Cards', value: stats.redCards },
    { label: 'Minutes Played', value: stats.minutesPlayed }
  ];

  let positionStats: StatItem[] = [];

  if (positionGroups.GK.includes(position)) {
    positionStats = [
      { label: 'Saves', value: stats.saves },
      { label: 'Clean Sheets', value: stats.cleansheets },
      { label: 'Save Percentage', value: `${stats.savePercentage}%` },
      { label: 'Clearances', value: stats.clearances }
    ];
  } else if (positionGroups.DEF.includes(position)) {
    positionStats = [
      { label: 'Tackles', value: stats.tackles },
      { label: 'Interceptions', value: stats.interceptions },
      { label: 'Clearances', value: stats.clearances },
      { label: 'Pass Completion', value: `${stats.passCompletion}%` }
    ];
  } else if (positionGroups.MID.includes(position)) {
    const dribbleSuccess = stats.dribblesAttempted > 0 
      ? Math.round((stats.dribblesSuccessful / stats.dribblesAttempted) * 100) 
      : 0;
    positionStats = [
      { label: 'Assists', value: stats.assists },
      { label: 'Pass Completion', value: `${stats.passCompletion}%` },
      { label: 'Dribbles Attempted', value: stats.dribblesAttempted },
      { label: 'Dribbles Successful', value: stats.dribblesSuccessful },
      { label: 'Dribble Success Rate', value: `${dribbleSuccess}%` },
      { label: 'Tackles', value: stats.tackles },
      { label: 'Offsides', value: stats.offsides }
    ];
  } else if (positionGroups.STR.includes(position)) {
    const shotAccuracy = stats.shots > 0 
      ? Math.round((stats.shotsOnTarget / stats.shots) * 100) 
      : 0;
    const dribbleSuccess = stats.dribblesAttempted > 0 
      ? Math.round((stats.dribblesSuccessful / stats.dribblesAttempted) * 100) 
      : 0;
    positionStats = [
      { label: 'Shots', value: stats.shots },
      { label: 'Shots On Target', value: stats.shotsOnTarget },
      { label: 'Shot Accuracy', value: `${shotAccuracy}%` },
      { label: 'Dribbles Attempted', value: stats.dribblesAttempted },
      { label: 'Dribbles Successful', value: stats.dribblesSuccessful },
      { label: 'Dribble Success Rate', value: `${dribbleSuccess}%` },
      { label: 'Offsides', value: stats.offsides }
    ];
  }

  return { generalStats, positionStats };
};