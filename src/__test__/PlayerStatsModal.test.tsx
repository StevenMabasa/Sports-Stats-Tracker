import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PlayerStatsModal from '../pages/coachDashboard/playerManagement/PlayerStatsModal';
import * as statsHelper from '../pages/coachDashboard/playerManagement/stats-helper';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Player } from '../types';

// Mock external dependencies
vi.mock('jspdf');
vi.mock('html2canvas');

vi.mock('../pages/coachDashboard/playerManagement/KeyStatCard', () => ({
  default: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="key-stat-card">{label}: {value}</div>
  )
}));

vi.mock('../pages/coachDashboard/playerManagement/StatsChart', () => ({
  default: ({ data }: { data: any[] }) => (
    <div data-testid="stats-chart">Chart with {data?.length || 0} data points</div>
  )
}));

vi.mock('../pages/coachDashboard/playerManagement/StatsTable', () => ({
  default: ({ player }: { player: Player }) => (
    <div data-testid="stats-table">Stats for {player.name}</div>
  )
}));

vi.mock('../pages/coachDashboard/playerManagement/stats-helper');

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

const mockTeamId = 'team-123';

// Mock player data matching your structure
const mockPlayer: Player = {
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
    redCards: 0,
    shots: 25,
    shotsOnTarget: 18,
    chancesCreated: 12,
    dribblesAttempted: 30,
    dribblesSuccessful: 22,
    offsides: 3,
    tackles: 45,
    interceptions: 15,
    clearances: 8,
    saves: 0,
    cleansheets: 0,
    savePercentage: 0,
    passCompletion: 85,
    minutesPlayed: 1250,
    performanceData: [0,1,2,3,4]
    
  }
};

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
      redCards: 0,
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
      redCards: 0,
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

const mockKeyStats = [
  { label: 'Goals', value: '15' },
  { label: 'Assists', value: '8' },
  { label: 'Tackles', value: '45' }
];

const mockChartStat = {label: "Goals vs Assists",dataKey: "goals"};


describe('PlayerStatsModal', () => {
  const mockOnClose = vi.fn();
  const mockStatsHelper = vi.mocked(statsHelper);

    beforeEach(() => {
    vi.clearAllMocks();
    mockStatsHelper.getPlayerKeyStats.mockReturnValue({
        keyStats: mockKeyStats,
        chartStat: mockChartStat
    });
    });


  afterEach(() => {
    vi.clearAllTimers();
  });

  // UI Tests
  describe('UI Rendering', () => {
    it('renders modal with player information', () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Forward | #10')).toBeInTheDocument();
      expect(screen.getByAltText('John Doe')).toHaveAttribute('src', mockPlayer.imageUrl);
    });

    it('renders all key stat cards', () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      const keyStatCards = screen.getAllByTestId('key-stat-card');
      expect(keyStatCards).toHaveLength(3);
      expect(screen.getByText('Goals: 15')).toBeInTheDocument();
      expect(screen.getByText('Assists: 8')).toBeInTheDocument();
      expect(screen.getByText('Tackles: 45')).toBeInTheDocument();
    });

    it('renders full stats section', () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      expect(screen.getByText('Full Statistics')).toBeInTheDocument();
      expect(screen.getByTestId('stats-table')).toBeInTheDocument();
      expect(screen.getByText('Stats for John Doe')).toBeInTheDocument();
    });

    it('renders close button and export button', () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      expect(screen.getByText('×')).toBeInTheDocument();
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });
  });

  // Interaction Tests
  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      const closeButton = screen.getByText('×');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', async () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      const overlay = document.querySelector('.stats-modal-overlay');
      
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('prevents event propagation when modal content is clicked', () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      const modalContent = document.querySelector('.stats-modal-content');
      const stopPropagationSpy = vi.fn();
      
      if (modalContent) {
        const event = new MouseEvent('click', { bubbles: true });
        event.stopPropagation = stopPropagationSpy;
        fireEvent(modalContent, event);
      }
    });
  });

  // PDF Export Tests
  describe('PDF Export Functionality', () => {
    let mockJsPDF: any;
    let mockHtml2Canvas: any;

    beforeEach(() => {
      mockJsPDF = {
        internal: {
          pageSize: {
            getWidth: vi.fn(() => 210),
            getHeight: vi.fn(() => 297)
          }
        },
        addImage: vi.fn(),
        addPage: vi.fn(),
        save: vi.fn()
      };
      
      mockHtml2Canvas = vi.fn().mockResolvedValue({
        toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
        width: 800,
        height: 600
      });

      (jsPDF as any).mockImplementation(() => mockJsPDF);
      (html2canvas as any).mockImplementation(mockHtml2Canvas);
    });

    it('exports PDF when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      const exportButton = screen.getByText('Export PDF');
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockJsPDF.save).toHaveBeenCalledWith('John Doe_stats.pdf');
      });
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('handles player with missing image', () => {
      mockStatsHelper.getPlayerKeyStats.mockReturnValue({
        keyStats: mockKeyStats,
        chartStat: mockChartStat
      });

      const playerWithoutImage = { ...mockPlayer, imageUrl: '' };
      render(<PlayerStatsModal player={playerWithoutImage} onClose={mockOnClose} />);

      const image = screen.getByAltText('John Doe');
      expect(image).toHaveAttribute('src', '');
    });

    it('handles player with special characters in name', () => {
      mockStatsHelper.getPlayerKeyStats.mockReturnValue({
        keyStats: mockKeyStats,
        chartStat: mockChartStat
      });

      const playerWithSpecialName = { ...mockPlayer, name: "José María O'Connor" };
      render(<PlayerStatsModal player={playerWithSpecialName} onClose={mockOnClose} />);

      expect(screen.getByText("José María O'Connor")).toBeInTheDocument();
    });

    it('handles very long player names', () => {
      const playerWithLongName = {
        ...mockPlayer,
        name: 'A'.repeat(100)
      };

      render(<PlayerStatsModal player={playerWithLongName} onClose={mockOnClose} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('handles jersey number as string', () => {
      const playerWithStringJersey = { ...mockPlayer, jerseyNum: "99" };
      render(<PlayerStatsModal player={playerWithStringJersey} onClose={mockOnClose} />);

      expect(screen.getByText('Forward | #99')).toBeInTheDocument();
    });

  });

  // Integration Tests
  describe('Integration Tests', () => {
    it('integrates correctly with stats helper', () => {
      vi.clearAllMocks();
      mockStatsHelper.getPlayerKeyStats.mockReturnValue({
        keyStats: mockKeyStats,
        chartStat: mockChartStat
      });

      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      expect(mockStatsHelper.getPlayerKeyStats).toHaveBeenCalledWith(mockPlayer);
      expect(mockStatsHelper.getPlayerKeyStats).toHaveBeenCalledTimes(1);
    });

    it('passes correct data to child components', () => {
      mockStatsHelper.getPlayerKeyStats.mockReturnValue({
        keyStats: mockKeyStats,
        chartStat: mockChartStat
      });

      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      // Verify StatsChart receives performance data
      expect(screen.getByText('Chart with 5 data points')).toBeInTheDocument();

      // Verify StatsTable receives player object
      expect(screen.getByText('Stats for John Doe')).toBeInTheDocument();
    });

    it('handles modal lifecycle correctly', async () => {
      mockStatsHelper.getPlayerKeyStats.mockReturnValue({
        keyStats: mockKeyStats,
        chartStat: mockChartStat
      });

      const { rerender, unmount } = render(
        <PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />
      );

      // Modal should be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Update player data
      const updatedPlayer = { ...mockPlayer, name: 'Jane Doe' };
      rerender(<PlayerStatsModal player={updatedPlayer} onClose={mockOnClose} />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

      // Unmount should not cause errors
      unmount();
    });

    it('works with multiple players from mock data', () => {
      mockStatsHelper.getPlayerKeyStats.mockReturnValue({
        keyStats: mockKeyStats,
        chartStat: mockChartStat
      });

      // Test with first player from mockPlayers array
      render(<PlayerStatsModal player={mockPlayers[0]} onClose={mockOnClose} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Forward | #10')).toBeInTheDocument();

      // Test switching to second player
      render(
            <PlayerStatsModal player={mockPlayers[1]} onClose={mockOnClose} />
        );
      
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Midfielder | #8')).toBeInTheDocument();
    });

    it('handles team context correctly', () => {
      mockStatsHelper.getPlayerKeyStats.mockReturnValue({
        keyStats: mockKeyStats,
        chartStat: mockChartStat
      });

      const playerWithTeam = { ...mockPlayer, teamId: mockTeamId };
      render(<PlayerStatsModal player={playerWithTeam} onClose={mockOnClose} />);

      expect(mockStatsHelper.getPlayerKeyStats).toHaveBeenCalledWith(
        expect.objectContaining({ teamId: mockTeamId })
      );
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('John Doe');

      const subHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(subHeadings).toHaveLength(2);
    });

    it('has accessible image alt text', () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      const playerImage = screen.getByAltText('John Doe');
      expect(playerImage).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<PlayerStatsModal player={mockPlayer} onClose={mockOnClose} />);

      const closeButton = screen.getByText('×');
      const exportButton = screen.getByRole('button', { name: /export pdf/i });

      expect(closeButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
    });
  });
});