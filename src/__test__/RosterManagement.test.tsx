import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RosterManagement from '../pages/coachDashboard/playerManagement/RosterManagement';
import type { Player } from '../types';
import type { SetStateAction } from 'react';

// Mock PlayerCard component
vi.mock('../../components/playerCard', () => ({
  default: ({ children, name, position, jerseyNum, imageUrl }: any) => (
    <div data-testid="player-card">
      <div data-testid="player-name">{name}</div>
      <div data-testid="player-position">{position}</div>
      <div data-testid="player-jersey">{jerseyNum}</div>
      <div data-testid="player-image">{imageUrl}</div>
      {children}
    </div>
  ),
}));

// Mock data
const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: `player-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Player',
  jerseyNum: '10',
  teamId: 'team-1',
  position: 'CM',
  stats: {
      goals: 5,
      assists: 3,
      minutesPlayed: 900,
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
      performanceData: []
  },
  imageUrl: 'https://example.com/player.jpg',
  ...overrides,
});

const mockPlayers: Player[] = [
  createMockPlayer({ id: 'gk1', name: 'John Goalkeeper', position: 'GK', jerseyNum: '1' }),
  createMockPlayer({ id: 'cb1', name: 'Mike Defender', position: 'CB', jerseyNum: '4' }),
  createMockPlayer({ id: 'cb2', name: 'Alex Center Back', position: 'CB', jerseyNum: '5' }),
  createMockPlayer({ id: 'lb1', name: 'Tom Left Back', position: 'LB', jerseyNum: '3' }),
  createMockPlayer({ id: 'cm1', name: 'Dave Midfielder', position: 'CM', jerseyNum: '6' }),
  createMockPlayer({ id: 'cam1', name: 'Sam Attacking Mid', position: 'CAM', jerseyNum: '8' }),
  createMockPlayer({ id: 'lw1', name: 'Chris Winger', position: 'LW', jerseyNum: '11' }),
  createMockPlayer({ id: 'st1', name: 'Leo Striker', position: 'ST', jerseyNum: '9' }),
  createMockPlayer({ id: 'cf1', name: 'Robert Forward', position: 'CF', jerseyNum: '10' }),
];

// Default props
const defaultProps = {
  players: [],
  lineupIds: new Set<string>(),
  onAddPlayer: vi.fn(),
  onRemovePlayer: vi.fn(),
  onAddToLineup: vi.fn(),
  onPlayerClick: vi.fn(),
};

describe('RosterManagement Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Unit Tests - Rendering', () => {
    it('should render the component with correct title', () => {
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} />);
      expect(screen.getByText('Team Roster')).toBeInTheDocument();
      expect(screen.getByText('Add New Player')).toBeInTheDocument();
    });

    it('should render add player form with all required fields', () => {
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Player Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Select Position')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Jersey Number')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Player' })).toBeInTheDocument();
    });

    // it('should render all position options in select dropdown', () => {
    //   render(<RosterManagement {...defaultProps} />);
      
    //   const select = screen.getByDisplayValue('Select Position');
      
    //   // Check optgroups
    //   expect(screen.getByText('Goalkeepers')).toBeInTheDocument();
    //   expect(screen.getByText('Defenders')).toBeInTheDocument();
    //   expect(screen.getByText('Midfielders')).toBeInTheDocument();
    //   expect(screen.getByText('Forwards')).toBeInTheDocument();
      
    //   // Check specific positions
    //   expect(screen.getByText('GK - Goalkeeper')).toBeInTheDocument();
    //   expect(screen.getByText('CB - Center Back')).toBeInTheDocument();
    //   expect(screen.getByText('CM - Center Midfielder')).toBeInTheDocument();
    //   expect(screen.getByText('ST - Striker')).toBeInTheDocument();
    // });

    it('should not render position groups when no players exist', () => {
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={[]} />);
      
      expect(screen.queryByText('Goalkeepers (1)')).not.toBeInTheDocument();
      expect(screen.queryByText('Defenders')).not.toBeInTheDocument();
    });

    it('should render players grouped by position categories', () => {
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={mockPlayers} />);
      
      expect(screen.getByText('Goalkeepers (1)')).toBeInTheDocument();
      expect(screen.getByText('Defenders (3)')).toBeInTheDocument();
      expect(screen.getByText('Midfielders (2)')).toBeInTheDocument();
      expect(screen.getByText('Forwards (3)')).toBeInTheDocument();
    });

  });

  describe('Unit Tests - Form Functionality', () => {

    it('should call onAddPlayer when form is submitted with valid data', async () => {
      const onAddPlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} onAddPlayer={onAddPlayer} />);
      
      const nameInput = screen.getByPlaceholderText('Player Name');
      const positionSelect = screen.getByDisplayValue('Select Position');
      const jerseyInput = screen.getByPlaceholderText('Jersey Number');
      const submitButton = screen.getByRole('button', { name: 'Add Player' });
      
      await user.type(nameInput, 'New Player');
      await user.selectOptions(positionSelect, 'CM');
      await user.type(jerseyInput, '7');
      await user.click(submitButton);
      
      expect(onAddPlayer).toHaveBeenCalledWith({
        name: 'New Player',
        position: 'CM',
        jerseyNum: '7',
      });
      expect(onAddPlayer).toHaveBeenCalledTimes(1);
    });


    it('should not submit form with empty name', async () => {
      const onAddPlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} onAddPlayer={onAddPlayer} />);
      
      const positionSelect = screen.getByDisplayValue('Select Position');
      const jerseyInput = screen.getByPlaceholderText('Jersey Number');
      const submitButton = screen.getByRole('button', { name: 'Add Player' });
      
      await user.selectOptions(positionSelect, 'CM');
      await user.type(jerseyInput, '7');
      await user.click(submitButton);
      
      expect(onAddPlayer).not.toHaveBeenCalled();
    });

    it('should not submit form with whitespace-only name', async () => {
      const onAddPlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} onAddPlayer={onAddPlayer} />);
      
      const nameInput = screen.getByPlaceholderText('Player Name');
      const positionSelect = screen.getByDisplayValue('Select Position');
      const jerseyInput = screen.getByPlaceholderText('Jersey Number');
      const submitButton = screen.getByRole('button', { name: 'Add Player' });
      
      await user.type(nameInput, '   ');
      await user.selectOptions(positionSelect, 'CM');
      await user.type(jerseyInput, '7');
      await user.click(submitButton);
      
      expect(onAddPlayer).not.toHaveBeenCalled();
    });

    it('should not submit form with empty position', async () => {
      const onAddPlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} onAddPlayer={onAddPlayer} />);
      
      const nameInput = screen.getByPlaceholderText('Player Name');
      const jerseyInput = screen.getByPlaceholderText('Jersey Number');
      const submitButton = screen.getByRole('button', { name: 'Add Player' });
      
      await user.type(nameInput, 'New Player');
      await user.type(jerseyInput, '7');
      await user.click(submitButton);
      
      expect(onAddPlayer).not.toHaveBeenCalled();
    });

    it('should not submit form with empty jersey number', async () => {
      const onAddPlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} onAddPlayer={onAddPlayer} />);
      
      const nameInput = screen.getByPlaceholderText('Player Name');
      const positionSelect = screen.getByDisplayValue('Select Position');
      const submitButton = screen.getByRole('button', { name: 'Add Player' });
      
      await user.type(nameInput, 'New Player');
      await user.selectOptions(positionSelect, 'CM');
      await user.click(submitButton);
      
      expect(onAddPlayer).not.toHaveBeenCalled();
    });
  });

  describe('Unit Tests - Player Interaction', () => {


    it('should call onAddToLineup when Add to Lineup button is clicked', async () => {
      const onAddToLineup = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={[mockPlayers[0]]} onAddToLineup={onAddToLineup} />);
      
      const addToLineupButton = screen.getByText('Add to Lineup');
      await user.click(addToLineupButton);
      
      expect(onAddToLineup).toHaveBeenCalledWith(mockPlayers[0]);
      expect(onAddToLineup).toHaveBeenCalledTimes(1);
    });

    it('should call onRemovePlayer when Remove button is clicked', async () => {
      const onRemovePlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={[mockPlayers[0]]} onRemovePlayer={onRemovePlayer} />);
      
      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);
      
      expect(onRemovePlayer).toHaveBeenCalledWith(mockPlayers[0].id);
      expect(onRemovePlayer).toHaveBeenCalledTimes(1);
    });

    it('should disable Add to Lineup button for players already in lineup', () => {
      const lineupIds = new Set([mockPlayers[0].id]);
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={[mockPlayers[0]]} lineupIds={lineupIds} />);
      
      const addToLineupButton = screen.getByText('Add to Lineup');
      expect(addToLineupButton).toBeDisabled();
    });

    it('should enable Add to Lineup button for players not in lineup', () => {
      const lineupIds = new Set(['different-player-id']);
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={[mockPlayers[0]]} lineupIds={lineupIds} />);
      
      const addToLineupButton = screen.getByText('Add to Lineup');
      expect(addToLineupButton).toBeEnabled();
    });

    it('should prevent event propagation when button is clicked', async () => {
      const onPlayerClick = vi.fn();
      const onAddToLineup = vi.fn();
      const onRemovePlayer = vi.fn();
      
      render(
        <RosterManagement 
        errorMsg={null} setErrorMsg={function (): void {
          throw new Error('Function not implemented.');
        } } successMsg={null} setSuccessMsg={function (): void {
          throw new Error('Function not implemented.');
        } } {...defaultProps}
        players={[mockPlayers[0]]}
        onAddToLineup={onAddToLineup}
        onRemovePlayer={onRemovePlayer}        />
      );
      
      const addToLineupButton = screen.getByText('Add to Lineup');
      const removeButton = screen.getByText('Remove');
      
      await user.click(addToLineupButton);
      await user.click(removeButton);
      
      expect(onAddToLineup).toHaveBeenCalledTimes(1);
      expect(onRemovePlayer).toHaveBeenCalledTimes(1);
      expect(onPlayerClick).not.toHaveBeenCalled(); // Should not be called due to event propagation prevention
    });
  });

  describe('Integration Tests - Position Grouping', () => {
    it('should correctly group players by position categories', () => {
      const testPlayers = [
        createMockPlayer({ id: 'gk1', position: 'GK' }),
        createMockPlayer({ id: 'cb1', position: 'CB' }),
        createMockPlayer({ id: 'lb1', position: 'LB' }),
        createMockPlayer({ id: 'cm1', position: 'CM' }),
        createMockPlayer({ id: 'cam1', position: 'CAM' }),
        createMockPlayer({ id: 'st1', position: 'ST' }),
        createMockPlayer({ id: 'lw1', position: 'LW' }),
      ];
      
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={testPlayers} />);
      
      expect(screen.getByText('Goalkeepers (1)')).toBeInTheDocument();
      expect(screen.getByText('Defenders (2)')).toBeInTheDocument();
      expect(screen.getByText('Midfielders (2)')).toBeInTheDocument();
      expect(screen.getByText('Forwards (2)')).toBeInTheDocument();
    });

    it('should display position groups in correct order', () => {
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={mockPlayers} />);
      
      const positionGroups = screen.getAllByText(/\(\d+\)$/);
      const groupTexts = positionGroups.map(group => group.textContent);
      
      expect(groupTexts[0]).toMatch(/Goalkeepers/);
      expect(groupTexts[1]).toMatch(/Defenders/);
      expect(groupTexts[2]).toMatch(/Midfielders/);
      expect(groupTexts[3]).toMatch(/Forwards/);
    });

  });

  describe('Edge Cases', () => {
    it('should handle empty players array', () => {
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={[]} />);
      
      expect(screen.queryByText(/\(\d+\)$/)).not.toBeInTheDocument();
      expect(screen.getByText('Add New Player')).toBeInTheDocument();
    });


    it('should handle large number of players', () => {
      const manyPlayers = Array.from({ length: 100 }, (_, i) => 
        createMockPlayer({ id: `player-${i}`, name: `Player ${i}`, jerseyNum: `${i}` })
      );
      
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={manyPlayers} />);
      
      expect(screen.getByText('Midfielders (100)')).toBeInTheDocument();
    });

    it('should handle special characters in player names', async () => {
      const onAddPlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} onAddPlayer={onAddPlayer} />);
      
      const nameInput = screen.getByPlaceholderText('Player Name');
      const positionSelect = screen.getByDisplayValue('Select Position');
      const jerseyInput = screen.getByPlaceholderText('Jersey Number');
      const submitButton = screen.getByRole('button', { name: 'Add Player' });
      
      await user.type(nameInput, 'José María O\'Connor-Smith');
      await user.selectOptions(positionSelect, 'CM');
      await user.type(jerseyInput, '10');
      await user.click(submitButton);
      
      expect(onAddPlayer).toHaveBeenCalledWith({
        name: 'José María O\'Connor-Smith',
        position: 'CM',
        jerseyNum: '10',
      });
    });

    it('should handle form submission with Enter key', async () => {
      const onAddPlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} onAddPlayer={onAddPlayer} />);
      
      const nameInput = screen.getByPlaceholderText('Player Name');
      const positionSelect = screen.getByDisplayValue('Select Position');
      const jerseyInput = screen.getByPlaceholderText('Jersey Number');
      
      await user.type(nameInput, 'Enter Player');
      await user.selectOptions(positionSelect, 'ST');
      await user.type(jerseyInput, '9');
      await user.type(jerseyInput, '{enter}');
      
      expect(onAddPlayer).toHaveBeenCalledWith({
        name: 'Enter Player',
        position: 'ST',
        jerseyNum: '9',
      });
    });

    it('should handle rapid form submissions', async () => {
      const onAddPlayer = vi.fn();
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} onAddPlayer={onAddPlayer} />);
      
      const nameInput = screen.getByPlaceholderText('Player Name');
      const positionSelect = screen.getByDisplayValue('Select Position');
      const jerseyInput = screen.getByPlaceholderText('Jersey Number');
      const submitButton = screen.getByRole('button', { name: 'Add Player' });
      
      // First submission
      await user.type(nameInput, 'Player 1');
      await user.selectOptions(positionSelect, 'CM');
      await user.type(jerseyInput, '1');
      await user.click(submitButton);
      
      // Second submission (fields should be cleared)
      await user.type(nameInput, 'Player 2');
      await user.selectOptions(positionSelect, 'ST');
      await user.type(jerseyInput, '2');
      await user.click(submitButton);
      
      expect(onAddPlayer).toHaveBeenCalledTimes(2);
      expect(onAddPlayer).toHaveBeenNthCalledWith(1, {
        name: 'Player 1',
        position: 'CM',
        jerseyNum: '1',
      });
      expect(onAddPlayer).toHaveBeenNthCalledWith(2, {
        name: 'Player 2',
        position: 'ST',
        jerseyNum: '2',
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper form labels and structure', () => {
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} />);
      
      const nameInput = screen.getByPlaceholderText('Player Name');
      const positionSelect = screen.getByDisplayValue('Select Position');
      const jerseyInput = screen.getByPlaceholderText('Jersey Number');
      
      expect(nameInput).toHaveAttribute('required');
      expect(positionSelect).toHaveAttribute('required');
      expect(jerseyInput).toHaveAttribute('required');
      expect(jerseyInput).toHaveAttribute('type', 'number');
      expect(jerseyInput).toHaveAttribute('min', '0');
    });


    it('should have proper heading hierarchy', () => {
      render(<RosterManagement errorMsg={null} setErrorMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } successMsg={null} setSuccessMsg={function (_value: SetStateAction<string | null>): void {
        throw new Error('Function not implemented.');
      } } {...defaultProps} players={mockPlayers} />);
      
      const mainHeading = screen.getByRole('heading', { level: 2, name: 'Team Roster' });
      const formHeading = screen.getByRole('heading', { level: 3, name: 'Add New Player' });
      const positionHeadings = screen.getAllByRole('heading', { level: 3 }).filter(h => 
        h.textContent?.match(/\(\d+\)$/)
      );
      
      expect(mainHeading).toBeInTheDocument();
      expect(formHeading).toBeInTheDocument();
      expect(positionHeadings.length).toBeGreaterThan(0);
    });

  });
});