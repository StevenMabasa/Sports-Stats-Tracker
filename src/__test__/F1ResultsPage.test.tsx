import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent,} from '@testing-library/react';
import F1ResultsPage from '../pages/f1/F1ResultsPage';
import * as api from '../pages/f1/F1ApiBackend';

// Mock the API hooks
vi.mock('../pages/f1/F1ApiBackend', () => ({
  useRaces: vi.fn(),
  useRaceResults: vi.fn(),
}));

describe('F1ResultsPage', () => {
  const mockRaces = [
    {
      id: 1,
      round: 1,
      name: 'Australian Grand Prix',
      date: '2025-03-15',
      circuit: { country_code: 'AUS', location: 'Melbourne' },
    },
    {
      id: 2,
      round: 2,
      name: 'Bahrain Grand Prix',
      date: '2025-03-22',
      circuit: { country_code: 'BHR', location: 'Sakhir' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders race table after loading', () => {
    (api.useRaces as any).mockReturnValue({ races: mockRaces, loading: false });
    (api.useRaceResults as any).mockReturnValue({ results: [], loading: false });

    render(<F1ResultsPage />);

    expect(screen.getByText(/Australian Grand Prix/i)).toBeInTheDocument();
    expect(screen.getByText(/Bahrain Grand Prix/i)).toBeInTheDocument();
    expect(screen.getByText(/Races Completed/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Races/i)).toBeInTheDocument();
  });


  it('toggles race selection on click', () => {
    (api.useRaces as any).mockReturnValue({ races: mockRaces, loading: false });
    (api.useRaceResults as any).mockReturnValue({ results: [], loading: false });

    render(<F1ResultsPage />);

    const raceRow = screen.getByText(/Australian Grand Prix/i).closest('tr');
    expect(raceRow).toBeTruthy();

    // Select race
    fireEvent.click(raceRow!);
    expect(raceRow).toHaveAttribute('aria-pressed', 'true');

    // Deselect race
    fireEvent.click(raceRow!);
    expect(raceRow).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows TBD for upcoming races', () => {
    const futureRace = [
      { ...mockRaces[0], date: '2099-01-01' } // future race
    ];
    (api.useRaces as any).mockReturnValue({ races: futureRace, loading: false });
    (api.useRaceResults as any).mockReturnValue({ results: [], loading: false });

    render(<F1ResultsPage />);
    expect(screen.getByText(/TBD/i)).toBeInTheDocument();
    expect(screen.getByText(/Upcoming/i)).toBeInTheDocument();
  });
});
