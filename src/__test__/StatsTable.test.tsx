import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsTable from '../pages/coachDashboard/playerManagement/StatsTable';
import * as statsHelper from '../pages/coachDashboard/playerManagement/stats-helper';
import type { Player } from '../types';

describe('StatsTable Component', () => {
  const mockGeneralStats = [
    { label: 'Games Played', value: 10 },
    { label: 'Goals', value: 5 },
  ];

  const mockPositionStats = [
    { label: 'Assists', value: 3 },
    { label: 'Pass Accuracy', value: '85%' },
  ];

  const mockPlayer: Player = {
    id: 'player1',
    name: 'John Doe',
    position: 'Midfielder',
  } as Player;

  it('renders general stats correctly', () => {
    vi.spyOn(statsHelper, 'getPositionSpecificStats').mockReturnValue({
      generalStats: mockGeneralStats,
      positionStats: [],
    });

    render(<StatsTable player={mockPlayer} />);

    // Check section title
    expect(screen.getByText('General Statistics')).toBeDefined();

    // Check each general stat
    mockGeneralStats.forEach(stat => {
      expect(screen.getByText(stat.label)).toBeDefined();
      expect(screen.getByText(stat.value.toString())).toBeDefined();
    });
  });

  it('renders position-specific stats correctly', () => {
    vi.spyOn(statsHelper, 'getPositionSpecificStats').mockReturnValue({
      generalStats: mockGeneralStats,
      positionStats: mockPositionStats,
    });

    render(<StatsTable player={mockPlayer} />);

    // Check section title
    expect(screen.getByText(`${mockPlayer.position} Statistics`)).toBeDefined();

    // Check each position stat
    mockPositionStats.forEach(stat => {
      expect(screen.getByText(stat.label)).toBeDefined();
      expect(screen.getByText(stat.value.toString())).toBeDefined();
    });
  });

  it('does not render position-specific section when empty', () => {
    vi.spyOn(statsHelper, 'getPositionSpecificStats').mockReturnValue({
      generalStats: mockGeneralStats,
      positionStats: [],
    });

    render(<StatsTable player={mockPlayer} />);

    // Position-specific section should not exist
    expect(screen.queryByText(`${mockPlayer.position} Statistics`)).toBeNull();
  });
});
