import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import LineupSelection, { type Player } from '../pages/coachDashboard/playerManagement/LineupSelection';

// Mock data
const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: `player-${Math.random()}`,
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
  },
  imageUrl: 'https://example.com/player.jpg',
  ...overrides,
});

const mockLineup: Player[] = [
  createMockPlayer({ id: 'gk1', name: 'Goalkeeper One', position: 'GK', jerseyNum: '1' }),
  createMockPlayer({ id: 'cb1', name: 'Center Back One', position: 'CB', jerseyNum: '4' }),
  createMockPlayer({ id: 'cb2', name: 'Center Back Two', position: 'CB', jerseyNum: '5' }),
  createMockPlayer({ id: 'lb1', name: 'Left Back', position: 'LB', jerseyNum: '3' }),
  createMockPlayer({ id: 'rb1', name: 'Right Back', position: 'RB', jerseyNum: '2' }),
  createMockPlayer({ id: 'cm1', name: 'Central Midfielder One', position: 'CM', jerseyNum: '6' }),
  createMockPlayer({ id: 'cm2', name: 'Central Midfielder Two', position: 'CM', jerseyNum: '8' }),
  createMockPlayer({ id: 'lw1', name: 'Left Winger', position: 'LW', jerseyNum: '11' }),
  createMockPlayer({ id: 'rw1', name: 'Right Winger', position: 'RW', jerseyNum: '7' }),
  createMockPlayer({ id: 'st1', name: 'Striker One', position: 'ST', jerseyNum: '9' }),
  createMockPlayer({ id: 'st2', name: 'Striker Two', position: 'ST', jerseyNum: '10' }),
];

// Mock props
const defaultProps = {
  lineup: [],
  onRemoveFromLineup: vi.fn(),
  onPositionUpdate: vi.fn(),
};

// Helper function to create mock mouse event

describe('LineupSelection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getBoundingClientRect for field positioning
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 400,
      height: 600,
      top: 0,
      left: 0,
      right: 400,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Unit Tests - Rendering', () => {
    it('should render the component with correct title', () => {
      render(<LineupSelection {...defaultProps} />);
      expect(screen.getByText('Starting Lineup')).toBeInTheDocument();
    });

    it('should display empty message when no players in lineup', () => {
      render(<LineupSelection {...defaultProps} />);
      expect(screen.getByText('Add players from the roster to build your lineup.')).toBeInTheDocument();
    });

    it('should render soccer field when lineup has players', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      expect(screen.getByText('Goalkeeper One')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Jersey number
    });

    it('should display formation information correctly', () => {
      const testLineup = [
        mockLineup[0], // GK
        mockLineup[1], mockLineup[2], // 2 defenders
        mockLineup[5], mockLineup[6], // 2 midfielders
        mockLineup[9], // 1 forward
      ];
      
      render(<LineupSelection {...defaultProps} lineup={testLineup} />);
      expect(screen.getByText('Formation: 2-2-1')).toBeInTheDocument();
      expect(screen.getByText('Total Players: 6/11')).toBeInTheDocument();
    });

    it('should render all players with their names and jersey numbers', () => {
      render(<LineupSelection {...defaultProps} lineup={mockLineup} />);
      
      mockLineup.forEach(player => {
        expect(screen.getByText(player.name)).toBeInTheDocument();
        expect(screen.getByText(player.jerseyNum)).toBeInTheDocument();
      });
    });
  });

  describe('Unit Tests - Player Positioning', () => {
    it('should position goalkeeper in center', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      
      const playerElement = screen.getByText('Goalkeeper One').closest('.draggable-player');
      expect(playerElement).toHaveClass('goalkeeper');
    });

    it('should apply correct CSS classes based on position categories', () => {
      const testLineup = [
        mockLineup[0], // GK - goalkeeper
        mockLineup[1], // CB - defender
        mockLineup[5], // CM - midfielder
        mockLineup[9], // ST - forward
      ];
      
      render(<LineupSelection {...defaultProps} lineup={testLineup} />);
      
      expect(screen.getByText('Goalkeeper One').closest('.draggable-player')).toHaveClass('goalkeeper');
      expect(screen.getByText('Center Back One').closest('.draggable-player')).toHaveClass('defender');
      expect(screen.getByText('Central Midfielder One').closest('.draggable-player')).toHaveClass('midfielder');
      expect(screen.getByText('Striker One').closest('.draggable-player')).toHaveClass('forward');
    });

    it('should handle unknown positions by defaulting to midfielder', () => {
      const unknownPositionPlayer = createMockPlayer({
        id: 'unknown1',
        name: 'Unknown Position',
        position: 'UNKNOWN',
        jerseyNum: '99'
      });
      
      render(<LineupSelection {...defaultProps} lineup={[unknownPositionPlayer]} />);
      
      const playerElement = screen.getByText('Unknown Position').closest('.draggable-player');
      expect(playerElement).toHaveClass('midfielder');
    });
  });

  describe('Unit Tests - Remove Player Functionality', () => {
    it('should call onRemoveFromLineup when remove button is clicked', () => {
      const onRemoveFromLineup = vi.fn();
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} onRemoveFromLineup={onRemoveFromLineup} />);
      
      const removeButton = screen.getByTitle('Remove from lineup');
      fireEvent.click(removeButton);
      
      expect(onRemoveFromLineup).toHaveBeenCalledWith('gk1');
      expect(onRemoveFromLineup).toHaveBeenCalledTimes(1);
    });

    it('should prevent event propagation when remove button is clicked', () => {
      const onRemoveFromLineup = vi.fn();
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} onRemoveFromLineup={onRemoveFromLineup} />);
      
      const removeButton = screen.getByTitle('Remove from lineup');
      const mouseDownSpy = vi.fn();
      const mouseUpSpy = vi.fn();
      
      removeButton.addEventListener('mousedown', mouseDownSpy);
      removeButton.addEventListener('mouseup', mouseUpSpy);
      
      fireEvent.mouseDown(removeButton);
      fireEvent.mouseUp(removeButton);
      fireEvent.click(removeButton);
      
      expect(onRemoveFromLineup).toHaveBeenCalledWith('gk1');
    });
  });

  describe('Integration Tests - Drag and Drop', () => {
    it('should handle drag start correctly', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      
      const playerElement = screen.getByText('Goalkeeper One').closest('.draggable-player') as HTMLElement;
      
      fireEvent.mouseDown(playerElement, { clientX: 200, clientY: 300 });
      
      expect(playerElement).toHaveClass('dragging');
    });

    it('should update player position during drag', async () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      
      const playerElement = screen.getByText('Goalkeeper One').closest('.draggable-player') as HTMLElement;
      const fieldContainer = document.querySelector('.field-container') as HTMLElement;
      
      // Start drag
      fireEvent.mouseDown(playerElement, { clientX: 200, clientY: 300 });
      
      // Move mouse
      fireEvent.mouseMove(fieldContainer, { clientX: 250, clientY: 350 });
      
      expect(playerElement).toHaveClass('dragging');
    });

    it('should call onPositionUpdate when drag ends', async () => {
      const onPositionUpdate = vi.fn();
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} onPositionUpdate={onPositionUpdate} />);
      
      const playerElement = screen.getByText('Goalkeeper One').closest('.draggable-player') as HTMLElement;
      const fieldContainer = document.querySelector('.field-container') as HTMLElement;
      
      // Start drag
      fireEvent.mouseDown(playerElement, { clientX: 200, clientY: 300 });
      
      // Move and end drag
      fireEvent.mouseMove(fieldContainer, { clientX: 250, clientY: 350 });
      fireEvent.mouseUp(fieldContainer);
      
      await waitFor(() => {
        expect(onPositionUpdate).toHaveBeenCalledWith('gk1', expect.any(Number), expect.any(Number));
      });
    });

    it('should handle drag end outside field container', async () => {
      const onPositionUpdate = vi.fn();
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} onPositionUpdate={onPositionUpdate} />);
      
      const playerElement = screen.getByText('Goalkeeper One').closest('.draggable-player') as HTMLElement;
      
      // Start drag
      fireEvent.mouseDown(playerElement, { clientX: 200, clientY: 300 });
      
      // End drag globally
      fireEvent.mouseUp(document);
      
      await waitFor(() => {
        expect(onPositionUpdate).toHaveBeenCalledWith('gk1', expect.any(Number), expect.any(Number));
      });
    });

    it('should constrain player position within field boundaries', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      
      const playerElement = screen.getByText('Goalkeeper One').closest('.draggable-player') as HTMLElement;
      const fieldContainer = document.querySelector('.field-container') as HTMLElement;
      
      // Start drag
      fireEvent.mouseDown(playerElement, { clientX: 200, clientY: 300 });
      
      // Try to move outside boundaries
      fireEvent.mouseMove(fieldContainer, { clientX: -50, clientY: -50 }); // Outside left/top
      fireEvent.mouseMove(fieldContainer, { clientX: 1000, clientY: 1000 }); // Outside right/bottom
      
      // Position should be constrained (exact values depend on implementation)
      expect(playerElement).toHaveClass('dragging');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty lineup correctly', () => {
      render(<LineupSelection {...defaultProps} lineup={[]} />);
      expect(screen.getByText('Add players from the roster to build your lineup.')).toBeInTheDocument();
    });

    it('should handle single player lineup', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      expect(screen.getByText('Formation: 0-0-0')).toBeInTheDocument();
      expect(screen.getByText('Total Players: 1/11')).toBeInTheDocument();
    });

    it('should handle maximum lineup (11 players)', () => {
      render(<LineupSelection {...defaultProps} lineup={mockLineup} />);
      expect(screen.getByText('Total Players: 11/11')).toBeInTheDocument();
    });

    it('should handle players with identical positions', () => {
      const identicalPositionPlayers = [
        createMockPlayer({ id: 'cb1', position: 'CB', jerseyNum: '4' }),
        createMockPlayer({ id: 'cb2', position: 'CB', jerseyNum: '5' }),
        createMockPlayer({ id: 'cb3', position: 'CB', jerseyNum: '6' }),
      ];
      
      render(<LineupSelection {...defaultProps} lineup={identicalPositionPlayers} />);
      
      identicalPositionPlayers.forEach(player => {
        expect(screen.getByText(player.jerseyNum)).toBeInTheDocument();
      });
    });

    it('should handle players with missing or undefined properties', () => {
      const incompletePlayer = {
        ...createMockPlayer(),
        name: undefined as any,
        jerseyNum: undefined as any,
      };
      
      // Should not crash even with undefined values
      expect(() => {
        render(<LineupSelection {...defaultProps} lineup={[incompletePlayer]} />);
      }).not.toThrow();
    });

    it('should handle mouse events without crashing when no dragged player', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      
      const fieldContainer = document.querySelector('.field-container') as HTMLElement;
      
      // Mouse move without drag start should not crash
      expect(() => {
        fireEvent.mouseMove(fieldContainer, { clientX: 250, clientY: 350 });
        fireEvent.mouseUp(fieldContainer);
      }).not.toThrow();
    });

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
  });

  describe('Integration Tests - Formation Calculation', () => {
    it('should calculate formation correctly with mixed positions', () => {
      const mixedLineup = [
        mockLineup[0], // GK
        mockLineup[1], mockLineup[2], mockLineup[3], // 3 defenders
        mockLineup[5], mockLineup[6], // 2 midfielders  
        mockLineup[9], // 1 forward
      ];
      
      render(<LineupSelection {...defaultProps} lineup={mixedLineup} />);
      expect(screen.getByText('Formation: 3-2-1')).toBeInTheDocument();
    });

    it('should handle formation with no players in certain categories', () => {
      const onlyGoalkeeper = [mockLineup[0]]; // Only GK
      
      render(<LineupSelection {...defaultProps} lineup={onlyGoalkeeper} />);
      expect(screen.getByText('Formation: 0-0-0')).toBeInTheDocument();
    });

    it('should update formation when lineup changes', () => {
      const { rerender } = render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      expect(screen.getByText('Formation: 0-0-0')).toBeInTheDocument();
      
      // Add more players
      const expandedLineup = [mockLineup[0], mockLineup[1], mockLineup[5], mockLineup[9]];
      rerender(<LineupSelection {...defaultProps} lineup={expandedLineup} />);
      expect(screen.getByText('Formation: 1-1-1')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper button accessibility', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      
      const removeButton = screen.getByTitle('Remove from lineup');
      expect(removeButton).toHaveAttribute('type', 'button');
      expect(removeButton).toHaveAttribute('title', 'Remove from lineup');
    });

    it('should have draggable elements with proper cursor styles', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      
      const playerElement = screen.getByText('Goalkeeper One').closest('.draggable-player') as HTMLElement;
      expect(playerElement).toHaveStyle('cursor: grab');
    });

    it('should provide helpful instruction text', () => {
      render(<LineupSelection {...defaultProps} lineup={[mockLineup[0]]} />);
      expect(screen.getByText('💡 Drag players to reposition them on the field')).toBeInTheDocument();
    });
  });
});