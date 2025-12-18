import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import MatchDetailsPage from '../pages/userDashboard/MatchDetailsPage';
import type { Match } from '../types';
import type { UiTeam } from '../pages/userDashboard/hooks/useDbData';
import * as matchService from '../services/matchService';

// Mock the matchService
vi.mock('../services/matchService', () => ({
  fetchMatches: vi.fn()
}));

// Mock the Chat component
vi.mock('../pages/userDashboard/Chat', () => ({
  default: ({ matchId, username }: { matchId: string; username: string }) => (
    <div data-testid="chat-component">
      Chat for match {matchId} - user: {username}
    </div>
  )
}));

const mockFetchMatches = matchService.fetchMatches as Mock;

const mockMatch: Match = {
  id: 'match-123',
  date: '2024-03-15T14:30:00.000Z',
  teamId: 'team-1',
  teamScore: 3,
  opponentName: 'Arsenal FC',
  opponentScore: 1,
  status: 'completed',
  possession: 65,
  shots: 12,
  shotsOnTarget: 8,
  corners: 6,
  fouls: 14,
  passes: 450
};

const mockTeams: UiTeam[] = [
  { id: 'team-1', name: 'Manchester City' },
  { id: 'team-2', name: 'Liverpool FC' }
];

const defaultProps = {
  onBack: vi.fn(),
  username: 'testuser',
  teams: mockTeams
};

// Helper function to render component with router
const renderWithRouter = (matchId: string = 'match-123', props = defaultProps) => {
  return render(
    <MemoryRouter initialEntries={[`/matches/${matchId}`]}>
      <Routes>
        <Route path="/matches/:id" element={<MatchDetailsPage {...props} />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('MatchDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // UNIT TESTS
  describe('Unit Tests', () => {
    describe('Date and Time Formatting', () => {
      it('should format date correctly', async () => {
        mockFetchMatches.mockResolvedValue([mockMatch]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText(/Friday, March 15, 2024/)).toBeInTheDocument();
        });
      });
    });

    describe('Team Name Resolution', () => {
      it('should display correct team name when team exists', async () => {
        mockFetchMatches.mockResolvedValue([mockMatch]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('Manchester City')).toBeInTheDocument();
        });
      });

      it('should display fallback team name when team not found', async () => {
        const matchWithUnknownTeam = { ...mockMatch, teamId: 'unknown-team' };
        mockFetchMatches.mockResolvedValue([matchWithUnknownTeam]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('Team unknown-team')).toBeInTheDocument();
        });
      });
    });

    describe('Match Status Display', () => {
      it('should display "Match Finished" for completed matches', async () => {
        mockFetchMatches.mockResolvedValue([{ ...mockMatch, status: 'completed' }]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('Match Finished')).toBeInTheDocument();
        });
      });

      it('should display "Scheduled" for scheduled matches', async () => {
        mockFetchMatches.mockResolvedValue([{ ...mockMatch, status: 'scheduled' }]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('Scheduled')).toBeInTheDocument();
        });
      });

      it('should display "In Progress" for live matches', async () => {
        mockFetchMatches.mockResolvedValue([{ ...mockMatch, status: 'live' }]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('In Progress')).toBeInTheDocument();
        });
      });
    });

    describe('Statistics Display', () => {
      it('should display all match statistics correctly', async () => {
        mockFetchMatches.mockResolvedValue([mockMatch]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('65%')).toBeInTheDocument(); // Possession
          expect(screen.getByText('12')).toBeInTheDocument(); // Shots
          expect(screen.getByText('8')).toBeInTheDocument(); // Shots on Target
          expect(screen.getByText('6')).toBeInTheDocument(); // Corners
          expect(screen.getByText('14')).toBeInTheDocument(); // Fouls
          expect(screen.getByText('450')).toBeInTheDocument(); // Passes
        });
      });

      it('should handle missing statistics correctly', async () => {
        const matchWithMissingStats = {
          ...mockMatch,
          possession: undefined,
          shots: undefined,
          shotsOnTarget: undefined,
          corners: undefined,
          fouls: undefined,
          passes: undefined
        };
        mockFetchMatches.mockResolvedValue([matchWithMissingStats]);
        renderWithRouter();

        await waitFor(() => {
          // Should display 0 for missing stats
          const zeroElements = screen.getAllByText('0');
          expect(zeroElements).toHaveLength(5); // 5 stats that should show 0
          expect(screen.getByText('0%')).toBeInTheDocument(); // Possession shows 0%
        });
      });
    });
  });

  // INTEGRATION TESTS
  describe('Integration Tests', () => {
    describe('Data Fetching and Display', () => {
      it('should handle API errors correctly', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockFetchMatches.mockRejectedValue(new Error('API Error'));
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('Error Loading Match')).toBeInTheDocument();
          expect(screen.getByText('Failed to load match data')).toBeInTheDocument();
        });

        expect(consoleError).toHaveBeenCalledWith('Error loading match data:', expect.any(Error));
        consoleError.mockRestore();
      });

      it('should handle match not found', async () => {
        mockFetchMatches.mockResolvedValue([]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('Error Loading Match')).toBeInTheDocument();
          expect(screen.getByText('Match not found')).toBeInTheDocument();
        });
      });

      it('should handle missing match ID', async () => {
        renderWithRouter(''); // Empty match ID

        // Should not call fetchMatches
        expect(mockFetchMatches).not.toHaveBeenCalled();
      });
    });

    describe('Chat Integration', () => {
      it('should render Chat component with correct props', async () => {
        mockFetchMatches.mockResolvedValue([mockMatch]);
        renderWithRouter();

        await waitFor(() => {
          const chatComponent = screen.getByTestId('chat-component');
          expect(chatComponent).toBeInTheDocument();
          expect(chatComponent).toHaveTextContent('Chat for match match-123 - user: testuser');
        });
      });
    });

    describe('Navigation Integration', () => {
      it('should call onBack when back button is clicked', async () => {
        const onBackMock = vi.fn();
        mockFetchMatches.mockResolvedValue([mockMatch]);
        
        renderWithRouter('match-123', { ...defaultProps, onBack: onBackMock });

        await waitFor(() => {
          const backButton = screen.getByText('← Back to Matches');
          expect(backButton).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('← Back to Matches'));
        expect(onBackMock).toHaveBeenCalledOnce();
      });

      it('should show back button on error state', async () => {
        const onBackMock = vi.fn();
        mockFetchMatches.mockRejectedValue(new Error('API Error'));
        
        renderWithRouter('match-123', { ...defaultProps, onBack: onBackMock });

        await waitFor(() => {
          const backButton = screen.getByText('Back to Matches');
          expect(backButton).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Back to Matches'));
        expect(onBackMock).toHaveBeenCalledOnce();
      });
    });
  });

  // UI TESTS
  describe('UI Tests', () => {
    describe('Loading State', () => {
      it('should display loading state correctly', () => {
        mockFetchMatches.mockImplementation(() => new Promise(() => {})); // Never resolves
        renderWithRouter();

        expect(screen.getByText('Loading match details...')).toBeInTheDocument();
        expect(screen.getByText('Please wait while we fetch the data')).toBeInTheDocument();
      });

      it('should have correct styling for loading state', () => {
        mockFetchMatches.mockImplementation(() => new Promise(() => {}));
        renderWithRouter();

        const loadingContainer = screen.getByText('Loading match details...').parentElement;
        expect(loadingContainer).toHaveStyle({
          textAlign: 'center',
          padding: '40px'
        });
      });
    });

    describe('Error State', () => {
      it('should display error state with correct styling', async () => {
        mockFetchMatches.mockRejectedValue(new Error('API Error'));
        renderWithRouter();

        await waitFor(() => {
          const errorContainer = screen.getByText('Error Loading Match').parentElement;
          expect(errorContainer).toHaveStyle({
            textAlign: 'center',
            padding: '20px'
          });
        });
      });
    });

    describe('Match Display Layout', () => {

      it('should render statistics grid correctly', async () => {
        mockFetchMatches.mockResolvedValue([mockMatch]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('Match Statistics')).toBeInTheDocument();
          expect(screen.getByText('Possession')).toBeInTheDocument();
          expect(screen.getByText('Shots')).toBeInTheDocument();
          expect(screen.getByText('Shots on Target')).toBeInTheDocument();
          expect(screen.getByText('Corners')).toBeInTheDocument();
          expect(screen.getByText('Fouls')).toBeInTheDocument();
          expect(screen.getByText('Passes')).toBeInTheDocument();
        });
      });

      it('should render chat section', async () => {
        mockFetchMatches.mockResolvedValue([mockMatch]);
        renderWithRouter();

        await waitFor(() => {
          expect(screen.getByText('Match Chat')).toBeInTheDocument();
          expect(screen.getByTestId('chat-component')).toBeInTheDocument();
        });
      });
    });

    describe('Accessibility', () => {

      it('should have clickable back button', async () => {
        mockFetchMatches.mockResolvedValue([mockMatch]);
        renderWithRouter();

        await waitFor(() => {
          const backButton = screen.getByRole('button', { name: '← Back to Matches' });
          expect(backButton).toBeInTheDocument();
          expect(backButton).not.toBeDisabled();
        });
      });
    });
  });

  // EDGE CASES AND ERROR SCENARIOS
  describe('Edge Cases', () => {
    it('should handle match with zero scores', async () => {
      const zeroScoreMatch = { ...mockMatch, teamScore: 0, opponentScore: 0 };
      mockFetchMatches.mockResolvedValue([zeroScoreMatch]);
      renderWithRouter();

      await waitFor(() => {
        const scores = screen.getAllByText('0');
        expect(scores.length).toBeGreaterThan(0);
      });
    });

    it('should handle match with very long team names', async () => {
      const longNameMatch = {
        ...mockMatch,
        opponentName: 'Very Long Team Name That Might Break Layout FC United'
      };
      mockFetchMatches.mockResolvedValue([longNameMatch]);
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Very Long Team Name That Might Break Layout FC United')).toBeInTheDocument();
      });
    });

  });
});