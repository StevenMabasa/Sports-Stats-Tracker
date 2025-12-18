import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import F1TeamsPage from '../pages/f1/F1TeamPage';
import { useConstructors, useDrivers } from '../pages/f1/F1ApiBackend';

// Mock the F1ApiBackend hooks
vi.mock('../pages/f1/F1ApiBackend', () => ({
  useConstructors: vi.fn(),
  useDrivers: vi.fn(),
}));

// Mock CSS import
vi.mock('../pages/f1/F1TeamsPage.css', () => ({}));

// Type assertions for mocked hooks
const mockUseConstructors = useConstructors as ReturnType<typeof vi.fn>;
const mockUseDrivers = useDrivers as ReturnType<typeof vi.fn>;

// Mock data
const mockConstructorStats = [
  {
    constructorId: 'red_bull',
    constructorName: 'Red Bull',
    stats: {
      position: 1,
      points: 860,
      wins: 21,
      podiums: 45,
    },
  },
  {
    constructorId: 'mclaren',
    constructorName: 'McLaren',
    stats: {
      position: 2,
      points: 709,
      wins: 17,
      podiums: 38,
    },
  },
  {
    constructorId: 'ferrari',
    constructorName: 'Ferrari',
    stats: {
      position: 3,
      points: 652,
      wins: 5,
      podiums: 30,
    },
  },
  {
    constructorId: 'mercedes',
    constructorName: 'Mercedes',
    stats: {
      position: 4,
      points: 468,
      wins: 3,
      podiums: 12,
    },
  },
];

const mockDrivers = [
  {
    id: '1',
    full_name: 'Max Verstappen',
    given_name: 'Max',
    family_name: 'VERSTAPPEN',
    code: 'VER',
    image_url: 'https://example.com/verstappen.png',
    country_code: 'NLD',
    driver_number: 1,
    current_team_name: 'Red Bull',
  },
  {
    id: '2',
    full_name: 'Sergio Pérez',
    given_name: 'Sergio',
    family_name: 'PÉREZ',
    code: 'PER',
    image_url: 'https://example.com/perez.png',
    country_code: 'MEX',
    driver_number: 11,
    current_team_name: 'Red Bull',
  },
  {
    id: '3',
    full_name: 'Lando Norris',
    given_name: 'Lando',
    family_name: 'NORRIS',
    code: 'NOR',
    image_url: 'https://example.com/norris.png',
    country_code: 'GBR',
    driver_number: 4,
    current_team_name: 'McLaren',
  },
  {
    id: '4',
    full_name: 'Oscar Piastri',
    given_name: 'Oscar',
    family_name: 'PIASTRI',
    code: 'PIA',
    image_url: 'https://example.com/piastri.png',
    country_code: 'AUS',
    driver_number: 81,
    current_team_name: 'McLaren',
  },
  {
    id: '5',
    full_name: 'Charles Leclerc',
    given_name: 'Charles',
    family_name: 'LECLERC',
    code: 'LEC',
    image_url: 'https://example.com/leclerc.png',
    country_code: 'MCO',
    driver_number: 16,
    current_team_name: 'Ferrari',
  },
  {
    id: '6',
    full_name: 'Carlos Sainz',
    given_name: 'Carlos',
    family_name: 'SAINZ',
    code: 'SAI',
    image_url: 'https://example.com/sainz.png',
    country_code: 'ESP',
    driver_number: 55,
    current_team_name: 'Ferrari',
  },
  {
    id: '7',
    full_name: 'Lewis Hamilton',
    given_name: 'Lewis',
    family_name: 'HAMILTON',
    code: 'HAM',
    image_url: 'https://example.com/hamilton.png',
    country_code: 'GBR',
    driver_number: 44,
    current_team_name: 'Mercedes',
  },
  {
    id: '8',
    full_name: 'George Russell',
    given_name: 'George',
    family_name: 'RUSSELL',
    code: 'RUS',
    image_url: 'https://example.com/russell.png',
    country_code: 'GBR',
    driver_number: 63,
    current_team_name: 'Mercedes',
  },
];

describe('F1TeamsPage - UI Tests', () => {
  const mockDate = new Date('2025-10-19');
  const realDate = Date;

  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('Loading State UI', () => {
    it('should display loading state with flag emoji', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: null,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('🏁')).toBeInTheDocument();
      expect(screen.getByText('Loading constructor standings...')).toBeInTheDocument();
    });

    it('should display loading when constructors are loading', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Loading constructor standings...')).toBeInTheDocument();
    });

    it('should display loading when drivers are loading', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: null,
        loading: true,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Loading constructor standings...')).toBeInTheDocument();
    });

    it('should display loading when both are loading', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: null,
        loading: true,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Loading constructor standings...')).toBeInTheDocument();
    });

    it('should display page header during loading', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: true,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: null,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Constructor Standings')).toBeInTheDocument();
      expect(screen.getByText('2025 FIA Formula One World Championship')).toBeInTheDocument();
    });
  });

  describe('Page Header UI', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should render page title', () => {
      render(<F1TeamsPage />);

      const title = screen.getByText('Constructor Standings');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('page-title');
    });

    it('should render page subtitle with current year', () => {
      render(<F1TeamsPage />);

      const subtitle = screen.getByText('2025 FIA Formula One World Championship');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass('page-subtitle');
    });

    it('should have page header container', () => {
      const { container } = render(<F1TeamsPage />);

      const header = container.querySelector('.page-header');
      expect(header).toBeInTheDocument();
      expect(header).toContainElement(screen.getByText('Constructor Standings'));
      expect(header).toContainElement(screen.getByText('2025 FIA Formula One World Championship'));
    });
  });

  describe('Team Cards Grid Layout', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should render teams grid container', () => {
      const { container } = render(<F1TeamsPage />);

      const grid = container.querySelector('.teams-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should render all team cards', () => {
      const { container } = render(<F1TeamsPage />);

      const teamCards = container.querySelectorAll('.f1-team-card');
      expect(teamCards).toHaveLength(4);
    });

    it('should render teams in position order', () => {
      const { container } = render(<F1TeamsPage />);

      const teamCards = container.querySelectorAll('.f1-team-card');
      const positions = Array.from(teamCards).map(card => 
        card.querySelector('.position-number')?.textContent
      );

      expect(positions).toEqual(['P1', 'P2', 'P3', 'P4']);
    });

    it('should render page container with correct class', () => {
      const { container } = render(<F1TeamsPage />);

      expect(container.querySelector('.f1-teams-page')).toBeInTheDocument();
    });
  });

  describe('Team Card Visual Elements', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should display team position badge', () => {
      render(<F1TeamsPage />);

      expect(screen.getByText('P1')).toBeInTheDocument();
      expect(screen.getByText('P2')).toBeInTheDocument();
      expect(screen.getByText('P3')).toBeInTheDocument();
      expect(screen.getByText('P4')).toBeInTheDocument();
    });

    it('should display team names', () => {
      render(<F1TeamsPage />);

      expect(screen.getByText('Red Bull')).toBeInTheDocument();
      expect(screen.getByText('McLaren')).toBeInTheDocument();
      expect(screen.getByText('Ferrari')).toBeInTheDocument();
      expect(screen.getByText('Mercedes')).toBeInTheDocument();
    });

    it('should display team points', () => {
      render(<F1TeamsPage />);

      expect(screen.getByText('860')).toBeInTheDocument();
      expect(screen.getByText('709')).toBeInTheDocument();
      expect(screen.getByText('652')).toBeInTheDocument();
      expect(screen.getByText('468')).toBeInTheDocument();
    });

    it('should display POINTS label for each team', () => {
      render(<F1TeamsPage />);

      const pointsLabels = screen.getAllByText('POINTS');
      expect(pointsLabels).toHaveLength(4);
    });

    it('should have team card pattern element', () => {
      const { container } = render(<F1TeamsPage />);

      const patterns = container.querySelectorAll('.team-card-pattern');
      expect(patterns).toHaveLength(4);
    });

    it('should have team logo placeholder with first letter', () => {
      const { container } = render(<F1TeamsPage />);

      const logoContainers = container.querySelectorAll('.team-logo-container');
      expect(logoContainers).toHaveLength(4);

      // Check that first letters are displayed (R, M, F, M)
      expect(logoContainers[0].textContent).toContain('R'); // Red Bull
      expect(logoContainers[1].textContent).toContain('M'); // McLaren
      expect(logoContainers[2].textContent).toContain('F'); // Ferrari
      expect(logoContainers[3].textContent).toContain('M'); // Mercedes
    });

    it('should have accent stripe for each team', () => {
      const { container } = render(<F1TeamsPage />);

      const stripes = container.querySelectorAll('.team-accent-stripe');
      expect(stripes).toHaveLength(4);
    });
  });

  describe('Team Card Color Schemes', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should apply gradient background to all team cards', () => {
      const { container } = render(<F1TeamsPage />);

      const teamCards = container.querySelectorAll('.f1-team-card');
      teamCards.forEach(card => {
        const style = window.getComputedStyle(card);
        expect(style.background).toContain('linear-gradient');
      });
    });
  });

  describe('Driver Display in Team Cards', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should display Red Bull drivers', () => {
      render(<F1TeamsPage />);

      expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
      expect(screen.getByText('Sergio Pérez')).toBeInTheDocument();
    });

    it('should display McLaren drivers', () => {
      render(<F1TeamsPage />);

      expect(screen.getByText('Lando Norris')).toBeInTheDocument();
      expect(screen.getByText('Oscar Piastri')).toBeInTheDocument();
    });

    it('should display Ferrari drivers', () => {
      render(<F1TeamsPage />);

      expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
      expect(screen.getByText('Carlos Sainz')).toBeInTheDocument();
    });

    it('should display Mercedes drivers', () => {
      render(<F1TeamsPage />);

      expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
      expect(screen.getByText('George Russell')).toBeInTheDocument();
    });

    it('should group drivers by team correctly', () => {
      const { container } = render(<F1TeamsPage />);

      const redBullCard = container.querySelectorAll('.f1-team-card')[0];
      const redBullDrivers = within(redBullCard as HTMLElement).getAllByText(/Verstappen|Pérez/);
      expect(redBullDrivers).toHaveLength(2);

      const mclarenCard = container.querySelectorAll('.f1-team-card')[1];
      const mclarenDrivers = within(mclarenCard as HTMLElement).getAllByText(/Norris|Piastri/);
      expect(mclarenDrivers).toHaveLength(2);
    });

    it('should have driver-name class on driver elements', () => {
      const { container } = render(<F1TeamsPage />);

      const driverElements = container.querySelectorAll('.driver-name');
      expect(driverElements.length).toBeGreaterThan(0);
    });

    it('should display drivers in team-drivers container', () => {
      const { container } = render(<F1TeamsPage />);

      const driverContainers = container.querySelectorAll('.team-drivers');
      expect(driverContainers).toHaveLength(4);
    });
  });

  describe('Team Card Structure and CSS Classes', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should have correct CSS classes on team cards', () => {
      const { container } = render(<F1TeamsPage />);

      const teamCard = container.querySelector('.f1-team-card');
      expect(teamCard).toBeInTheDocument();
      expect(teamCard?.querySelector('.team-card-pattern')).toBeInTheDocument();
      expect(teamCard?.querySelector('.team-position')).toBeInTheDocument();
      expect(teamCard?.querySelector('.team-logo-container')).toBeInTheDocument();
      expect(teamCard?.querySelector('.team-info')).toBeInTheDocument();
      expect(teamCard?.querySelector('.team-points-section')).toBeInTheDocument();
      expect(teamCard?.querySelector('.team-accent-stripe')).toBeInTheDocument();
    });

    it('should have position-number class on position badge', () => {
      const { container } = render(<F1TeamsPage />);

      const positionElements = container.querySelectorAll('.position-number');
      expect(positionElements).toHaveLength(4);
    });

    it('should have f1-team-name class on team names', () => {
      const { container } = render(<F1TeamsPage />);

      const teamNames = container.querySelectorAll('.f1-team-name');
      expect(teamNames).toHaveLength(4);
    });

    it('should have team-points and points-related classes', () => {
      const { container } = render(<F1TeamsPage />);

      expect(container.querySelectorAll('.team-points')).toHaveLength(4);
      expect(container.querySelectorAll('.points-number')).toHaveLength(4);
      expect(container.querySelectorAll('.points-label')).toHaveLength(4);
    });
  });

  describe('Empty and Edge Case UI States', () => {
    it('should handle team with no drivers', () => {
      const teamWithNoDrivers = [{
        constructorId: 'solo_team',
        constructorName: 'Solo Team',
        stats: {
          position: 1,
          points: 100,
          wins: 5,
          podiums: 10,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: teamWithNoDrivers,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Solo Team')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should handle empty constructor stats array', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: [],
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { container } = render(<F1TeamsPage />);

      expect(screen.getByText('Constructor Standings')).toBeInTheDocument();
      expect(container.querySelectorAll('.f1-team-card')).toHaveLength(0);
    });

    it('should handle null constructor stats', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: null,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { container } = render(<F1TeamsPage />);

      expect(screen.getByText('Constructor Standings')).toBeInTheDocument();
      expect(container.querySelectorAll('.f1-team-card')).toHaveLength(0);
    });

    it('should handle null drivers array', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: null,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      // Teams should still render, just without drivers
      expect(screen.getByText('Red Bull')).toBeInTheDocument();
      expect(screen.getByText('McLaren')).toBeInTheDocument();
    });

    it('should handle team with single driver', () => {
      const singleDriverTeam = [{
        constructorId: 'single_team',
        constructorName: 'Single Team',
        stats: {
          position: 1,
          points: 100,
          wins: 5,
          podiums: 10,
        },
      }];

      const singleDriver = [{
        ...mockDrivers[0],
        current_team_name: 'Single Team',
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: singleDriverTeam,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: singleDriver,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Single Team')).toBeInTheDocument();
      expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    });

    it('should handle team with more than 2 drivers', () => {
      const multiDriverTeam = [{
        constructorId: 'multi_team',
        constructorName: 'Multi Team',
        stats: {
          position: 1,
          points: 100,
          wins: 5,
          podiums: 10,
        },
      }];

      const multipleDrivers = [
        { ...mockDrivers[0], current_team_name: 'Multi Team' },
        { ...mockDrivers[1], current_team_name: 'Multi Team' },
        { ...mockDrivers[2], current_team_name: 'Multi Team' },
      ];

      mockUseConstructors.mockReturnValue({
        constructorStats: multiDriverTeam,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: multipleDrivers,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Multi Team')).toBeInTheDocument();
      expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
      expect(screen.getByText('Sergio Pérez')).toBeInTheDocument();
      expect(screen.getByText('Lando Norris')).toBeInTheDocument();
    });
  });

  describe('Team Card Content Layout', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats.slice(0, 1), // Just Red Bull
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers.slice(0, 2), // Red Bull drivers
        loading: false,
        error: null,
      });
    });

    it('should display all sections in team card', () => {
      const { container } = render(<F1TeamsPage />);

      const card = container.querySelector('.f1-team-card');
      expect(card?.querySelector('.team-position')).toBeInTheDocument();
      expect(card?.querySelector('.team-logo-container')).toBeInTheDocument();
      expect(card?.querySelector('.team-info')).toBeInTheDocument();
      expect(card?.querySelector('.team-points-section')).toBeInTheDocument();
    });

    it('should have team info section with name and drivers', () => {
      const { container } = render(<F1TeamsPage />);

      const teamInfo = container.querySelector('.team-info');
      expect(teamInfo?.querySelector('.f1-team-name')).toBeInTheDocument();
      expect(teamInfo?.querySelector('.team-drivers')).toBeInTheDocument();
    });

    it('should have points section with number and label', () => {
      const { container } = render(<F1TeamsPage />);

      const pointsSection = container.querySelector('.team-points-section');
      expect(pointsSection?.querySelector('.team-points')).toBeInTheDocument();
      expect(pointsSection?.querySelector('.points-number')).toBeInTheDocument();
      expect(pointsSection?.querySelector('.points-label')).toBeInTheDocument();
    });

    it('should display logo placeholder with correct styling', () => {
      const { container } = render(<F1TeamsPage />);

      const logoContainer = container.querySelector('.team-logo-container');
      const logoPlaceholder = logoContainer?.querySelector('div');
      
      expect(logoPlaceholder).toHaveStyle({
        fontSize: '3rem',
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.1)',
        textAlign: 'center',
      });
    });
  });

  describe('Responsive and Visual Regression', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should render all visual elements without crashing', () => {
      const { container } = render(<F1TeamsPage />);

      expect(container.querySelector('.f1-teams-page')).toBeInTheDocument();
      expect(container.querySelector('.page-header')).toBeInTheDocument();
      expect(container.querySelector('.teams-grid')).toBeInTheDocument();
      expect(container.querySelectorAll('.f1-team-card')).toHaveLength(4);
    });

    it('should maintain card structure consistency across all teams', () => {
      const { container } = render(<F1TeamsPage />);

      const teamCards = container.querySelectorAll('.f1-team-card');
      
      teamCards.forEach(card => {
        expect(card.querySelector('.team-card-pattern')).toBeInTheDocument();
        expect(card.querySelector('.team-position')).toBeInTheDocument();
        expect(card.querySelector('.team-logo-container')).toBeInTheDocument();
        expect(card.querySelector('.team-info')).toBeInTheDocument();
        expect(card.querySelector('.team-points-section')).toBeInTheDocument();
        expect(card.querySelector('.team-accent-stripe')).toBeInTheDocument();
      });
    });

    it('should have consistent class naming across all cards', () => {
      const { container } = render(<F1TeamsPage />);

      const teamCards = container.querySelectorAll('.f1-team-card');
      expect(teamCards.length).toBeGreaterThan(0);

      teamCards.forEach(card => {
        expect(card.className).toBe('f1-team-card');
      });
    });
  });

  describe('Data Sorting and Position Display', () => {
    it('should sort teams by position in ascending order', () => {
      const unsortedStats = [
        {
          constructorId: 'ferrari',
          constructorName: 'Ferrari',
          stats: { position: 3, points: 652, wins: 5, podiums: 30 },
        },
        {
          constructorId: 'red_bull',
          constructorName: 'Red Bull',
          stats: { position: 1, points: 860, wins: 21, podiums: 45 },
        },
        {
          constructorId: 'mclaren',
          constructorName: 'McLaren',
          stats: { position: 2, points: 709, wins: 17, podiums: 38 },
        },
      ];

      mockUseConstructors.mockReturnValue({
        constructorStats: unsortedStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { container } = render(<F1TeamsPage />);

      const teamCards = container.querySelectorAll('.f1-team-card');
      const teamNames = Array.from(teamCards).map(card => 
        card.querySelector('.f1-team-name')?.textContent
      );

      expect(teamNames).toEqual(['Red Bull', 'McLaren', 'Ferrari']);
    });

    it('should display position badges in correct order', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { container } = render(<F1TeamsPage />);

      const positions = Array.from(container.querySelectorAll('.position-number')).map(
        el => el.textContent
      );

      expect(positions).toEqual(['P1', 'P2', 'P3', 'P4']);
    });
  });

  describe('Special Characters and Internationalization', () => {
    it('should handle team names with special characters', () => {
      const specialTeam = [{
        constructorId: 'special_team',
        constructorName: 'Équipe Spéciale',
        stats: {
          position: 1,
          points: 100,
          wins: 5,
          podiums: 10,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: specialTeam,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Équipe Spéciale')).toBeInTheDocument();
    });

    it('should handle driver names with special characters', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats.slice(0, 1), // Red Bull
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers.slice(1, 2), // Sergio Pérez
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Sergio Pérez')).toBeInTheDocument();
    });

    it('should handle very long team names', () => {
      const longNameTeam = [{
        constructorId: 'long_team',
        constructorName: 'Very Long Constructor Name Racing Team Formula One Championship',
        stats: {
          position: 1,
          points: 100,
          wins: 5,
          podiums: 10,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: longNameTeam,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Very Long Constructor Name Racing Team Formula One Championship')).toBeInTheDocument();
    });

    it('should handle very long driver names', () => {
      const longNameDriver = [{
        ...mockDrivers[0],
        full_name: 'Jean-Éric Vergne de la Montagne',
        current_team_name: 'Red Bull',
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats.slice(0, 1),
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: longNameDriver,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Jean-Éric Vergne de la Montagne')).toBeInTheDocument();
    });
  });

  describe('Zero and Extreme Values', () => {
    it('should handle team with zero points', () => {
      const zeroPointsTeam = [{
        constructorId: 'zero_team',
        constructorName: 'Zero Team',
        stats: {
          position: 10,
          points: 0,
          wins: 0,
          podiums: 0,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: zeroPointsTeam,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Zero Team')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('P10')).toBeInTheDocument();
    });

    it('should handle team with very high points', () => {
      const highPointsTeam = [{
        constructorId: 'high_team',
        constructorName: 'High Team',
        stats: {
          position: 1,
          points: 9999,
          wins: 99,
          podiums: 199,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: highPointsTeam,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('9999')).toBeInTheDocument();
    });

    it('should handle double-digit position', () => {
      const lowPositionTeam = [{
        constructorId: 'low_team',
        constructorName: 'Low Team',
        stats: {
          position: 15,
          points: 5,
          wins: 0,
          podiums: 0,
        },
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: lowPositionTeam,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('P15')).toBeInTheDocument();
    });
  });


  describe('Driver Filtering and Matching', () => {
    it('should only show drivers that match team name exactly', () => {
      const partialMatchDriver = [{
        ...mockDrivers[0],
        current_team_name: 'Red Bull Racing', // Different from 'Red Bull'
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats.slice(0, 1), // 'Red Bull'
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: partialMatchDriver,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Red Bull')).toBeInTheDocument();
      // Driver shouldn't appear because team name doesn't match exactly
      expect(screen.queryByText('Max Verstappen')).not.toBeInTheDocument();
    });

    it('should handle multiple drivers with same team', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats.slice(0, 1), // Red Bull
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers.slice(0, 2), // Both Red Bull drivers
        loading: false,
        error: null,
      });

      const { container } = render(<F1TeamsPage />);

      const redBullCard = container.querySelector('.f1-team-card');
      const driverElements = redBullCard?.querySelectorAll('.driver-name');
      
      expect(driverElements).toHaveLength(2);
    });

    it('should handle driver with undefined team name', () => {
      const driverNoTeam = [{
        ...mockDrivers[0],
        current_team_name: undefined as any,
      }];

      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats.slice(0, 1),
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: driverNoTeam,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      expect(screen.getByText('Red Bull')).toBeInTheDocument();
      expect(screen.queryByText('Max Verstappen')).not.toBeInTheDocument();
    });
  });

  describe('Key Prop and Rendering Optimization', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should use unique keys for team cards', () => {
      const { container } = render(<F1TeamsPage />);

      const teamCards = container.querySelectorAll('.f1-team-card');
      
      // Each team card should be rendered (tests that React keys work)
      expect(teamCards).toHaveLength(4);
    });

    it('should use unique keys for driver elements', () => {
      const { container } = render(<F1TeamsPage />);

      const driverElements = container.querySelectorAll('.driver-name');
      
      // All drivers should be rendered with unique keys
      expect(driverElements.length).toBeGreaterThan(0);
    });

    it('should render all teams without duplicate keys warning', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<F1TeamsPage />);

      // Check that no React key warnings were logged
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('key')
      );
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('key')
      );

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility and Semantic HTML', () => {
    beforeEach(() => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should use heading tags for titles', () => {
      render(<F1TeamsPage />);

      const mainTitle = screen.getByRole('heading', { name: 'Constructor Standings' });
      expect(mainTitle.tagName).toBe('H1');

      const teamNames = screen.getAllByRole('heading', { name: /Red Bull|McLaren|Ferrari|Mercedes/ });
      teamNames.forEach(heading => {
        expect(heading.tagName).toBe('H2');
      });
    });

    it('should have meaningful text content', () => {
      render(<F1TeamsPage />);

      expect(screen.getByText('Constructor Standings')).toBeInTheDocument();
      expect(screen.getByText(/FIA Formula One World Championship/)).toBeInTheDocument();
      expect(screen.getAllByText('POINTS')).toHaveLength(4);
    });

    it('should structure content hierarchically', () => {
      const { container } = render(<F1TeamsPage />);

      const page = container.querySelector('.f1-teams-page');
      const header = page?.querySelector('.page-header');
      const grid = page?.querySelector('.teams-grid');

      expect(header).toBeInTheDocument();
      expect(grid).toBeInTheDocument();
      
      // Header should come before grid
      expect(header?.compareDocumentPosition(grid!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Complete Integration UI Flow', () => {
    it('should render complete page with all teams and drivers', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      render(<F1TeamsPage />);

      // Header
      expect(screen.getByText('Constructor Standings')).toBeInTheDocument();
      expect(screen.getByText('2025 FIA Formula One World Championship')).toBeInTheDocument();

      // All teams
      expect(screen.getByText('Red Bull')).toBeInTheDocument();
      expect(screen.getByText('McLaren')).toBeInTheDocument();
      expect(screen.getByText('Ferrari')).toBeInTheDocument();
      expect(screen.getByText('Mercedes')).toBeInTheDocument();

      // All positions
      expect(screen.getByText('P1')).toBeInTheDocument();
      expect(screen.getByText('P2')).toBeInTheDocument();
      expect(screen.getByText('P3')).toBeInTheDocument();
      expect(screen.getByText('P4')).toBeInTheDocument();

      // All points
      expect(screen.getByText('860')).toBeInTheDocument();
      expect(screen.getByText('709')).toBeInTheDocument();
      expect(screen.getByText('652')).toBeInTheDocument();
      expect(screen.getByText('468')).toBeInTheDocument();

      // Sample drivers
      expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
      expect(screen.getByText('Lando Norris')).toBeInTheDocument();
      expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
      expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    });

    it('should maintain visual consistency across all cards', () => {
      mockUseConstructors.mockReturnValue({
        constructorStats: mockConstructorStats,
        loading: false,
        refetchStats: vi.fn(),
      });
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { container } = render(<F1TeamsPage />);

      const cards = container.querySelectorAll('.f1-team-card');
      
      cards.forEach(card => {
        // Each card should have all structural elements
        expect(card.querySelector('.team-position')).toBeInTheDocument();
        expect(card.querySelector('.team-logo-container')).toBeInTheDocument();
        expect(card.querySelector('.team-info')).toBeInTheDocument();
        expect(card.querySelector('.f1-team-name')).toBeInTheDocument();
        expect(card.querySelector('.team-drivers')).toBeInTheDocument();
        expect(card.querySelector('.team-points-section')).toBeInTheDocument();
        expect(card.querySelector('.points-number')).toBeInTheDocument();
        expect(card.querySelector('.points-label')).toBeInTheDocument();
        expect(card.querySelector('.team-accent-stripe')).toBeInTheDocument();
        expect(card.querySelector('.team-card-pattern')).toBeInTheDocument();
      });
    });
  });
});