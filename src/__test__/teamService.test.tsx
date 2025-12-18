import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  slugify,
  getCurrentTeamId,
  setCurrentTeamId,
  fetchTeamById,
  uploadTeamLogo,
  createTeam,
  TEAM_LOGO_BUCKET,
  type TeamRecord
} from '../services/teamService';

// Mock the supabase client
vi.mock('../../supabaseClient.ts', () => ({
  default: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock console methods to avoid test noise
const consoleSpy = {
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};

// Import the mocked module after mocking
import supabase from '../../supabaseClient.ts';

// Type assertion to access the mocked methods
const mockSupabase = supabase as any;

describe('Team Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.error.mockClear();
    consoleSpy.warn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('slugify', () => {
    it('should convert string to lowercase', () => {
      expect(slugify('HELLO WORLD')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('hello world test')).toBe('hello-world-test');
    });

    it('should remove special characters', () => {
      expect(slugify('hello@world#test!')).toBe('hello-world-test');
    });

    it('should trim leading and trailing whitespace', () => {
      expect(slugify('  hello world  ')).toBe('hello-world');
    });

    it('should remove multiple consecutive hyphens', () => {
      expect(slugify('hello---world')).toBe('hello-world');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(slugify('-hello-world-')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('should handle string with only special characters', () => {
      expect(slugify('!@#$%^&*()')).toBe('');
    });

    it('should preserve numbers', () => {
      expect(slugify('Team 123 Warriors')).toBe('team-123-warriors');
    });

    it('should handle unicode characters', () => {
      expect(slugify('Café München')).toBe('caf-m-nchen');
    });
  });

  describe('getCurrentTeamId', () => {
    it('should return team ID from localStorage', () => {
      const teamId = 'team-123';
      mockLocalStorage.getItem.mockReturnValue(teamId);

      const result = getCurrentTeamId();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('current_team_id');
      expect(result).toBe(teamId);
    });

    it('should return null when no team ID is stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getCurrentTeamId();

      expect(result).toBeNull();
    });
  });

  describe('setCurrentTeamId', () => {
    it('should store team ID in localStorage', () => {
      const teamId = 'team-123';

      setCurrentTeamId(teamId);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('current_team_id', teamId);
    });
  });

  describe('fetchTeamById', () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    };

    beforeEach(() => {
      mockSupabase.from.mockReturnValue(mockQuery);
    });

    it('should fetch team successfully', async () => {
      const teamId = 'warriors';
      const teamData: TeamRecord = {
        id: 'warriors',
        name: 'Warriors',
        coach_id: 'coach-123',
        logo_url: 'https://example.com/logo.jpg',
      };

      mockQuery.maybeSingle.mockResolvedValue({
        data: teamData,
        error: null,
      });

      const result = await fetchTeamById(teamId);

      expect(mockSupabase.from).toHaveBeenCalledWith('teams');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', teamId);
      expect(mockQuery.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(teamData);
    });

    it('should return null when team not found', async () => {
      const teamId = 'non-existent';

      mockQuery.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await fetchTeamById(teamId);

      expect(result).toBeNull();
    });

    it('should return null and log error when database error occurs', async () => {
      const teamId = 'warriors';
      const error = { message: 'Database connection error' };

      mockQuery.maybeSingle.mockResolvedValue({
        data: null,
        error,
      });

      const result = await fetchTeamById(teamId);

      expect(result).toBeNull();
      expect(consoleSpy.error).toHaveBeenCalledWith('fetchTeamById error', error);
    });
  });

  describe('uploadTeamLogo', () => {
    const mockStorageBucket = {
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
    };

    beforeEach(() => {
      mockSupabase.storage.from.mockReturnValue(mockStorageBucket);
    });

    it('should upload logo successfully and return public URL', async () => {
      const teamId = 'warriors';
      const file = new File(['logo'], 'logo.jpg', { type: 'image/jpeg' });
      const publicUrl = 'https://example.com/logo.jpg';

      mockStorageBucket.upload.mockResolvedValue({
        data: { path: `${teamId}/123_logo.jpg` },
        error: null,
      });
      mockStorageBucket.getPublicUrl.mockReturnValue({
        data: { publicUrl },
      });

      const result = await uploadTeamLogo(teamId, file);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith(TEAM_LOGO_BUCKET);
      expect(mockStorageBucket.upload).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^${teamId}/\\d+_${file.name}$`)),
        file,
        { upsert: true }
      );
      expect(mockStorageBucket.getPublicUrl).toHaveBeenCalledWith(`${teamId}/123_logo.jpg`);
      expect(result).toBe(publicUrl);
    });

    it('should return null when upload fails and log warning', async () => {
      const teamId = 'warriors';
      const file = new File(['logo'], 'logo.jpg', { type: 'image/jpeg' });
      const error = { message: 'Upload failed' };

      mockStorageBucket.upload.mockResolvedValue({
        data: null,
        error,
      });

      const result = await uploadTeamLogo(teamId, file);

      expect(result).toBeNull();
      expect(mockStorageBucket.getPublicUrl).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledWith('uploadTeamLogo warning:', 'Upload failed');
    });

    it('should return null when getPublicUrl returns no URL', async () => {
      const teamId = 'warriors';
      const file = new File(['logo'], 'logo.jpg', { type: 'image/jpeg' });

      mockStorageBucket.upload.mockResolvedValue({
        data: { path: `${teamId}/123_logo.jpg` },
        error: null,
      });
      mockStorageBucket.getPublicUrl.mockReturnValue({
        data: null,
      });

      const result = await uploadTeamLogo(teamId, file);

      expect(result).toBeNull();
    });

    it('should generate unique file paths with timestamp', async () => {
      const teamId = 'warriors';
      const file = new File(['logo'], 'logo.jpg', { type: 'image/jpeg' });

      mockStorageBucket.upload.mockResolvedValue({
        data: { path: 'some-path' },
        error: null,
      });
      mockStorageBucket.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/logo.jpg' },
      });

      await uploadTeamLogo(teamId, file);

      const uploadCall = mockStorageBucket.upload.mock.calls[0];
      const uploadedPath = uploadCall[0];
      
      expect(uploadedPath).toMatch(new RegExp(`^${teamId}/\\d+_${file.name}$`));
      expect(uploadedPath).toContain(teamId);
      expect(uploadedPath).toContain(file.name);
    });

    it('should handle error object without message property', async () => {
      const teamId = 'warriors';
      const file = new File(['logo'], 'logo.jpg', { type: 'image/jpeg' });
      const error = { code: 'BUCKET_NOT_FOUND' };

      mockStorageBucket.upload.mockResolvedValue({
        data: null,
        error,
      });

      const result = await uploadTeamLogo(teamId, file);

      expect(result).toBeNull();
      expect(consoleSpy.warn).toHaveBeenCalledWith('uploadTeamLogo warning:', error);
    });
  });

  describe('createTeam', () => {
    const mockTable = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    beforeEach(() => {
      mockSupabase.from.mockReturnValue(mockTable);
    });

    it('should return null and log error when team creation fails', async () => {
      const teamName = 'Golden Warriors';
      const error = { message: 'Team already exists' };

      mockTable.single.mockResolvedValue({
        data: null,
        error,
      });

      const result = await createTeam(teamName);

      expect(result).toBeNull();
      expect(consoleSpy.error).toHaveBeenCalledWith('createTeam error', error);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    // it('should handle logo upload failure correctly', async () => {
    //   const teamName = 'Golden Warriors';
    //   const logoFile = new File(['logo'], 'logo.jpg', { type: 'image/jpeg' });
    //   const expectedTeamId = 'golden-warriors';
    //   const teamData: TeamRecord = {
    //     id: expectedTeamId,
    //     name: teamName,
    //     coach_id: null,
    //     logo_url: null,
    //   };

    //   // Mock failed logo upload
    //   const mockStorageBucket = {
    //     upload: vi.fn().mockResolvedValue({
    //       data: null,
    //       error: { message: 'Storage error' },
    //     }),
    //     getPublicUrl: vi.fn(),
    //   };
    //   mockSupabase.storage.from.mockReturnValue(mockStorageBucket);

    //   // Mock successful team creation
    //   mockTable.single.mockResolvedValue({
    //     data: teamData,
    //     error: null,
    //   });

    //   const result = await createTeam(teamName, logoFile);

    //   expect(mockTable.insert).toHaveBeenCalledWith({
    //     id: expectedTeamId,
    //     name: teamName,
    //     logo_url: null,
    //     coach_id: null,
    //   });
    //   expect(consoleSpy.warn).toHaveBeenCalledWith('uploadTeamLogo warning:', 'Storage error');
    //   expect(result).toEqual(teamData);
    // });
  });

  describe('Integration Tests', () => {
    it('should handle complete team creation workflow with logo', async () => {
      const teamName = 'Golden State Warriors';
      const logoFile = new File(['logo'], 'warriors-logo.jpg', { type: 'image/jpeg' });
      const coachId = 'coach-123';
      const expectedTeamId = 'golden-state-warriors';
      const logoUrl = 'https://example.com/warriors-logo.jpg';

      // Mock storage operations
      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({
          data: { path: `${expectedTeamId}/123_warriors-logo.jpg` },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: logoUrl },
        }),
      };
      mockSupabase.storage.from.mockReturnValue(mockStorageBucket);

      // Mock database operations
      const mockTable = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: expectedTeamId,
            name: teamName,
            coach_id: coachId,
            logo_url: logoUrl,
          },
          error: null,
        }),
      };
      mockSupabase.from.mockReturnValue(mockTable);

      const result = await createTeam(teamName, logoFile, coachId);

      // Verify the complete workflow
      expect(result).toEqual({
        id: expectedTeamId,
        name: teamName,
        coach_id: coachId,
        logo_url: logoUrl,
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('current_team_id', expectedTeamId);
    });

    it('should handle team fetch after creation', async () => {
      const teamId = 'warriors';
      const teamData: TeamRecord = {
        id: teamId,
        name: 'Warriors',
        coach_id: 'coach-123',
        logo_url: 'https://example.com/logo.jpg',
      };

      // Set up fetch mock
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: teamData,
          error: null,
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      // Simulate team ID being set
      mockLocalStorage.getItem.mockReturnValue(teamId);

      // Fetch the team
      const currentTeamId = getCurrentTeamId();
      const fetchedTeam = await fetchTeamById(currentTeamId!);

      expect(currentTeamId).toBe(teamId);
      expect(fetchedTeam).toEqual(teamData);
    });

    it('should handle localStorage persistence across operations', async () => {
      const teamId1 = 'warriors';
      const teamId2 = 'lakers';

      // Set first team
      setCurrentTeamId(teamId1);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('current_team_id', teamId1);

      // Mock localStorage to return the set value
      mockLocalStorage.getItem.mockReturnValue(teamId1);
      expect(getCurrentTeamId()).toBe(teamId1);

      // Change to second team
      setCurrentTeamId(teamId2);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('current_team_id', teamId2);

      // Mock localStorage to return the new value
      mockLocalStorage.getItem.mockReturnValue(teamId2);
      expect(getCurrentTeamId()).toBe(teamId2);
    });
  });
});