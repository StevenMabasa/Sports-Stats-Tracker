import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUserFavorites, addFavorite, removeFavorite } from '../services/favoritesService';
import supabase from '../../supabaseClient';

// Mock supabase client
vi.mock('../../supabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn()
      })),
      upsert: vi.fn(),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn()
        }))
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

describe('fetchUserFavorites', () => {
  it('should return array of team IDs for successful response', async () => {
    const mockData = [
      { team_id: 'team1' },
      { team_id: 'team2' },
      { team_id: 'team3' }
    ];

    const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchUserFavorites('user123');

    expect(mockFrom).toHaveBeenCalledWith('favourites');
    expect(mockSelect).toHaveBeenCalledWith('team_id');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
    expect(result).toEqual(['team1', 'team2', 'team3']);
  });

  it('should return empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchUserFavorites('user123');

    expect(result).toEqual([]);
  });

  it('should return empty array when data is empty array', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchUserFavorites('user123');

    expect(result).toEqual([]);
  });

  it('should return empty array and log error when Supabase returns error', async () => {
    const mockError = { message: 'Database error', code: '500' };
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchUserFavorites('user123');

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('fetchUserFavorites error', mockError);
  });

  it('should return empty array and log exception when promise rejects', async () => {
    const mockError = new Error('Network error');
    const mockEq = vi.fn().mockRejectedValue(mockError);
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await fetchUserFavorites('user123');

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('fetchUserFavorites exception:', mockError);
  });
});

describe('addFavorite', () => {
  it('should return true for successful upsert', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ data: [{ user_id: 'user123', team_id: 'team1' }], error: null });
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await addFavorite('user123', 'team1');

    expect(mockFrom).toHaveBeenCalledWith('favourites');
    expect(mockUpsert).toHaveBeenCalledWith(
      { user_id: 'user123', team_id: 'team1' },
      { onConflict: 'user_id,team_id', ignoreDuplicates: false }
    );
    expect(result).toBe(true);
  });

  it('should return false and log error when Supabase returns error', async () => {
    const mockError = { message: 'Insert failed', code: '400' };
    const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await addFavorite('user123', 'team1');

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('addFavorite error', mockError);
  });

  it('should return false and log exception when promise rejects', async () => {
    const mockError = new Error('Network error');
    const mockUpsert = vi.fn().mockRejectedValue(mockError);
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await addFavorite('user123', 'team1');

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('addFavorite exception:', mockError);
  });
});

describe('removeFavorite', () => {
  it('should return true for successful deletion', async () => {
    const mockEq2 = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await removeFavorite('user123', 'team1');

    expect(mockFrom).toHaveBeenCalledWith('favourites');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq1).toHaveBeenCalledWith('user_id', 'user123');
    expect(mockEq2).toHaveBeenCalledWith('team_id', 'team1');
    expect(result).toBe(true);
  });

  it('should return false and log error when Supabase returns error', async () => {
    const mockError = { message: 'Delete failed', code: '400' };
    const mockEq2 = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await removeFavorite('user123', 'team1');

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('removeFavorite error', mockError);
  });

  it('should return false and log exception when promise rejects', async () => {
    const mockError = new Error('Network error');
    const mockEq2 = vi.fn().mockRejectedValue(mockError);
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
    
    (supabase.from as any).mockImplementation(mockFrom);

    const result = await removeFavorite('user123', 'team1');

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('removeFavorite exception:', mockError);
  });
});