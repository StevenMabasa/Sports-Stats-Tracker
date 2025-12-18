import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadAvatar, upsertUserProfile, fetchUserProfile, AVATAR_BUCKET, type UpsertProfilePayload } from '../services/profileService';

// Mock the supabase client - define the mock inline in vi.mock()
vi.mock('../../supabaseClient.ts', () => ({
  default: {
    storage: {
      from: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Import the mocked module after mocking
import supabase from '../../supabaseClient.ts';

// Type assertion to access the mocked methods
const mockSupabase = supabase as any;

describe('Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadAvatar', () => {
    const mockStorageBucket = {
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
    };

    beforeEach(() => {
      mockSupabase.storage.from.mockReturnValue(mockStorageBucket);
    });

    it('should upload avatar successfully and return public URL', async () => {
      const userId = 'user-123';
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
      const uploadPath = `${userId}/${Date.now()}_${file.name}`;
      const publicUrl = 'https://example.com/avatar.jpg';

      // Mock successful upload
      mockStorageBucket.upload.mockResolvedValue({
        data: { path: uploadPath },
        error: null,
      });

      // Mock getPublicUrl
      mockStorageBucket.getPublicUrl.mockReturnValue({
        data: { publicUrl },
      });

      const result = await uploadAvatar(userId, file);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith(AVATAR_BUCKET);
      expect(mockStorageBucket.upload).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^${userId}/\\d+_${file.name}$`)),
        file,
        { upsert: true }
      );
      expect(mockStorageBucket.getPublicUrl).toHaveBeenCalledWith(uploadPath);
      expect(result).toBe(publicUrl);
    });

    it('should return null when upload fails', async () => {
      const userId = 'user-123';
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

      // Mock failed upload
      mockStorageBucket.upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });

      const result = await uploadAvatar(userId, file);

      expect(result).toBeNull();
      expect(mockStorageBucket.getPublicUrl).not.toHaveBeenCalled();
    });

    it('should return null when getPublicUrl returns no URL', async () => {
      const userId = 'user-123';
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
      const uploadPath = `${userId}/${Date.now()}_${file.name}`;

      mockStorageBucket.upload.mockResolvedValue({
        data: { path: uploadPath },
        error: null,
      });

      // Mock getPublicUrl returning no URL
      mockStorageBucket.getPublicUrl.mockReturnValue({
        data: null,
      });

      const result = await uploadAvatar(userId, file);

      expect(result).toBeNull();
    });

    it('should generate unique file paths with timestamp', async () => {
      const userId = 'user-123';
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

      mockStorageBucket.upload.mockResolvedValue({
        data: { path: 'some-path' },
        error: null,
      });
      mockStorageBucket.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/avatar.jpg' },
      });

      await uploadAvatar(userId, file);

      const uploadCall = mockStorageBucket.upload.mock.calls[0];
      const uploadedPath = uploadCall[0];
      
      expect(uploadedPath).toMatch(new RegExp(`^${userId}/\\d+_${file.name}$`));
      expect(uploadedPath).toContain(userId);
      expect(uploadedPath).toContain(file.name);
    });
  });

  describe('upsertUserProfile', () => {
    const mockTable = {
      upsert: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
      mockSupabase.from.mockReturnValue(mockTable);
    });

    it('should upsert profile successfully with all fields', async () => {
      const payload: UpsertProfilePayload = {
        id: 'user-123',
        display_name: 'John Doe',
        bio: 'Software developer',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      mockTable.upsert.mockResolvedValue({ error: null });

      await upsertUserProfile(payload);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockTable.upsert).toHaveBeenCalledWith({
        id: payload.id,
        display_name: payload.display_name,
        bio: payload.bio,
        avatar_url: payload.avatar_url,
        updated_at: expect.any(String),
      });
    });

    it('should upsert profile with null values for optional fields', async () => {
      const payload: UpsertProfilePayload = {
        id: 'user-123',
      };

      mockTable.upsert.mockResolvedValue({ error: null });

      await upsertUserProfile(payload);

      expect(mockTable.upsert).toHaveBeenCalledWith({
        id: payload.id,
        display_name: null,
        bio: null,
        avatar_url: null,
        updated_at: expect.any(String),
      });
    });

    it('should include updated_at timestamp', async () => {
      const payload: UpsertProfilePayload = { id: 'user-123' };
      const beforeTime = new Date().toISOString();

      mockTable.upsert.mockResolvedValue({ error: null });

      await upsertUserProfile(payload);

      const afterTime = new Date().toISOString();
      const upsertCall = mockTable.upsert.mock.calls[0][0];
      
      expect(upsertCall.updated_at).toBeDefined();
      expect(upsertCall.updated_at >= beforeTime).toBe(true);
      expect(upsertCall.updated_at <= afterTime).toBe(true);
    });

    it('should throw error when upsert fails', async () => {
      const payload: UpsertProfilePayload = { id: 'user-123' };
      const error = new Error('Database error');

      mockTable.upsert.mockResolvedValue({ error });

      await expect(upsertUserProfile(payload)).rejects.toThrow('Database error');
    });
  });

  describe('fetchUserProfile', () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    };

    beforeEach(() => {
      mockSupabase.from.mockReturnValue(mockQuery);
    });

    it('should fetch user profile successfully', async () => {
      const userId = 'user-123';
      const profileData = {
        display_name: 'John Doe',
        bio: 'Software developer',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      mockQuery.maybeSingle.mockResolvedValue({
        data: profileData,
        error: null,
      });

      const result = await fetchUserProfile(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockQuery.select).toHaveBeenCalledWith('display_name, bio, avatar_url');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', userId);
      expect(mockQuery.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(profileData);
    });

    it('should return null when no profile exists', async () => {
      const userId = 'user-123';

      mockQuery.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await fetchUserProfile(userId);

      expect(result).toBeNull();
    });

    it('should ignore PGRST116 error (no rows found) and return null', async () => {
      const userId = 'user-123';

      mockQuery.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await fetchUserProfile(userId);

      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      const userId = 'user-123';
      const error = { code: 'PGRST500', message: 'Internal server error' };

      mockQuery.maybeSingle.mockResolvedValue({
        data: null,
        error,
      });

      await expect(fetchUserProfile(userId)).rejects.toEqual(error);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete profile update workflow', async () => {
      const userId = 'user-123';
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
      const avatarUrl = 'https://example.com/avatar.jpg';

      // Mock storage operations
      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({
          data: { path: `${userId}/123_avatar.jpg` },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: avatarUrl },
        }),
      };
      mockSupabase.storage.from.mockReturnValue(mockStorageBucket);

      // Mock database operations
      const mockTable = {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockTable);

      // Upload avatar
      const uploadedUrl = await uploadAvatar(userId, file);
      expect(uploadedUrl).toBe(avatarUrl);

      // Update profile with avatar URL
      await upsertUserProfile({
        id: userId,
        display_name: 'John Doe',
        avatar_url: uploadedUrl,
      });

      expect(mockTable.upsert).toHaveBeenCalledWith({
        id: userId,
        display_name: 'John Doe',
        bio: null,
        avatar_url: avatarUrl,
        updated_at: expect.any(String),
      });
    });

    it('should handle profile update without avatar upload', async () => {
      const userId = 'user-123';

      // Mock database operations
      const mockTable = {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            display_name: 'Jane Doe',
            bio: 'Updated bio',
            avatar_url: null,
          },
          error: null,
        }),
      };
      
      mockSupabase.from
        .mockReturnValueOnce(mockTable) // for upsert
        .mockReturnValueOnce(mockQuery); // for fetch

      // Update profile
      await upsertUserProfile({
        id: userId,
        display_name: 'Jane Doe',
        bio: 'Updated bio',
      });

      // Fetch updated profile
      const profile = await fetchUserProfile(userId);

      expect(profile).toEqual({
        display_name: 'Jane Doe',
        bio: 'Updated bio',
        avatar_url: null,
      });
    });
  });
});