import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import F1StatsPage from '../pages/f1/F1StatsPage';
import { useConstructors } from '../pages/f1/F1ApiBackend';

// Mock the F1ApiBackend hook
vi.mock('../pages/f1/F1ApiBackend', () => ({
  useConstructors: vi.fn(),
}));

// Type assertion for mocked hook
const mockUseConstructors = useConstructors as ReturnType<typeof vi.fn>;

// Mock constructor data
const mockConstructorStats = [
  {
    constructorId: 'red_bull',
    constructorName: 'Red Bull Racing',
    stats: {
      position: 1,
      points: 860,
      wins: 21,
      podiums: 45,
    },
  },
  {
    constructorId: 'mercedes',
    constructorName: 'Mercedes',
    stats: {
      position: 2,
      points: 409,
      wins: 3,
      podiums: 12,
    },
  },
  {
    constructorId: 'ferrari',
    constructorName: 'Ferrari',
    stats: {
      position: 3,
      points: 406,
      wins: 1,
      podiums: 15,
    },
  },
  {
    constructorId: 'mclaren',
    constructorName: 'McLaren',
    stats: {
      position: 4,
      points: 302,
      wins: 0,
      podiums: 8,
    },
  },
];

describe('F1StatsPage Component', () => {
  // Mock Date to ensure consistent year across tests
  const mockDate = new Date('2025-10-19');
  const realDate = Date;
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockClear();
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as any;
  });

  afterEach(() => {
    global.Date = realDate;
    vi.clearAllMocks();
  });

  describe('Unit Tests - Loading State', () => {
    it('should display loading message when data is loading', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      expect(screen.getByText('Season Standings')).toBeInTheDocument();
      expect(screen.getByText('Loading standings...')).toBeInTheDocument();
    });

    it('should have accessible heading during loading', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      const heading = screen.getByRole('heading', { name: 'Season Standings' });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'stats-title');
    });

    it('should not show year selector during loading', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      expect(screen.queryByLabelText('Select Formula 1 season year')).not.toBeInTheDocument();
    });
  });

  describe('Unit Tests - Year Selection', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: mockRefetch,
      });
    });

    it('should render year selector with correct label', () => {
      render(<F1StatsPage />);

      expect(screen.getByLabelText('Select year:')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Formula 1 season year')).toBeInTheDocument();
    });

    it('should default to current year', () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year') as HTMLSelectElement;
      expect(select.value).toBe('2025');
    });

    it('should display last 5 years as options', () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');
      const options = Array.from(select.querySelectorAll('option'));

      expect(options).toHaveLength(5);
      expect(options[0]).toHaveTextContent('2025');
      expect(options[1]).toHaveTextContent('2024');
      expect(options[2]).toHaveTextContent('2023');
      expect(options[3]).toHaveTextContent('2022');
      expect(options[4]).toHaveTextContent('2021');
    });

    it('should have correct CSS class on year selector', () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');
      expect(select).toHaveClass('f1-dropdown');
    });

    it('should have correct id on year selector', () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');
      expect(select).toHaveAttribute('id', 'year-select');
    });

    it('should update year when option is selected', () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year') as HTMLSelectElement;

      fireEvent.change(select, { target: { value: '2023' } });

      expect(select.value).toBe('2023');
    });

    it('should call refetchStats when year changes', async () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');

      fireEvent.change(select, { target: { value: '2024' } });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith(2024);
      });
    });

    it('should call refetchStats on initial mount with current year', async () => {
      render(<F1StatsPage />);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith(2025);
      });
    });
  });

  describe('Unit Tests - Constructor Table Structure', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: mockRefetch,
      });
    });

    it('should render table with correct headers', () => {
      render(<F1StatsPage />);

      expect(screen.getByRole('columnheader', { name: 'Pos' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Team' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Points' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Wins' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Podiums' })).toBeInTheDocument();
    });

    it('should have correct CSS class on table', () => {
      const { container } = render(<F1StatsPage />);

      const table = container.querySelector('table');
      expect(table).toHaveClass('f1-table');
    });

    it('should have accessible table structure', () => {
      render(<F1StatsPage />);

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-describedby', 'constructor-standings');
    });

    it('should have correct section heading', () => {
      render(<F1StatsPage />);

      const heading = screen.getByRole('heading', { name: /Constructor Standings/i });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'constructor-standings');
    });

    it('should display year in constructor standings heading', () => {
      render(<F1StatsPage />);

      expect(screen.getByText('Constructor Standings (2025)')).toBeInTheDocument();
    });

    it('should update year in heading when year changes', async () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');
      fireEvent.change(select, { target: { value: '2023' } });

      await waitFor(() => {
        expect(screen.getByText('Constructor Standings (2023)')).toBeInTheDocument();
      });
    });
  });

  describe('Unit Tests - Constructor Data Rendering', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: mockRefetch,
      });
    });

    it('should render all constructor rows', () => {
      const { container } = render(<F1StatsPage />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(4);
    });

    it('should display constructor names correctly', () => {
      render(<F1StatsPage />);

      expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
      expect(screen.getByText('Mercedes')).toBeInTheDocument();
      expect(screen.getByText('Ferrari')).toBeInTheDocument();
      expect(screen.getByText('McLaren')).toBeInTheDocument();
    });

    it('should display points correctly', () => {
      render(<F1StatsPage />);

      expect(screen.getByText('860')).toBeInTheDocument();
      expect(screen.getByText('409')).toBeInTheDocument();
      expect(screen.getByText('406')).toBeInTheDocument();
      expect(screen.getByText('302')).toBeInTheDocument();
    });

    it('should display podiums correctly', () => {
      render(<F1StatsPage />);

      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  describe('Unit Tests - Data Sorting', () => {
    it('should sort constructors by position in ascending order', () => {
      const unsortedData = [
        {
          constructorId: 'ferrari',
          constructorName: 'Ferrari',
          stats: { position: 3, points: 406, wins: 1, podiums: 15 },
        },
        {
          constructorId: 'red_bull',
          constructorName: 'Red Bull Racing',
          stats: { position: 1, points: 860, wins: 21, podiums: 45 },
        },
        {
          constructorId: 'mercedes',
          constructorName: 'Mercedes',
          stats: { position: 2, points: 409, wins: 3, podiums: 12 },
        },
      ];

      mockUseConstructors.mockReturnValue({
        constructorStats: unsortedData,
        loading: false,
        refetchStats: mockRefetch,
      });

      const { container } = render(<F1StatsPage />);
      const rows = container.querySelectorAll('tbody tr');

      // Check that rows are sorted by position
      expect(rows[0]).toHaveTextContent('1');
      expect(rows[0]).toHaveTextContent('Red Bull Racing');
      expect(rows[1]).toHaveTextContent('2');
      expect(rows[1]).toHaveTextContent('Mercedes');
      expect(rows[2]).toHaveTextContent('3');
      expect(rows[2]).toHaveTextContent('Ferrari');
    });

    it('should handle constructors with same position', () => {
      const dataWithDuplicatePositions = [
        {
          constructorId: 'team_a',
          constructorName: 'Team A',
          stats: { position: 1, points: 100, wins: 5, podiums: 10 },
        },
        {
          constructorId: 'team_b',
          constructorName: 'Team B',
          stats: { position: 1, points: 100, wins: 5, podiums: 10 },
        },
      ];

      mockUseConstructors.mockReturnValue({
        constructorStats: dataWithDuplicatePositions,
        loading: false,
        refetchStats: mockRefetch,
      });

      const { container } = render(<F1StatsPage />);
      const rows = container.querySelectorAll('tbody tr');

      expect(rows).toHaveLength(2);
      expect(rows[0]).toHaveTextContent('1');
      expect(rows[1]).toHaveTextContent('1');
    });
  });

  describe('Unit Tests - Empty State', () => {
    it('should display message when no constructor data is available', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: [],
        loading: false,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      expect(screen.getByText(/No constructor standings available for 2025/i)).toBeInTheDocument();
    });

    it('should display correct year in empty message', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: [],
        loading: false,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');
      fireEvent.change(select, { target: { value: '2022' } });

      expect(screen.getByText(/No constructor standings available for 2022/i)).toBeInTheDocument();
    });

    it('should have correct colspan for empty message', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: [],
        loading: false,
        refetchStats: mockRefetch,
      });

      const { container } = render(<F1StatsPage />);

      const emptyCell = container.querySelector('td[colspan="5"]');
      expect(emptyCell).toBeInTheDocument();
    });

    it('should handle null constructor stats', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: false,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      expect(screen.getByText(/No constructor standings available for 2025/i)).toBeInTheDocument();
    });

    it('should have correct styling for empty message', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: [],
        loading: false,
        refetchStats: mockRefetch,
      });

      const { container } = render(<F1StatsPage />);

      const emptyCell = container.querySelector('td[colspan="5"]');
      expect(emptyCell).toHaveStyle({
        textAlign: 'center',
        padding: '2rem',
        color: '#999',
      });
    });
  });

  describe('Integration Tests - Complete Page Rendering', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: mockRefetch,
      });
    });

    it('should render complete page structure', () => {
      const { container } = render(<F1StatsPage />);

      expect(container.querySelector('.f1-page')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Season Standings' })).toBeInTheDocument();
      expect(screen.getByLabelText('Select Formula 1 season year')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should have correct accessibility attributes', () => {
      render(<F1StatsPage />);

      const section = screen.getByLabelText('Season Standings');
      expect(section).toHaveAttribute('aria-labelledby', 'stats-title');

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-describedby', 'constructor-standings');
    });

    it('should display all components together', () => {
      render(<F1StatsPage />);

      // Main heading
      expect(screen.getByText('Season Standings')).toBeInTheDocument();
      
      // Year selector
      expect(screen.getByLabelText('Select year:')).toBeInTheDocument();
      
      // Constructor standings heading
      expect(screen.getByText('Constructor Standings (2025)')).toBeInTheDocument();
      
      // Table with data
      expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
      expect(screen.getByText('860')).toBeInTheDocument();
    });
  });

  describe('Integration Tests - Year Change Flow', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: mockRefetch,
      });
    });

    it('should update all year references when year changes', async () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');
      
      // Initially 2025
      expect(screen.getByText('Constructor Standings (2025)')).toBeInTheDocument();
      
      // Change to 2024
      fireEvent.change(select, { target: { value: '2024' } });
      
      await waitFor(() => {
        expect(screen.getByText('Constructor Standings (2024)')).toBeInTheDocument();
        expect(mockRefetch).toHaveBeenCalledWith(2024);
      });
    });

    it('should refetch data when year changes multiple times', async () => {
      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');
      
      fireEvent.change(select, { target: { value: '2024' } });
      await waitFor(() => expect(mockRefetch).toHaveBeenCalledWith(2024));
      
      fireEvent.change(select, { target: { value: '2023' } });
      await waitFor(() => expect(mockRefetch).toHaveBeenCalledWith(2023));
      
      fireEvent.change(select, { target: { value: '2022' } });
      await waitFor(() => expect(mockRefetch).toHaveBeenCalledWith(2022));

      expect(mockRefetch).toHaveBeenCalledTimes(4); // Initial + 3 changes
    });
  });

  describe('Integration Tests - Loading to Data State Transition', () => {
    it('should transition from loading to displaying data', async () => {
      // Start with loading state
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: mockRefetch,
      });

      const { rerender } = render(<F1StatsPage />);
      
      expect(screen.getByText('Loading standings...')).toBeInTheDocument();
      expect(screen.queryByLabelText('Select Formula 1 season year')).not.toBeInTheDocument();

      // Transition to loaded state
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: mockRefetch,
      });

      rerender(<F1StatsPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading standings...')).not.toBeInTheDocument();
        expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
        expect(screen.getByLabelText('Select Formula 1 season year')).toBeInTheDocument();
      });
    });

    it('should transition from data to loading state', async () => {
      // Start with data
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: mockRefetch,
      });

      const { rerender } = render(<F1StatsPage />);
      
      expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();

      // Transition to loading
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: mockRefetch,
      });

      rerender(<F1StatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Loading standings...')).toBeInTheDocument();
        expect(screen.queryByText('Red Bull Racing')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle constructor with zero stats', () => {
      const zeroStatsConstructor = [{
        constructorId: 'zero_team',
        constructorName: 'Zero Team',
        stats: {
          position: 1,
          points: 0,
          wins: 0,
          podiums: 0,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: zeroStatsConstructor,
        loading: false,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      expect(screen.getByText('Zero Team')).toBeInTheDocument();
      const cells = screen.getAllByRole('cell');
      const zeroCells = cells.filter(cell => cell.textContent === '0');
      expect(zeroCells.length).toBeGreaterThanOrEqual(3); // points, wins, podiums
    });

    it('should handle very large numbers', () => {
      const largeNumbersConstructor = [{
        constructorId: 'test_team',
        constructorName: 'Test Team',
        stats: {
          position: 1,
          points: 99999,
          wins: 999,
          podiums: 9999,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: largeNumbersConstructor,
        loading: false,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      expect(screen.getByText('99999')).toBeInTheDocument();
      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('9999')).toBeInTheDocument();
    });

    it('should handle constructor with very long name', () => {
      const longNameConstructor = [{
        constructorId: 'long_team',
        constructorName: 'Very Long Constructor Name Racing Team Formula One',
        stats: {
          position: 1,
          points: 100,
          wins: 5,
          podiums: 10,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: longNameConstructor,
        loading: false,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      expect(screen.getByText('Very Long Constructor Name Racing Team Formula One')).toBeInTheDocument();
    });

    it('should handle single constructor', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: [mockConstructorStats[0]],
        loading: false,
        refetchStats: mockRefetch,
      });

      const { container } = render(<F1StatsPage />);
      const rows = container.querySelectorAll('tbody tr');

      expect(rows).toHaveLength(1);
      expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    });

    it('should preserve data immutability when sorting', () => {
      const originalData = [...mockConstructorStats];
      
      mockUseConstructors.mockReturnValue({
        constructorStats: originalData,
        loading: false,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      // Original data should not be mutated
      expect(originalData[0].constructorId).toBe('red_bull');
      expect(originalData[1].constructorId).toBe('mercedes');
    });

    it('should handle rapid year changes', async () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: mockRefetch,
      });

      render(<F1StatsPage />);

      const select = screen.getByLabelText('Select Formula 1 season year');
      
      // Rapidly change years
      fireEvent.change(select, { target: { value: '2024' } });
      fireEvent.change(select, { target: { value: '2023' } });
      fireEvent.change(select, { target: { value: '2022' } });
      fireEvent.change(select, { target: { value: '2021' } });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledTimes(5); // Initial + 4 changes
      });
    });
  });
});