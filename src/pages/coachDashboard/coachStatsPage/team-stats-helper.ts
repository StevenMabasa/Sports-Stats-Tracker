// src/pages/coachDashboard/team-stats-helper.ts
import type { Match } from '../../../types';

export const calculateTeamStats = (matches: Match[]) => {
  if (matches.length === 0) return null;

  const totalMatches = matches.length;
  const wins = matches.filter(m => m.teamScore > m.opponentScore).length;
  const draws = matches.filter(m => m.teamScore === m.opponentScore).length;
  const losses = totalMatches - wins - draws;

  const goalsFor = matches.reduce((sum, m) => sum + m.teamScore, 0);
  const goalsAgainst = matches.reduce((sum, m) => sum + m.opponentScore, 0);
  const goalDifference = goalsFor - goalsAgainst;

  // Ensure all stats come from database - no hardcoded values
  const totalShots = matches.reduce((sum, m) => sum + (m.shots || 0), 0);
  const totalPossession = matches.reduce((sum, m) => sum + (m.possession || 0), 0);
  const totalFouls = matches.reduce((sum, m) => sum + (m.fouls || 0), 0);
  const totalShotsOnTarget = matches.reduce((sum, m) => sum + (m.shotsOnTarget || 0), 0);
  const totalCorners = matches.reduce((sum, m) => sum + (m.corners || 0), 0);
  const totalOffsides = matches.reduce((sum, m) => sum + (m.offsides || 0), 0);
  const totalPasses = matches.reduce((sum, m) => sum + (m.passes || 0), 0);
  const totalPassAccuracy = matches.reduce((sum, m) => sum + (m.passAccuracy || 0), 0);
  const totalTackles = matches.reduce((sum, m) => sum + (m.tackles || 0), 0);
  const totalSaves = matches.reduce((sum, m) => sum + (m.saves || 0), 0);


  // Form is the result of the last 5 matches (W, D, L)
  const form = matches.slice(0, 5).map(m => {
    if (m.teamScore > m.opponentScore) return 'W';
    if (m.teamScore < m.opponentScore) return 'L';
    return 'D';
  });

  return {
    totalTackles,
    totalFouls,
    totalPasses,
    totalMatches,
    totalShots,
    totalShotsOnTarget,
    wins,
    draws,
    losses,
    winPercentage: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
    goalsFor,
    goalsAgainst,
    goalDifference,
    avgGoalsFor: totalMatches > 0 ? (goalsFor / totalMatches).toFixed(2) : 0,
    avgGoalsAgainst: totalMatches > 0 ? (goalsAgainst / totalMatches).toFixed(2) : 0,
    avgShots: totalMatches > 0 ? (totalShots / totalMatches).toFixed(2) : 0,
    avgShotsOnTarget: totalMatches > 0 ? (totalShotsOnTarget / totalMatches).toFixed(2) : 0,
    avgPossession: totalMatches > 0 ? Math.round(totalPossession / totalMatches) : 0,
    avgFouls: totalMatches > 0 ? (totalFouls / totalMatches).toFixed(2) : 0,
    avgCorners: totalMatches > 0 ? (totalCorners / totalMatches).toFixed(2) : 0,
    avgOffsides: totalMatches > 0 ? (totalOffsides / totalMatches).toFixed(2) : 0,
    avgPasses: totalMatches > 0 ? (totalPasses / totalMatches).toFixed(2) : 0,
    avgPassAccuracy: totalMatches > 0 ? (totalPassAccuracy / totalMatches).toFixed(2) : 0,
    avgTackles: totalMatches > 0 ? (totalTackles / totalMatches).toFixed(2) : 0,
    avgSaves: totalMatches > 0 ? (totalSaves / totalMatches).toFixed(2) : 0,
    form,
  };
};