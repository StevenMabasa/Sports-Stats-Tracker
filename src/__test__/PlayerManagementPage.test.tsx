import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PlayerManagementPage from '../pages/coachDashboard/playerManagement/PlayerManagementPage';
import * as teamService from '../services/teamService';
import * as playerService from '../services/playerService';
import * as lineupService from '../services/lineupService';
import supabase from '../../supabaseClient';
import type { Player } from '../types';

// Mock all external dependencies
vi.mock('../services/teamService', () => ({
  getCurrentTeamId: vi.fn()
}));

vi.mock('../services/playerService', () => ({
  fetchPlayersWithStats: vi.fn()
}));

vi.mock('../services/lineupService', () => ({
  loadLineup: vi.fn(),
  saveLineup: vi.fn(),
  updatePlayerPosition: vi.fn(),
  debugLineup: vi.fn(),
  removePlayerFromLineup: vi.fn()
}));

vi.mock('../../supabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn()
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

// Mock child components
vi.mock('../pages/coachDashboard/playerManagement/RosterManagement', () => ({
  default: ({ players,onAddPlayer, onRemovePlayer, onAddToLineup, onPlayerClick }: any) => (
    <div data-testid="roster-management">
      <button 
        data-testid="add-player-btn" 
        onClick={() => onAddPlayer({ name: 'Test Player', position: 'Forward', jerseyNum: 10 })}
      >
        Add Player
      </button>
      {players.map((player: Player) => (
        <div key={player.id} data-testid={`player-${player.id}`}>
          {player.name}
          <button 
            data-testid={`remove-player-${player.id}`}
            onClick={() => onRemovePlayer(player.id)}
          >
            Remove
          </button>
          <button 
            data-testid={`add-to-lineup-${player.id}`}
            onClick={() => onAddToLineup(player)}
          >
            Add to Lineup
          </button>
          <button 
            data-testid={`view-stats-${player.id}`}
            onClick={() => onPlayerClick(player)}
          >
            View Stats
          </button>
        </div>
      ))}
    </div>
  )
}));


vi.mock('../pages/coachDashboard/playerManagement/LineupSelection', () => ({
  default: ({ lineup, onRemoveFromLineup, onPositionUpdate }: any) => (
    <div data-testid="lineup-selection">
      {lineup.map((player: Player) => (
        <div key={player.id} data-testid={`lineup-player-${player.id}`}>
          {player.name}
          <button 
            data-testid={`remove-from-lineup-${player.id}`}
            onClick={() => onRemoveFromLineup(player.id)}
          >
            Remove from Lineup
          </button>
          <button 
            data-testid={`update-position-${player.id}`}
            onClick={() => onPositionUpdate(player.id, 25, 75)}
          >
            Update Position
          </button>
        </div>
      ))}
    </div>
  )
}));

vi.mock('../pages/coachDashboard/playerManagement/PlayerStatsModal', () => ({
  default: ({ player, onClose }: any) => (
    <div data-testid="player-stats-modal">
      <h3>{player.name} Stats</h3>
      <button data-testid="close-modal" onClick={onClose}>Close</button>
    </div>
  )
}));

vi.mock('../pages/components/InlineAlert', () => ({
  default: ({ type, message, onClose }: any) => (
    <div data-testid={`alert-${type}`}>
      {message}
      <button data-testid="close-alert" onClick={onClose}>×</button>
    </div>
  )
}));

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


const mockLineupData = [
  { playerId: 'player-1', positionX: 50, positionY: 30 }
];

// Mock functions
const mockGetCurrentTeamId = teamService.getCurrentTeamId as Mock;
const mockFetchPlayersWithStats = playerService.fetchPlayersWithStats as Mock;
const mockLoadLineup = lineupService.loadLineup as Mock;
const mockSaveLineup = lineupService.saveLineup as Mock;
const mockUpdatePlayerPosition = lineupService.updatePlayerPosition as Mock;
const mockRemovePlayerFromLineup = lineupService.removePlayerFromLineup as Mock;

describe('PlayerManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentTeamId.mockReturnValue(mockTeamId);
    mockFetchPlayersWithStats.mockResolvedValue(mockPlayers);
    mockLoadLineup.mockResolvedValue(mockLineupData);
    mockSaveLineup.mockResolvedValue(true);
    mockUpdatePlayerPosition.mockResolvedValue(true);
    mockRemovePlayerFromLineup.mockResolvedValue(true);
    
    // Mock supabase responses
    const mockSupabaseChain = {
      select: vi.fn().mockResolvedValue({ error: null, data: [] }),
      eq: vi.fn().mockResolvedValue({ error: null })
    };
    
    (supabase.from as Mock).mockReturnValue({
      insert: vi.fn().mockReturnValue(mockSupabaseChain),
      delete: vi.fn().mockReturnValue(mockSupabaseChain)
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // UNIT TESTS
  describe('Unit Tests', () => {

    describe('Player Management Logic', () => {
      it('should add player correctly', async () => {
        const user = userEvent.setup();
        render(<PlayerManagementPage />);

        await waitFor(() => {
          expect(screen.getByTestId('roster-management')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('add-player-btn'));

        expect(supabase.from).toHaveBeenCalledWith('players');
        await waitFor(() => {
          expect(mockFetchPlayersWithStats).toHaveBeenCalledTimes(2); // Initial load + after add
        });
      });

      it('should remove player correctly', async () => {
        const user = userEvent.setup();
        render(<PlayerManagementPage />);

        await waitFor(() => {
          expect(screen.getByTestId(`remove-player-${mockPlayers[0].id}`)).toBeInTheDocument();
        });

        await user.click(screen.getByTestId(`remove-player-${mockPlayers[0].id}`));

        expect(supabase.from).toHaveBeenCalledWith('players');
      });
    });

    describe('Lineup Management Logic', () => {
      it('should add player to lineup', async () => {
        const user = userEvent.setup();
        render(<PlayerManagementPage />);

        await waitFor(() => {
          expect(screen.getByTestId(`add-to-lineup-${mockPlayers[1].id}`)).toBeInTheDocument();
        });

        await user.click(screen.getByTestId(`add-to-lineup-${mockPlayers[1].id}`));

        expect(mockSaveLineup).toHaveBeenCalledWith(
          mockTeamId,
          expect.arrayContaining([
            expect.objectContaining({ playerId: mockPlayers[0].id }), // From initial lineup
            expect.objectContaining({ playerId: mockPlayers[1].id })  // Newly added
          ])
        );
      });

      it('should remove player from lineup', async () => {
        const user = userEvent.setup();
        render(<PlayerManagementPage />);

        await waitFor(() => {
          expect(screen.getByTestId(`remove-from-lineup-${mockPlayers[0].id}`)).toBeInTheDocument();
        });

        await user.click(screen.getByTestId(`remove-from-lineup-${mockPlayers[0].id}`));

        expect(mockRemovePlayerFromLineup).toHaveBeenCalledWith(mockTeamId, mockPlayers[0].id);
      });

      it('should update player position', async () => {
        const user = userEvent.setup();
        render(<PlayerManagementPage />);

        await waitFor(() => {
          expect(screen.getByTestId(`update-position-${mockPlayers[0].id}`)).toBeInTheDocument();
        });

        await user.click(screen.getByTestId(`update-position-${mockPlayers[0].id}`));

        expect(mockUpdatePlayerPosition).toHaveBeenCalledWith(mockTeamId, mockPlayers[0].id, 25, 75);
      });

    });
  });

  // UI TESTS
  describe('UI Tests', () => {
    describe('Loading State', () => {
      it('should display loading message', () => {
        mockFetchPlayersWithStats.mockImplementation(() => new Promise(() => {})); // Never resolves
        render(<PlayerManagementPage />);

        expect(screen.getByText('Loading players...')).toBeInTheDocument();
      });

      it('should have correct loading container structure', () => {
        mockFetchPlayersWithStats.mockImplementation(() => new Promise(() => {}));
        render(<PlayerManagementPage />);

        const container = screen.getByText('Loading players...').closest('.management-container');
        expect(container).toBeInTheDocument();
      });
    });

    describe('Component Layout', () => {
      it('should render all main components', async () => {
        render(<PlayerManagementPage />);

        await waitFor(() => {
          expect(screen.getByTestId('roster-management')).toBeInTheDocument();
          expect(screen.getByTestId('lineup-selection')).toBeInTheDocument();
        });
      });

      it('should have proper container structure', async () => {
        render(<PlayerManagementPage />);

        await waitFor(() => {
          const container = screen.getByTestId('roster-management').closest('.management-container');
          expect(container).toBeInTheDocument();
        });
      });
    });

    describe('Player Display', () => {

      it('should display lineup players separately', async () => {
        render(<PlayerManagementPage />);

        await waitFor(() => {
          // Player-1 should be in lineup based on mockLineupData
          expect(screen.getByTestId(`lineup-player-${mockPlayers[0].id}`)).toBeInTheDocument();
        });
      });
    });

    describe('Interactive Elements', () => {
      it('should have clickable buttons for all player actions', async () => {
        render(<PlayerManagementPage />);

        await waitFor(() => {
          mockPlayers.forEach(player => {
            expect(screen.getByTestId(`remove-player-${player.id}`)).toBeInTheDocument();
            expect(screen.getByTestId(`add-to-lineup-${player.id}`)).toBeInTheDocument();
            expect(screen.getByTestId(`view-stats-${player.id}`)).toBeInTheDocument();
          });
        });
      });

      it('should have lineup management buttons', async () => {
        render(<PlayerManagementPage />);

        await waitFor(() => {
          // For player in lineup
          expect(screen.getByTestId(`remove-from-lineup-${mockPlayers[0].id}`)).toBeInTheDocument();
          expect(screen.getByTestId(`update-position-${mockPlayers[0].id}`)).toBeInTheDocument();
        });
      });
    });

  });

  // INTEGRATION TESTS
  describe('Integration Tests', () => {

    describe('Service Integration', () => {
      it('should properly initialize with all service calls', async () => {
        render(<PlayerManagementPage />);

        expect(mockGetCurrentTeamId).toHaveBeenCalledOnce();
        
        await waitFor(() => {
          expect(mockFetchPlayersWithStats).toHaveBeenCalledWith(mockTeamId);
          expect(mockLoadLineup).toHaveBeenCalledWith(mockTeamId);
        });
      });

      it('should handle service errors gracefully', async () => {
        mockLoadLineup.mockRejectedValue(new Error('Lineup load error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        render(<PlayerManagementPage />);

        await waitFor(() => {
          // Should still load players even if lineup fails
          expect(screen.getByTestId('roster-management')).toBeInTheDocument();
        });

        // Should not show error for lineup loading failure
        expect(screen.queryByTestId('alert-error')).not.toBeInTheDocument();

        consoleSpy.mockRestore();
      });
    });

    describe('State Synchronization', () => {
      it('should keep lineup and player states synchronized', async () => {
        const user = userEvent.setup();
        render(<PlayerManagementPage />);

        // Wait for initial load
        await waitFor(() => {
          expect(screen.getByTestId(`lineup-player-${mockPlayers[0].id}`)).toBeInTheDocument();
        });

        // Remove player completely - should remove from both lineup and players
        await user.click(screen.getByTestId(`remove-player-${mockPlayers[0].id}`));

        // Player should be removed from both roster and lineup displays
        await waitFor(() => {
          expect(screen.queryByTestId(`player-${mockPlayers[0].id}`)).not.toBeInTheDocument();
          expect(screen.queryByTestId(`lineup-player-${mockPlayers[0].id}`)).not.toBeInTheDocument();
        });
      });
    });
  });

  // EDGE CASES
  describe('Edge Cases', () => {
    it('should handle empty player list', async () => {
      mockFetchPlayersWithStats.mockResolvedValue([]);
      render(<PlayerManagementPage />);

      await waitFor(() => {
        expect(screen.getByTestId('roster-management')).toBeInTheDocument();
        expect(screen.getByTestId('lineup-selection')).toBeInTheDocument();
      });

      // Should not have any player elements
      expect(screen.queryByTestId(/^player-/)).not.toBeInTheDocument();
    });

    it('should handle empty lineup', async () => {
      mockLoadLineup.mockResolvedValue([]);
      render(<PlayerManagementPage />);

      await waitFor(() => {
        expect(screen.getByTestId('lineup-selection')).toBeInTheDocument();
      });

      // Should not have any lineup player elements
      expect(screen.queryByTestId(/^lineup-player-/)).not.toBeInTheDocument();
    });

    it('should handle malformed lineup data', async () => {
      mockLoadLineup.mockResolvedValue([
        { playerId: 'non-existent-player', positionX: 50, positionY: 50 }
      ]);
      
      render(<PlayerManagementPage />);

      await waitFor(() => {
        expect(screen.getByTestId('lineup-selection')).toBeInTheDocument();
      });

      // Should not crash and should not show non-existent player
      expect(screen.queryByTestId('lineup-player-non-existent-player')).not.toBeInTheDocument();
    });

  });
});