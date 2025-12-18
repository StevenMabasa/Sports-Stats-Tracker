import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MatchesPage from '../pages/coachDashboard/matchManaging/MatchesPage';
import * as teamService from '../services/teamService';
import * as matchService from '../services/matchService';
import { vi } from 'vitest';
import type { Match } from '../types';

//  Supabase Mocks
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockInsert = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();

vi.mock('../../supabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      order: mockOrder,
    })),
  },
}));

// Mock services
vi.mock('../services/teamService');
vi.mock('../services/matchService');
vi.mock('../services/playerService');

describe('MatchesPage', () => {
  const mockTeam = { id: 'team1', name: 'My Team', coach_id: 'coach1' };
  const mockMatches: Match[] = [
    { id: 'match1', teamId: 'team1', opponentName: 'Rivals', teamScore: 2, opponentScore: 1, date: '2025-09-10', status: 'completed' },
    { id: 'match2', teamId: 'team1', opponentName: 'Champions', teamScore: 0, opponentScore: 0, date: '2025-09-09', status: 'completed' },
  ];

  beforeEach(() => {
    vi.spyOn(teamService, 'getCurrentTeamId').mockReturnValue('team1');
    vi.spyOn(teamService, 'fetchTeamById').mockResolvedValue(mockTeam);
    vi.spyOn(matchService, 'fetchTeamMatches').mockResolvedValue(mockMatches);
    // vi.spyOn(matchService, 'fetchMatchEvents').mockResolvedValue(mockEvents);
    // vi.spyOn(playerService, 'fetchPlayersWithStats').mockResolvedValue(mockPlayers);

    // Reset Supabase method mocks before each test
    mockSelect.mockClear();
    mockEq.mockClear();
    mockSingle.mockClear();
    mockMaybeSingle.mockClear();
    mockInsert.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
    mockOrder.mockClear();
  });

  it('displays matches after loading', async () => {
    render(<MatchesPage />);
    await waitFor(() => {
      expect(screen.getByText('Rivals')).toBeInTheDocument();
      expect(screen.getByText('Champions')).toBeInTheDocument();
    });
  });

  it('filters matches based on search input', async () => {
    render(<MatchesPage />);
    await waitFor(() => screen.getByText('Rivals'));

    fireEvent.change(screen.getByPlaceholderText(/search teams or dates/i), { target: { value: 'Champions' } });

    expect(screen.queryByText('Rivals')).not.toBeInTheDocument();
    expect(screen.getByText('Champions')).toBeInTheDocument();
  });

  it('shows error if team is not found', async () => {
    vi.spyOn(teamService, 'getCurrentTeamId').mockReturnValue(null);

    render(<MatchesPage />);
    await waitFor(() => {
      expect(screen.getByText(/no team found/i)).toBeInTheDocument();
    });
  });

  it('opens MatchDetailsModal on match click', async () => {
    render(<MatchesPage />);
    await waitFor(() => screen.getByText('Rivals'));

    fireEvent.click(screen.getByText('Rivals'));

    await waitFor(() => {
      expect(screen.getByText(/match details/i)).toBeInTheDocument();
    });
  });
});
