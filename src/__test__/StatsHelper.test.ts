import { describe, it, expect } from 'vitest';
import { getPlayerKeyStats, getPositionSpecificStats } from '../pages/coachDashboard/playerManagement/stats-helper';
import type { Player } from '../types';

// Mock player data for different positions
const createMockPlayer = (position: string, statsOverrides = {}): Player => ({
  id: 'test-player-1',
  name: 'Test Player',
  position,
  jerseyNum: "10",
  teamId: 'team-1',
  imageUrl: 'https://example.com/avatar.png',
  stats: {
    goals: 5,
    assists: 3,
    yellowCards: 2,
    redCards: 0,
    minutesPlayed: 1200,
    saves: 45,
    savePercentage: 78,
    cleansheets: 8,
    tackles: 25,
    interceptions: 15,
    clearances: 30,
    passCompletion: 85,
    shots: 20,
    shotsOnTarget: 12,
    dribblesAttempted: 10,
    dribblesSuccessful: 7,
    offsides: 3,
    ...statsOverrides,
    chancesCreated: 0,
    performanceData: []
  }
});

describe('stats-helper', () => {
  describe('Unit Tests', () =>{
describe('getPlayerKeyStats', () => {
    describe('Goalkeeper (GK)', () => {
      it('should return goalkeeper-specific key stats', () => {
        const player = createMockPlayer('GK');
        const result = getPlayerKeyStats(player);

        expect(result.keyStats).toEqual([
          { label: 'Saves', value: 45 },
          { label: 'Save %', value: '78%' },
          { label: 'Clean Sheets', value: 8 }
        ]);
        expect(result.chartStat).toEqual({ label: 'Saves', dataKey: 'saves' });
      });

      it('should handle goalkeeper with zero saves', () => {
        const player = createMockPlayer('GK', { saves: 0, savePercentage: 0, cleansheets: 0 });
        const result = getPlayerKeyStats(player);

        expect(result.keyStats).toEqual([
          { label: 'Saves', value: 0 },
          { label: 'Save %', value: '0%' },
          { label: 'Clean Sheets', value: 0 }
        ]);
      });
    });

    describe('Defenders', () => {
      const defenderPositions = ['CB', 'RB', 'LB', 'RWB', 'LWB'];
      
      defenderPositions.forEach(position => {
        it(`should return defender-specific key stats for ${position}`, () => {
          const player = createMockPlayer(position);
          const result = getPlayerKeyStats(player);

          expect(result.keyStats).toEqual([
            { label: 'Tackles', value: 25 },
            { label: 'Interceptions', value: 15 },
            { label: 'Pass %', value: '85%' }
          ]);
          expect(result.chartStat).toEqual({ label: 'Tackles', dataKey: 'tackles' });
        });
      });

      it('should handle defender with zero defensive stats', () => {
        const player = createMockPlayer('CB', { tackles: 0, interceptions: 0, passCompletion: 0 });
        const result = getPlayerKeyStats(player);

        expect(result.keyStats).toEqual([
          { label: 'Tackles', value: 0 },
          { label: 'Interceptions', value: 0 },
          { label: 'Pass %', value: '0%' }
        ]);
      });
    });

    describe('Midfielders', () => {
      const midfielderPositions = ['CDM', 'CM', 'CAM', 'LM', 'RM'];
      
      midfielderPositions.forEach(position => {
        it(`should return midfielder-specific key stats for ${position}`, () => {
          const player = createMockPlayer(position);
          const result = getPlayerKeyStats(player);

          expect(result.keyStats).toEqual([
            { label: 'Goals', value: 5 },
            { label: 'Assists', value: 3 },
            { label: 'Pass %', value: '85%' }
          ]);
          expect(result.chartStat).toEqual({ label: 'Assists', dataKey: 'assists' });
        });
      });

      it('should handle midfielder with zero attacking stats', () => {
        const player = createMockPlayer('CM', { goals: 0, assists: 0, passCompletion: 0 });
        const result = getPlayerKeyStats(player);

        expect(result.keyStats).toEqual([
          { label: 'Goals', value: 0 },
          { label: 'Assists', value: 0 },
          { label: 'Pass %', value: '0%' }
        ]);
      });
    });

    describe('Strikers/Forwards', () => {
      const strikerPositions = ['ST', 'CF', 'LW', 'RW'];
      
      strikerPositions.forEach(position => {
        it(`should return striker-specific key stats for ${position}`, () => {
          const player = createMockPlayer(position);
          const result = getPlayerKeyStats(player);
          
          const expectedShotAccuracy = Math.round((12 / 20) * 100); // 60%

          expect(result.keyStats).toEqual([
            { label: 'Goals', value: 5 },
            { label: 'Shots', value: 20 },
            { label: 'Shot Accuracy', value: `${expectedShotAccuracy}%` }
          ]);
          expect(result.chartStat).toEqual({ label: 'Goals', dataKey: 'goals' });
        });
      });

      it('should handle striker with zero shots', () => {
        const player = createMockPlayer('ST', { shots: 0, shotsOnTarget: 0 });
        const result = getPlayerKeyStats(player);

        expect(result.keyStats).toEqual([
          { label: 'Goals', value: 5 },
          { label: 'Shots', value: 0 },
          { label: 'Shot Accuracy', value: '0%' }
        ]);
      });

      it('should handle striker with shots but no shots on target', () => {
        const player = createMockPlayer('ST', { shots: 15, shotsOnTarget: 0 });
        const result = getPlayerKeyStats(player);

        expect(result.keyStats[2]).toEqual({ label: 'Shot Accuracy', value: '0%' });
      });

      it('should round shot accuracy correctly', () => {
        const player = createMockPlayer('ST', { shots: 7, shotsOnTarget: 5 }); // 71.42...%
        const result = getPlayerKeyStats(player);

        expect(result.keyStats[2]).toEqual({ label: 'Shot Accuracy', value: '71%' });
      });
    });

    describe('Unknown/Default Position', () => {
      it('should return default stats for unknown position', () => {
        const player = createMockPlayer('UNKNOWN');
        const result = getPlayerKeyStats(player);

        expect(result.keyStats).toEqual([
          { label: 'Goals', value: 5 },
          { label: 'Assists', value: 3 },
          { label: 'Minutes', value: 1200 }
        ]);
        expect(result.chartStat).toEqual({ label: 'Goals', dataKey: 'goals' });
      });

      it('should handle empty string position', () => {
        const player = createMockPlayer('');
        const result = getPlayerKeyStats(player);

        expect(result.keyStats).toEqual([
          { label: 'Goals', value: 5 },
          { label: 'Assists', value: 3 },
          { label: 'Minutes', value: 1200 }
        ]);
      });
    });
  });

  describe('getPositionSpecificStats', () => {
    describe('General Stats (All Positions)', () => {
      it('should return consistent general stats for all positions', () => {
        const positions = ['GK', 'CB', 'CM', 'ST'];
        
        positions.forEach(position => {
          const player = createMockPlayer(position);
          const result = getPositionSpecificStats(player);

          expect(result.generalStats).toEqual([
            { label: 'Goals', value: 5 },
            { label: 'Assists', value: 3 },
            { label: 'Yellow Cards', value: 2 },
            { label: 'Red Cards', value: 0 },
            { label: 'Minutes Played', value: 1200 }
          ]);
        });
      });
    });

    describe('Goalkeeper Position Stats', () => {
      it('should return goalkeeper-specific position stats', () => {
        const player = createMockPlayer('GK');
        const result = getPositionSpecificStats(player);

        expect(result.positionStats).toEqual([
          { label: 'Saves', value: 45 },
          { label: 'Clean Sheets', value: 8 },
          { label: 'Save Percentage', value: '78%' },
          { label: 'Clearances', value: 30 }
        ]);
      });

      it('should handle goalkeeper with minimal stats', () => {
        const player = createMockPlayer('GK', { 
          saves: 0, 
          cleansheets: 0, 
          savePercentage: 0, 
          clearances: 0 
        });
        const result = getPositionSpecificStats(player);

        expect(result.positionStats).toEqual([
          { label: 'Saves', value: 0 },
          { label: 'Clean Sheets', value: 0 },
          { label: 'Save Percentage', value: '0%' },
          { label: 'Clearances', value: 0 }
        ]);
      });
    });

    describe('Defender Position Stats', () => {
      const defenderPositions = ['CB', 'RB', 'LB', 'RWB', 'LWB'];
      
      defenderPositions.forEach(position => {
        it(`should return defender-specific position stats for ${position}`, () => {
          const player = createMockPlayer(position);
          const result = getPositionSpecificStats(player);

          expect(result.positionStats).toEqual([
            { label: 'Tackles', value: 25 },
            { label: 'Interceptions', value: 15 },
            { label: 'Clearances', value: 30 },
            { label: 'Pass Completion', value: '85%' }
          ]);
        });
      });

      it('should handle defender with zero defensive stats', () => {
        const player = createMockPlayer('CB', { 
          tackles: 0, 
          interceptions: 0, 
          clearances: 0, 
          passCompletion: 0 
        });
        const result = getPositionSpecificStats(player);

        expect(result.positionStats).toEqual([
          { label: 'Tackles', value: 0 },
          { label: 'Interceptions', value: 0 },
          { label: 'Clearances', value: 0 },
          { label: 'Pass Completion', value: '0%' }
        ]);
      });
    });

    describe('Midfielder Position Stats', () => {
      const midfielderPositions = ['CDM', 'CM', 'CAM', 'LM', 'RM'];
      
      midfielderPositions.forEach(position => {
        it(`should return midfielder-specific position stats for ${position}`, () => {
          const player = createMockPlayer(position);
          const result = getPositionSpecificStats(player);
          
          const expectedDribbleSuccess = Math.round((7 / 10) * 100); // 70%

          expect(result.positionStats).toEqual([
            { label: 'Assists', value: 3 },
            { label: 'Pass Completion', value: '85%' },
            { label: 'Dribbles Attempted', value: 10 },
            { label: 'Dribbles Successful', value: 7 },
            { label: 'Dribble Success Rate', value: `${expectedDribbleSuccess}%` },
            { label: 'Tackles', value: 25 },
            { label: 'Offsides', value: 3 }
          ]);
        });
      });

      it('should handle midfielder with zero dribbles attempted', () => {
        const player = createMockPlayer('CM', { dribblesAttempted: 0, dribblesSuccessful: 0 });
        const result = getPositionSpecificStats(player);

        const dribbleSuccessStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Dribble Success Rate');
        expect(dribbleSuccessStat).toEqual({ label: 'Dribble Success Rate', value: '0%' });
      });

      it('should handle midfielder with failed dribbles', () => {
        const player = createMockPlayer('CM', { dribblesAttempted: 8, dribblesSuccessful: 0 });
        const result = getPositionSpecificStats(player);

        const dribbleSuccessStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Dribble Success Rate');
        expect(dribbleSuccessStat).toEqual({ label: 'Dribble Success Rate', value: '0%' });
      });

      it('should round dribble success rate correctly', () => {
        const player = createMockPlayer('CM', { dribblesAttempted: 7, dribblesSuccessful: 5 }); // 71.42...%
        const result = getPositionSpecificStats(player);

        const dribbleSuccessStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Dribble Success Rate');
        expect(dribbleSuccessStat).toEqual({ label: 'Dribble Success Rate', value: '71%' });
      });
    });

    describe('Striker Position Stats', () => {
      const strikerPositions = ['ST', 'CF', 'LW', 'RW'];
      
      strikerPositions.forEach(position => {
        it(`should return striker-specific position stats for ${position}`, () => {
          const player = createMockPlayer(position);
          const result = getPositionSpecificStats(player);
          
          const expectedShotAccuracy = Math.round((12 / 20) * 100); // 60%
          const expectedDribbleSuccess = Math.round((7 / 10) * 100); // 70%

          expect(result.positionStats).toEqual([
            { label: 'Shots', value: 20 },
            { label: 'Shots On Target', value: 12 },
            { label: 'Shot Accuracy', value: `${expectedShotAccuracy}%` },
            { label: 'Dribbles Attempted', value: 10 },
            { label: 'Dribbles Successful', value: 7 },
            { label: 'Dribble Success Rate', value: `${expectedDribbleSuccess}%` },
            { label: 'Offsides', value: 3 }
          ]);
        });
      });

      it('should handle striker with zero shots', () => {
        const player = createMockPlayer('ST', { shots: 0, shotsOnTarget: 0 });
        const result = getPositionSpecificStats(player);

        const shotAccuracyStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Shot Accuracy');
        expect(shotAccuracyStat).toEqual({ label: 'Shot Accuracy', value: '0%' });
      });

      it('should handle striker with zero dribbles attempted', () => {
        const player = createMockPlayer('ST', { dribblesAttempted: 0, dribblesSuccessful: 0 });
        const result = getPositionSpecificStats(player);

        const dribbleSuccessRate = result.positionStats.find((stat: { label: string; }) => stat.label === 'Dribble Success Rate');
        expect(dribbleSuccessRate).toEqual({ label: 'Dribble Success Rate', value: '0%' });
      });

      it('should handle striker with shots but no shots on target', () => {
        const player = createMockPlayer('ST', { shots: 10, shotsOnTarget: 0 });
        const result = getPositionSpecificStats(player);

        const shotAccuracyStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Shot Accuracy');
        expect(shotAccuracyStat).toEqual({ label: 'Shot Accuracy', value: '0%' });
      });

      it('should round shot accuracy correctly for strikers', () => {
        const player = createMockPlayer('ST', { shots: 7, shotsOnTarget: 5 }); // 71.42...%
        const result = getPositionSpecificStats(player);

        const shotAccuracyStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Shot Accuracy');
        expect(shotAccuracyStat).toEqual({ label: 'Shot Accuracy', value: '71%' });
      });

      it('should handle perfect shot accuracy', () => {
        const player = createMockPlayer('ST', { shots: 5, shotsOnTarget: 5 });
        const result = getPositionSpecificStats(player);

        const shotAccuracyStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Shot Accuracy');
        expect(shotAccuracyStat).toEqual({ label: 'Shot Accuracy', value: '100%' });
      });
    });

    describe('Unknown Position', () => {
      it('should return empty position stats for unknown position', () => {
        const player = createMockPlayer('UNKNOWN');
        const result = getPositionSpecificStats(player);

        expect(result.positionStats).toEqual([]);
      });

      it('should still return general stats for unknown position', () => {
        const player = createMockPlayer('UNKNOWN');
        const result = getPositionSpecificStats(player);

        expect(result.generalStats).toEqual([
          { label: 'Goals', value: 5 },
          { label: 'Assists', value: 3 },
          { label: 'Yellow Cards', value: 2 },
          { label: 'Red Cards', value: 0 },
          { label: 'Minutes Played', value: 1200 }
        ]);
      });
    });

    describe('Edge Cases and Data Validation', () => {
      it('should handle undefined stats gracefully', () => {
        const player = createMockPlayer('ST', { 
          shots: undefined as any, 
          shotsOnTarget: undefined as any 
        });
        const result = getPositionSpecificStats(player);

        const shotAccuracyStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Shot Accuracy');
        expect(shotAccuracyStat?.value).toBe('0%');
      });

      it('should handle null stats gracefully', () => {
        const player = createMockPlayer('CM', { 
          dribblesAttempted: null as any, 
          dribblesSuccessful: null as any 
        });
        const result = getPositionSpecificStats(player);

        const dribbleSuccessRate = result.positionStats.find((stat: { label: string; }) => stat.label === 'Dribble Success Rate');
        expect(dribbleSuccessRate?.value).toBe('0%');
      });

      it('should handle very large numbers', () => {
        const player = createMockPlayer('GK', { 
          saves: 999999,
          savePercentage: 99,
          cleansheets: 100 
        });
        const result = getPositionSpecificStats(player);

        expect(result.positionStats).toEqual([
          { label: 'Saves', value: 999999 },
          { label: 'Clean Sheets', value: 100 },
          { label: 'Save Percentage', value: '99%' },
          { label: 'Clearances', value: 30 }
        ]);
      });

      it('should handle decimal values in calculations', () => {
        const player = createMockPlayer('ST', { shots: 3, shotsOnTarget: 1 }); // 33.333...%
        const result = getPositionSpecificStats(player);

        const shotAccuracyStat = result.positionStats.find((stat: { label: string; }) => stat.label === 'Shot Accuracy');
        expect(shotAccuracyStat).toEqual({ label: 'Shot Accuracy', value: '33%' });
      });
    });
  });

  describe('Position Group Coverage', () => {
    it('should cover all goalkeeper positions', () => {
      const gkPositions = ['GK'];
      gkPositions.forEach(position => {
        const player = createMockPlayer(position);
        const keyStatsResult = getPlayerKeyStats(player);
        const positionStatsResult = getPositionSpecificStats(player);

        expect(keyStatsResult.chartStat.dataKey).toBe('saves');
        expect(positionStatsResult.positionStats.length).toBeGreaterThan(0);
      });
    });

    it('should cover all defender positions', () => {
      const defenderPositions = ['CB', 'RB', 'LB', 'RWB', 'LWB'];
      defenderPositions.forEach(position => {
        const player = createMockPlayer(position);
        const keyStatsResult = getPlayerKeyStats(player);
        const positionStatsResult = getPositionSpecificStats(player);

        expect(keyStatsResult.chartStat.dataKey).toBe('tackles');
        expect(positionStatsResult.positionStats.some((stat: { label: string; }) => stat.label === 'Tackles')).toBe(true);
      });
    });

    it('should cover all midfielder positions', () => {
      const midfielderPositions = ['CDM', 'CM', 'CAM', 'LM', 'RM'];
      midfielderPositions.forEach(position => {
        const player = createMockPlayer(position);
        const keyStatsResult = getPlayerKeyStats(player);
        const positionStatsResult = getPositionSpecificStats(player);

        expect(keyStatsResult.chartStat.dataKey).toBe('assists');
        expect(positionStatsResult.positionStats.some((stat: { label: string; }) => stat.label === 'Assists')).toBe(true);
      });
    });

    it('should cover all striker positions', () => {
      const strikerPositions = ['ST', 'CF', 'LW', 'RW'];
      strikerPositions.forEach(position => {
        const player = createMockPlayer(position);
        const keyStatsResult = getPlayerKeyStats(player);
        const positionStatsResult = getPositionSpecificStats(player);

        expect(keyStatsResult.chartStat.dataKey).toBe('goals');
        expect(positionStatsResult.positionStats.some((stat: { label: string; }) => stat.label === 'Shots')).toBe(true);
      });
    });
  });
  })
  
});