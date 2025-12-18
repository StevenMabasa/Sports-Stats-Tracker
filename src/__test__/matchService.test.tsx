import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchMatches,
  fetchMatchEvents,
  fetchTeamMatches,
  createMatch,
  updateMatch,
  createPlayerStats,
  updatePlayerStats,
  upsertPlayerStats,
  createMatchEvent,
  deleteMatchEvent
} from '../services/matchService';
import supabase from '../../supabaseClient';
import type { DbMatchRecord } from '../types';

// Mock supabase client
vi.mock('../../supabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          })),
          order: vi.fn(),
          single: vi.fn()
        })),
        order: vi.fn(),
        single: vi.fn()
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

const mockConsole = {
  log: vi.fn(),
  error: vi.fn()
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
  vi.spyOn(console, 'error').mockImplementation(mockConsole.error);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const mockDbMatch: DbMatchRecord = {
  id: 'match-1',
  team_id: 'team-1',
  opponent_name: 'Opponent FC',
  team_score: 2,
  opponent_score: 1,
  date: '2024-01-15',
  status: 'completed',
  possession: 65,
  shots: 15,
  shots_on_target: 8,
  corners: 6,
  fouls: 12,
  offsides: 3,
  passes: 450,
  pass_accuracy: 85,
  tackles: 18,
  saves: 4
};

const mockMatchEvent: any = {
  id: 'event-1',
  match_id: 'match-1',
  player_id: 'player-1',
  event_type: 'goal',
  minute: 25
};

describe('fetchMatches', () => {
  it('should return transformed matches for successful response', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [mockDbMatch], error: null });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchMatches();

    expect(mockFrom).toHaveBeenCalledWith('matches');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'match-1',
      teamId: 'team-1',
      opponentName: 'Opponent FC',
      teamScore: 2,
      opponentScore: 1,
      date: '2024-01-15',
      status: 'completed',
      possession: 65,
      shots: 15,
      shotsOnTarget: 8,
      corners: 6,
      fouls: 12,
      offsides: 3,
      passes: 450,
      passAccuracy: 85,
      tackles: 18,
      saves: 4
    });
  });

  it('should return empty array when data is null', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchMatches();

    expect(result).toEqual([]);
  });

  it('should throw error when Supabase returns error', async () => {
    const mockError = { message: 'Database error', code: '500' };
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    await expect(fetchMatches()).rejects.toThrow('Database error: Database error');
    expect(console.error).toHaveBeenCalledWith('fetchMatches error', mockError);
  });

  it('should re-throw unexpected errors', async () => {
    const mockError = new Error('Network error');
    const mockOrder = vi.fn().mockRejectedValue(mockError);
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    await expect(fetchMatches()).rejects.toThrow('Network error');
    expect(console.error).toHaveBeenCalledWith('fetchMatches unexpected error:', mockError);
  });
});

describe('fetchMatchEvents', () => {
  it('should return match events for successful response', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [mockMatchEvent], error: null });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchMatchEvents('match-1');

    expect(mockFrom).toHaveBeenCalledWith('match_events');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('match_id', 'match-1');
    expect(result).toEqual([mockMatchEvent]);
  });

  it('should return empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchMatchEvents('match-1');

    expect(result).toEqual([]);
  });

  it('should return empty array and log error when Supabase returns error', async () => {
    const mockError = { message: 'Database error', code: '500' };
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchMatchEvents('match-1');

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('fetchMatchEvents error', mockError);
  });
});


describe('fetchTeamMatches', () => {
  it('should return transformed matches for team', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [mockDbMatch], error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchTeamMatches('team-1');

    expect(mockFrom).toHaveBeenCalledWith('matches');
    expect(mockEq).toHaveBeenCalledWith('team_id', 'team-1');
    expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false });
    expect(result).toHaveLength(1);
    expect(result[0].teamId).toBe('team-1');
  });

  it('should return empty array on error', async () => {
    const mockError = { message: 'Database error', code: '500' };
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchTeamMatches('team-1');

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('fetchTeamMatches error', mockError);
  });
});

describe('createMatch', () => {
  it('should return match ID for successful creation', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'new-match-1' }, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const matchData = { ...mockDbMatch };
    delete (matchData as any).id;

    const result = await createMatch(matchData);

    expect(mockFrom).toHaveBeenCalledWith('matches');
    expect(mockInsert).toHaveBeenCalledWith([matchData]);
    expect(mockSelect).toHaveBeenCalledWith('id');
    expect(result).toBe('new-match-1');
  });

  it('should return null on error', async () => {
    const mockError = { message: 'Insert failed', code: '400' };
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await createMatch({} as any);

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('createMatch error', mockError);
  });

  it('should return null when data.id is undefined', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: {}, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await createMatch({} as any);

    expect(result).toBeNull();
  });
});

describe('updateMatch', () => {
  it('should return true for successful update', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await updateMatch('match-1', { team_score: 3 });

    expect(mockFrom).toHaveBeenCalledWith('matches');
    expect(mockUpdate).toHaveBeenCalledWith({ team_score: 3 });
    expect(mockEq).toHaveBeenCalledWith('id', 'match-1');
    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    const mockError = { message: 'Update failed', code: '400' };
    const mockEq = vi.fn().mockResolvedValue({ error: mockError });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await updateMatch('match-1', {});

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('updateMatch error', mockError);
  });
});


describe('updatePlayerStats', () => {
  it('should return true for successful update', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await updatePlayerStats('stats-1', { goals: 2 });

    expect(mockFrom).toHaveBeenCalledWith('player_stats');
    expect(mockUpdate).toHaveBeenCalledWith({ goals: 2 });
    expect(mockEq).toHaveBeenCalledWith('id', 'stats-1');
    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    const mockError = { message: 'Update failed', code: '400' };
    const mockEq = vi.fn().mockResolvedValue({ error: mockError });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await updatePlayerStats('stats-1', {});

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('updatePlayerStats error', mockError);
  });
});

describe('upsertPlayerStats', () => {

  it('should return null on fetch error (not PGRST116)', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ 
      data: null, 
      error: { code: '500', message: 'Database error' } 
    });
    const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await upsertPlayerStats('match-1', 'player-1', { goals: 1 });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('upsertPlayerStats fetch error', expect.any(Object));
  });



  it('should return null on insert error', async () => {
    // Mock no existing record
    const mockSingle1 = vi.fn().mockResolvedValue({ 
      data: null, 
      error: { code: 'PGRST116', message: 'Row not found' } 
    });
    const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle1 });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect1 = vi.fn().mockReturnValue({ eq: mockEq1 });
    
    // Mock insert error
    const mockSingle2 = vi.fn().mockResolvedValue({ 
      data: null, 
      error: { message: 'Insert failed' } 
    });
    const mockSelect2 = vi.fn().mockReturnValue({ single: mockSingle2 });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect2 });
    
    const mockFrom = vi.fn()
      .mockReturnValueOnce({ select: mockSelect1 })
      .mockReturnValueOnce({ insert: mockInsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await upsertPlayerStats('match-1', 'player-1', { goals: 1 });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('upsertPlayerStats insert error', expect.any(Object));
  });

  it('should return null on unexpected exception', async () => {
    const mockError = new Error('Network error');
    const mockSingle = vi.fn().mockRejectedValue(mockError);
    const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await upsertPlayerStats('match-1', 'player-1', { goals: 1 });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('upsertPlayerStats unexpected error', mockError);
  });
});

describe('createMatchEvent', () => {
  it('should return event ID for successful creation', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'new-event-1' }, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const eventData = { ...mockMatchEvent };
    delete (eventData as any).id;

    const result = await createMatchEvent(eventData);

    expect(mockFrom).toHaveBeenCalledWith('match_events');
    expect(mockInsert).toHaveBeenCalledWith([eventData]);
    expect(result).toBe('new-event-1');
  });

  it('should return null on error', async () => {
    const mockError = { message: 'Insert failed', code: '400' };
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await createMatchEvent({} as any);

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('createMatchEvent error', mockError);
  });
});

describe('deleteMatchEvent', () => {
  it('should return true for successful deletion', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await deleteMatchEvent('event-1');

    expect(mockFrom).toHaveBeenCalledWith('match_events');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'event-1');
    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    const mockError = { message: 'Delete failed', code: '400' };
    const mockEq = vi.fn().mockResolvedValue({ error: mockError });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await deleteMatchEvent('event-1');

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('deleteMatchEvent error', mockError);
  });
});

// Edge case tests
describe('Edge Cases', () => {
  describe('Data transformation edge cases', () => {
    it('should handle matches with missing optional fields', async () => {
      const minimalMatch = {
        id: 'match-1',
        team_id: 'team-1',
        opponent_name: 'Opponent FC',
        team_score: 2,
        opponent_score: 1,
        date: '2024-01-15',
        status: 'completed',
        possession: null,
        shots: null,
        shots_on_target: null,
        corners: null,
        fouls: null,
        offsides: null,
        passes: null,
        pass_accuracy: null,
        tackles: null,
        saves: null
      };

      const mockOrder = vi.fn().mockResolvedValue({ data: [minimalMatch], error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any).mockImplementation(mockFrom);

      const result = await fetchMatches();

      expect(result[0]).toEqual({
        id: 'match-1',
        teamId: 'team-1',
        opponentName: 'Opponent FC',
        teamScore: 2,
        opponentScore: 1,
        date: '2024-01-15',
        status: 'completed',
        possession: null,
        shots: null,
        shotsOnTarget: null,
        corners: null,
        fouls: null,
        offsides: null,
        passes: null,
        passAccuracy: null,
        tackles: null,
        saves: null
      });
    });
  });

  describe('ID validation edge cases', () => {
    it('should handle empty string IDs', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any).mockImplementation(mockFrom);

      const result = await fetchMatchEvents('');

      expect(mockEq).toHaveBeenCalledWith('match_id', '');
      expect(result).toEqual([]);
    });

    it('should handle null/undefined in upsertPlayerStats', async () => {
      const result = await upsertPlayerStats('', '', {});
      // Should still attempt the operation with empty strings
      expect(result).toBeNull();
    });
  });

  describe('Data integrity edge cases', () => {
    it('should handle partial stats data in createPlayerStats', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'new-stats-1' }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as any).mockImplementation(mockFrom);

      const partialStats = {
        match_id: 'match-1',
        player_id: 'player-1',
        goals: 1
        // Missing other fields
      };

      const result = await createPlayerStats(partialStats as any);

      expect(result).toBe('new-stats-1');
      expect(mockInsert).toHaveBeenCalledWith([partialStats]);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle malformed error objects', async () => {
      const malformedError = { code: '500' }; // Missing message
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: malformedError });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any).mockImplementation(mockFrom);

      await expect(fetchMatches()).rejects.toThrow('Database error: undefined');
    });

    it('should handle network timeout scenarios', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';
      
      const mockOrder = vi.fn().mockRejectedValue(timeoutError);
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any).mockImplementation(mockFrom);

      await expect(fetchMatches()).rejects.toThrow('Network timeout');
      expect(console.error).toHaveBeenCalledWith('fetchMatches unexpected error:', timeoutError);
    });
  });

  describe('Concurrent operation edge cases', () => {
    it('should handle race condition in upsertPlayerStats', async () => {
      // Simulate race condition where record gets created between check and insert
      const mockSingle1 = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Row not found' } 
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle1 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect1 = vi.fn().mockReturnValue({ eq: mockEq1 });
      
      // Insert fails due to unique constraint (record was created by another process)
      const mockSingle2 = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { code: '23505', message: 'duplicate key value violates unique constraint' } 
      });
      const mockSelect2 = vi.fn().mockReturnValue({ single: mockSingle2 });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect2 });
      
      const mockFrom = vi.fn()
        .mockReturnValueOnce({ select: mockSelect1 })
        .mockReturnValueOnce({ insert: mockInsert });
      
      (supabase.from as any).mockImplementation(mockFrom);

      const result = await upsertPlayerStats('match-1', 'player-1', { goals: 1 });

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('upsertPlayerStats insert error', expect.objectContaining({
        code: '23505'
      }));
    });
  });

  describe('Large data handling', () => {
    it('should handle large match arrays', async () => {
      const largeMatchArray = Array(1000).fill(null).map((_, i) => ({
        ...mockDbMatch,
        id: `match-${i}`,
        opponent_name: `Opponent ${i}`
      }));

      const mockOrder = vi.fn().mockResolvedValue({ data: largeMatchArray, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any).mockImplementation(mockFrom);

      const result = await fetchMatches();

      expect(result).toHaveLength(1000);
      expect(result[0].opponentName).toBe('Opponent 0');
      expect(result[999].opponentName).toBe('Opponent 999');
    });
  });

  describe('Type safety edge cases', () => {
    it('should handle unexpected data types in transformation', async () => {
      const matchWithWrongTypes = {
        id: 123, // Should be string
        team_id: null,
        opponent_name: undefined,
        team_score: '2', // Should be number
        opponent_score: '1',
        date: new Date('2024-01-15'),
        status: 'completed',
        possession: '65',
        shots: '15',
        shots_on_target: '8',
        corners: '6',
        fouls: '12',
        offsides: '3',
        passes: '450',
        pass_accuracy: '85',
        tackles: '18',
        saves: '4'
      };

      const mockOrder = vi.fn().mockResolvedValue({ data: [matchWithWrongTypes], error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any).mockImplementation(mockFrom);

      const result = await fetchMatches();

      expect(result[0].id).toBe(123);
      expect(result[0].teamId).toBe(null);
      expect(result[0].opponentName).toBe(undefined);
    });
  });
});