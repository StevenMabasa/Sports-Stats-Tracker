import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyTeamTab from '../pages/coachDashboard/coachStatsPage/MyTeamTab';
import * as teamStatsHelper from '../pages/coachDashboard/coachStatsPage/team-stats-helper';
import * as matchService from '../services/matchService';
import * as playerService from '../services/playerService';
import * as teamService from '../services/teamService';
import { useTeamData } from '../pages/coachDashboard/hooks/useTeamData';
import type { Match, Player, Team } from '../types';
// Mock external dependencies
vi.mock('../pages/coachDashboard/coachStatsPage/team-stats-helper', () => ({
  calculateTeamStats: vi.fn()
}));

vi.mock('../services/matchService', () => ({
  fetchTeamMatches: vi.fn()
}));

vi.mock('../services/playerService', () => ({
  fetchPlayersWithStats: vi.fn()
}));

vi.mock('../services/teamService', () => ({
  getCurrentTeamId: vi.fn()
}));

vi.mock('../pages/coachDashboard/hooks/useTeamData', () => ({
  useTeamData: vi.fn()
}));

// Mock PDF generation libraries
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297)
      }
    },
    addPage: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn()
  }))
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn(() => 'data:image/png;base64,fake-image-data'),
    width: 800,
    height: 600
  })
}));

// Mock child components
vi.mock('../pages/coachDashboard/playerManagement/PlayerStatsModal', () => ({
  default: ({ player, onClose }: any) => (
    <div data-testid="player-stats-modal">
      <h3>{player.name} Stats</h3>
      <button data-testid="close-modal" onClick={onClose}>Close</button>
    </div>
  )
}));

vi.mock('../components/teamStatsReport', () => ({
  default: ({ team, matches, stats, players, selectedPlayer, onPlayerSelect, showPlayerSelector }: any) => (
    <div data-testid="team-stats-report">
      <h2>{team.name} Report</h2>
      <div data-testid="matches-count">{matches.length} matches</div>
      <div data-testid="players-count">{players.length} players</div>
      <div data-testid="stats-wins">{stats.wins} wins</div>
      {showPlayerSelector && (
        <select data-testid="player-selector" onChange={(e) => onPlayerSelect(e.target.value)}>
          <option value="">Select Player</option>
          {players.map((player: Player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
      )}
      {selectedPlayer && (
        <div data-testid="selected-player">{selectedPlayer.name}</div>
      )}
    </div>
  )
}));

// Mock data
const mockTeam: Team = {
  id: 'team-123',
  name: 'Manchester United',
  coachId: 'Test Coach',
};

const mockMatches: Match[] = [
  {
    id: 'match-1',
    date: '2024-01-15T15:00:00Z',
    teamId: 'team-123',
    teamScore: 3,
    opponentName: 'Arsenal',
    opponentScore: 1,
    status: 'completed',
    possession: 65,
    shots: 15,
    shotsOnTarget: 8,
    corners: 6,
    fouls: 12,
    passes: 450
  },
  {
    id: 'match-2',
    date: '2024-01-22T14:30:00Z',
    teamId: 'team-123',
    teamScore: 1,
    opponentName: 'Chelsea',
    opponentScore: 2,
    status: 'completed',
    possession: 55,
    shots: 10,
    shotsOnTarget: 4,
    corners: 3,
    fouls: 8,
    passes: 380
  }
];

// Mock data
const mockTeamId = 'team-123';
const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: 'John Doe',
    position: 'Forward',
    jerseyNum: "10",
    teamId: mockTeamId,
    imageUrl: 'https://example.com/avatar1.png',
    stats: {
        goals: 15,
        assists: 8,
        yellowCards: 2,
        redCards: 0
        // ✅ removed appearances
        ,
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
        performanceData: []
    }
  },
  {
    id: 'player-2',
    name: 'Jane Smith',
    position: 'Midfielder',
    jerseyNum: "8",
    teamId: mockTeamId,
    imageUrl: 'https://example.com/avatar2.png',
    stats: {
        goals: 5,
        assists: 12,
        yellowCards: 1,
        redCards: 0
        // ✅ removed appearances
        ,
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
        performanceData: []
    }
  }
];

const mockTeamStats = {
  wins: 1,
  draws: 0,
  losses: 1,
  goalsFor: 4,
  goalsAgainst: 3,
  totalMatches: 2,
  winPercentage: 50,
  averageGoalsFor: 2,
  averageGoalsAgainst: 1.5
};

// Mock functions
const mockUseTeamData = useTeamData as Mock;
const mockFetchTeamMatches = matchService.fetchTeamMatches as Mock;
const mockFetchPlayersWithStats = playerService.fetchPlayersWithStats as Mock;
const mockGetCurrentTeamId = teamService.getCurrentTeamId as Mock;
const mockCalculateTeamStats = teamStatsHelper.calculateTeamStats as Mock;

describe('MyTeamTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseTeamData.mockReturnValue({
      team: mockTeam,
      isLoading: false,
      error: null
    });
    
    mockGetCurrentTeamId.mockReturnValue('team-123');
    mockFetchTeamMatches.mockResolvedValue(mockMatches);
    mockFetchPlayersWithStats.mockResolvedValue(mockPlayers);
    mockCalculateTeamStats.mockReturnValue(mockTeamStats);

    // Mock window.URL.createObjectURL for PDF tests
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // UNIT TESTS
  describe('Unit Tests', () => {
    describe('Component Initialization', () => {

      it('should not load data when team is not available', async () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: false,
          error: null
        });

        render(<MyTeamTab />);

        await waitFor(() => {
          expect(mockFetchTeamMatches).not.toHaveBeenCalled();
          expect(mockFetchPlayersWithStats).not.toHaveBeenCalled();
        });
      });

      it('should not load data when currentTeamId is not available', async () => {
        mockGetCurrentTeamId.mockReturnValue(null);

        render(<MyTeamTab />);

        await waitFor(() => {
          expect(mockFetchTeamMatches).not.toHaveBeenCalled();
          expect(mockFetchPlayersWithStats).not.toHaveBeenCalled();
        });
      });
    });

    describe('Error Handling', () => {
      it('should handle data loading errors gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockFetchTeamMatches.mockRejectedValue(new Error('API Error'));

        render(<MyTeamTab />);

        await waitFor(() => {
          expect(screen.getByText('Failed to load team data. Please try again.')).toBeInTheDocument();
        });

        consoleSpy.mockRestore();
      });

      it('should handle team loading error', () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: false,
          error: 'Team not found'
        });

        render(<MyTeamTab />);

        expect(screen.getByText('Team not found')).toBeInTheDocument();
      });
    });

  });

  // UI TESTS
  describe('UI Tests', () => {
    describe('Loading States', () => {

      it('should have correct loading styles', () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: true,
          error: null
        });

        render(<MyTeamTab />);

        const loadingElement = screen.getByText('Loading team data...');
        expect(loadingElement).toHaveClass('loading');
      });
    });

    describe('Error Display', () => {
      it('should display error messages with correct styling', async () => {
        mockFetchTeamMatches.mockRejectedValue(new Error('API Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<MyTeamTab />);

        await waitFor(() => {
          const errorElement = screen.getByText('Failed to load team data. Please try again.');
          expect(errorElement).toBeInTheDocument();
          expect(errorElement).toHaveClass('error');
        });

        consoleSpy.mockRestore();
      });

      it('should display team error', () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: false,
          error: 'Team not found'
        });

        render(<MyTeamTab />);

        const errorElement = screen.getByText('Team not found');
        expect(errorElement).toHaveClass('error');
      });
    });
  });

  // INTEGRATION TESTS
  describe('Integration Tests', () => {

    describe('Service Integration', () => {
      it('should handle service call sequence correctly', async () => {
        render(<MyTeamTab />);

        await waitFor(() => {
          // Verify all services are called in the correct sequence
          expect(mockGetCurrentTeamId).toHaveBeenCalledBefore(mockFetchPlayersWithStats as any);
          expect(mockFetchTeamMatches).toHaveBeenCalledWith(mockTeam.id);
          expect(mockFetchPlayersWithStats).toHaveBeenCalledWith('team-123');
        });

        // Verify stats calculation happens after data loading
        expect(mockCalculateTeamStats).toHaveBeenCalledWith(mockMatches);
      });

      it('should handle partial service failures', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Only matches fail
        mockFetchTeamMatches.mockRejectedValue(new Error('Matches API Error'));
        mockFetchPlayersWithStats.mockResolvedValue(mockPlayers);

        render(<MyTeamTab />);

        await waitFor(() => {
          expect(screen.getByText('Failed to load team data. Please try again.')).toBeInTheDocument();
        });

        consoleSpy.mockRestore();
      });
    });

    describe('State Management Integration', () => {
      it('should manage error states correctly', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        mockFetchTeamMatches.mockRejectedValue(new Error('API Error'));

        render(<MyTeamTab />);

        await waitFor(() => {
          expect(screen.getByText('Failed to load team data. Please try again.')).toBeInTheDocument();
          expect(screen.queryByText('Loading team stats...')).not.toBeInTheDocument();
          expect(screen.queryByTestId('team-stats-report')).not.toBeInTheDocument();
        });

        consoleSpy.mockRestore();
      });
    });
  });

  // EDGE CASES AND ERROR SCENARIOS
  describe('Edge Cases', () => {
    describe('Component Lifecycle Edge Cases', () => {
      it('should handle unmounting during data loading', async () => {
        let resolveMatches: (value: Match[]) => void;
        const matchesPromise = new Promise<Match[]>(resolve => {
          resolveMatches = resolve;
        });
        
        mockFetchTeamMatches.mockReturnValue(matchesPromise);

        const { unmount } = render(<MyTeamTab />);

        // Unmount before promises resolve
        unmount();

        // Resolve promises after unmount
        resolveMatches!(mockMatches);

        // Should not cause any errors (no assertions needed, just shouldn't throw)
      });
    });
  });
});