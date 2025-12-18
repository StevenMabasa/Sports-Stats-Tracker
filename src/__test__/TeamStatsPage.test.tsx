import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate, useParams } from 'react-router-dom';
import '@testing-library/jest-dom';
import TeamStatsPage from '../pages/userDashboard/TeamStatsPage';
import { useTeamData } from '../pages/coachDashboard/hooks/useTeamData';
import * as matchService from '../services/matchService';
import * as teamStatsHelper from '../pages/coachDashboard/coachStatsPage/team-stats-helper';
import html2canvas from 'html2canvas';
import type { Match, Team } from '../types';

// Mock external dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn()
  };
});

vi.mock('../pages/coachDashboard/hooks/useTeamData', () => ({
  useTeamData: vi.fn()
}));

vi.mock('../services/matchService', () => ({
  fetchTeamMatches: vi.fn()
}));

vi.mock('../pages/coachDashboard/coachStatsPage/team-stats-helper', () => ({
  calculateTeamStats: vi.fn()
}));

// Mock PDF generation libraries
const mockJsPDF = {
  internal: {
    pageSize: {
      getWidth: vi.fn(() => 210),
      getHeight: vi.fn(() => 297)
    }
  },
  addPage: vi.fn(),
  addImage: vi.fn(),
  save: vi.fn()
};

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => mockJsPDF)
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn(() => 'data:image/png;base64,fake-image-data'),
    width: 800,
    height: 600
  })
}));

// Mock TeamStatsReport component
vi.mock('../components/teamStatsReport', () => ({
  default: ({ team, matches, stats, showBackButton, onBack }: any) => (
    <div data-testid="team-stats-report" ref={(el: HTMLElement | null) => {
      if (el) {
        const mockElements = [
          document.createElement('div'),
          document.createElement('div')
        ];
        
        const mockNodeList = Object.assign(mockElements, {
          item: (index: number) => mockElements[index] || null,
          forEach: mockElements.forEach.bind(mockElements),
          entries: mockElements.entries.bind(mockElements),
          keys: mockElements.keys.bind(mockElements),
          values: mockElements.values.bind(mockElements),
          [Symbol.iterator]: mockElements[Symbol.iterator].bind(mockElements)
        });
        
        el.querySelectorAll = vi.fn(() => mockNodeList as any);
      }
    }}>
      <h1>{team.name} Stats Report</h1>
      <div data-testid="matches-count">{matches.length} matches</div>
      <div data-testid="stats-summary">
        Wins: {stats?.wins || 0}, Losses: {stats?.losses || 0}
      </div>
      {showBackButton && (
        <button data-testid="back-button" onClick={onBack}>
          Back
        </button>
      )}
      <div className="pdf-capture" data-testid="pdf-section-1">
        Section 1 Content
      </div>
      <div className="pdf-capture" data-testid="pdf-section-2">
        Section 2 Content
      </div>
      <button data-testid="export-pdf-button" onClick={() => {
        const component = document.querySelector('[data-testid="team-stats-report"]');
        if (component && (component as any).handleExportPdf) {
          (component as any).handleExportPdf();
        }
      }}>
        Export PDF
      </button>
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
const mockUseParams = useParams as Mock;
const mockUseNavigate = useNavigate as Mock;
const mockUseTeamData = useTeamData as Mock;
const mockFetchTeamMatches = matchService.fetchTeamMatches as Mock;
const mockCalculateTeamStats = teamStatsHelper.calculateTeamStats as Mock;
const mockNavigate = vi.fn();

// Helper function to render component with router
const renderWithRouter = (teamId: string = 'team-123') => {
  return render(
    <MemoryRouter initialEntries={[`/teams/${teamId}/stats`]}>
      <TeamStatsPage />
    </MemoryRouter>
  );
};

describe('TeamStatsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock ResizeObserver for Recharts
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // Default mock implementations
    mockUseParams.mockReturnValue({ teamId: 'team-123' });
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseTeamData.mockReturnValue({
      team: mockTeam,
      isLoading: false,
      error: null
    });
    mockFetchTeamMatches.mockResolvedValue(mockMatches);
    mockCalculateTeamStats.mockReturnValue(mockTeamStats);

    // Mock window.URL for PDF tests
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Reset PDF mocks
    mockJsPDF.addPage.mockClear();
    mockJsPDF.addImage.mockClear();
    mockJsPDF.save.mockClear();
    
    // Reset html2canvas mock
    (html2canvas as any).mockClear?.();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up global mocks
    delete (global as any).ResizeObserver;
  });

  // UNIT TESTS
  describe('Unit Tests', () => {
    describe('Data Loading', () => {

      it('should not fetch matches when teamId is undefined', async () => {
        mockUseParams.mockReturnValue({ teamId: undefined });
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: false,
          error: null
        });
        
        renderWithRouter();
        
        await waitFor(() => {
          expect(mockFetchTeamMatches).not.toHaveBeenCalled();
        });
      });
    });

    describe('Error Handling', () => {

      it('should handle missing team data', async () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: false,
          error: null
        });
        
        renderWithRouter();
        
        await waitFor(() => {
          expect(screen.getByText(/Error loading team stats|Team not found/i)).toBeInTheDocument();
        });
      });
    });
  });

  // UI TESTS
  describe('UI Tests', () => {
    describe('Loading State', () => {
      it('should display loading message when team data is loading', () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: true,
          error: null
        });
        
        renderWithRouter();
        
        expect(screen.getByText('Loading team stats...')).toBeInTheDocument();
      });

      it('should have correct loading message styling', () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: true,
          error: null
        });
        
        renderWithRouter();
        
        const loadingElement = screen.getByText('Loading team stats...');
        expect(loadingElement.tagName).toBe('P');
      });
    });

    describe('Error State', () => {
      it('should display error message with correct styling', async () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: false,
          error: 'Network error'
        });
        
        renderWithRouter();
        
        await waitFor(() => {
          const errorElement = screen.getByText(/Error loading team stats/i);
          expect(errorElement.tagName).toBe('P');
        });
      });

      it('should display error for missing team even without error message', async () => {
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: false,
          error: null
        });
        
        renderWithRouter();
        
        await waitFor(() => {
          expect(screen.getByText(/Error loading team stats|Team not found/i)).toBeInTheDocument();
        });
      });
    });
  });

  // INTEGRATION TESTS
  describe('Integration Tests', () => {
    describe('Service Integration', () => {
      it('should handle service failures gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Simulate team data failure
        mockUseTeamData.mockReturnValue({
          team: null,
          isLoading: false,
          error: 'Team service failed'
        });
        
        renderWithRouter();
        
        await waitFor(() => {
          expect(screen.getByText(/Error loading team stats/i)).toBeInTheDocument();
        });
        
        consoleSpy.mockRestore();
      });

    });

  });
});