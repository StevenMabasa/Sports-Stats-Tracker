import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUserRole,
  updateUserRole,
  isCoach,
  isFan,
  createUserProfile,
  type UserRole
} from '../services/roleService';

// Mock the supabase client
vi.mock('../../supabaseClient', () => ({
  default: {
    from: vi.fn(),
  },
}));

// Mock console methods to avoid test noise
const consoleSpy = {
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

// Import the mocked module after mocking
import supabase from '../../supabaseClient';

// Type assertion to access the mocked methods
const mockSupabase = supabase as any;

describe('User Role Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.error.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests', () => {
    describe('getUserRole', () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      beforeEach(() => {
        mockSupabase.from.mockReturnValue(mockQuery);
      });

      it('should fetch user role successfully', async () => {
        const userId = 'user-123';
        const userData: UserRole = {
          id: userId,
          email: 'john@example.com',
          role: 'Coach',
          google_id: 'google-123',
        };

        mockQuery.single.mockResolvedValue({
          data: userData,
          error: null,
        });

        const result = await getUserRole(userId);

        expect(mockSupabase.from).toHaveBeenCalledWith('users');
        expect(mockQuery.select).toHaveBeenCalledWith('id, email, role, google_id');
        expect(mockQuery.eq).toHaveBeenCalledWith('id', userId);
        expect(mockQuery.single).toHaveBeenCalled();
        expect(result).toEqual(userData);
      });

      it('should return null when user not found', async () => {
        const userId = 'non-existent';

        mockQuery.single.mockResolvedValue({
          data: null,
          error: { message: 'User not found' },
        });

        const result = await getUserRole(userId);

        expect(result).toBeNull();
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching user role:', { message: 'User not found' });
      });

      it('should handle database errors correctly', async () => {
        const userId = 'user-123';
        const error = { message: 'Database connection error' };

        mockQuery.single.mockResolvedValue({
          data: null,
          error,
        });

        const result = await getUserRole(userId);

        expect(result).toBeNull();
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching user role:', error);
      });

      it('should handle exceptions in try-catch block', async () => {
        const userId = 'user-123';
        const error = new Error('Network error');

        mockQuery.single.mockRejectedValue(error);

        const result = await getUserRole(userId);

        expect(result).toBeNull();
        expect(consoleSpy.error).toHaveBeenCalledWith('Error in getUserRole:', error);
      });

      it('should handle user without google_id', async () => {
        const userId = 'user-123';
        const userData: UserRole = {
          id: userId,
          email: 'john@example.com',
          role: 'Fan',
        };

        mockQuery.single.mockResolvedValue({
          data: userData,
          error: null,
        });

        const result = await getUserRole(userId);

        expect(result).toEqual(userData);
        expect(result?.google_id).toBeUndefined();
      });
    });

    describe('updateUserRole', () => {
      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn(),
      };

      beforeEach(() => {
        mockSupabase.from.mockReturnValue(mockUpdate);
      });

      it('should update user role successfully', async () => {
        const userId = 'user-123';
        const role = 'Coach';

        mockUpdate.eq.mockResolvedValue({
          error: null,
        });

        const result = await updateUserRole(userId, role);

        expect(mockSupabase.from).toHaveBeenCalledWith('users');
        expect(mockUpdate.update).toHaveBeenCalledWith({ role });
        expect(mockUpdate.eq).toHaveBeenCalledWith('id', userId);
        expect(result).toBe(true);
      });

      it('should return false when update fails', async () => {
        const userId = 'user-123';
        const role = 'Fan';
        const error = { message: 'Update failed' };

        mockUpdate.eq.mockResolvedValue({
          error,
        });

        const result = await updateUserRole(userId, role);

        expect(result).toBe(false);
        expect(consoleSpy.error).toHaveBeenCalledWith('Error updating user role:', error);
      });

      it('should handle exceptions in try-catch block', async () => {
        const userId = 'user-123';
        const role = 'Coach';
        const error = new Error('Network error');

        mockUpdate.eq.mockRejectedValue(error);

        const result = await updateUserRole(userId, role);

        expect(result).toBe(false);
        expect(consoleSpy.error).toHaveBeenCalledWith('Error in updateUserRole:', error);
      });

      it('should update role to Fan', async () => {
        const userId = 'user-123';
        const role = 'Fan';

        mockUpdate.eq.mockResolvedValue({
          error: null,
        });

        const result = await updateUserRole(userId, role);

        expect(mockUpdate.update).toHaveBeenCalledWith({ role: 'Fan' });
        expect(result).toBe(true);
      });

      it('should update role to Coach', async () => {
        const userId = 'user-123';
        const role = 'Coach';

        mockUpdate.eq.mockResolvedValue({
          error: null,
        });

        const result = await updateUserRole(userId, role);

        expect(mockUpdate.update).toHaveBeenCalledWith({ role: 'Coach' });
        expect(result).toBe(true);
      });
    });

    describe('isCoach', () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      beforeEach(() => {
        mockSupabase.from.mockReturnValue(mockQuery);
      });

      it('should return true for coach role', async () => {
        const userId = 'user-123';
        const userData: UserRole = {
          id: userId,
          email: 'coach@example.com',
          role: 'Coach',
        };

        mockQuery.single.mockResolvedValue({
          data: userData,
          error: null,
        });

        const result = await isCoach(userId);

        expect(result).toBe(true);
      });

      it('should return false for fan role', async () => {
        const userId = 'user-123';
        const userData: UserRole = {
          id: userId,
          email: 'fan@example.com',
          role: 'Fan',
        };

        mockQuery.single.mockResolvedValue({
          data: userData,
          error: null,
        });

        const result = await isCoach(userId);

        expect(result).toBe(false);
      });

      it('should return false when user not found', async () => {
        const userId = 'non-existent';

        mockQuery.single.mockResolvedValue({
          data: null,
          error: { message: 'User not found' },
        });

        const result = await isCoach(userId);

        expect(result).toBe(false);
      });

      it('should return false when getUserRole returns null', async () => {
        const userId = 'user-123';

        mockQuery.single.mockRejectedValue(new Error('Database error'));

        const result = await isCoach(userId);

        expect(result).toBe(false);
      });
    });

    describe('isFan', () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      beforeEach(() => {
        mockSupabase.from.mockReturnValue(mockQuery);
      });

      it('should return true for fan role', async () => {
        const userId = 'user-123';
        const userData: UserRole = {
          id: userId,
          email: 'fan@example.com',
          role: 'Fan',
        };

        mockQuery.single.mockResolvedValue({
          data: userData,
          error: null,
        });

        const result = await isFan(userId);

        expect(result).toBe(true);
      });

      it('should return false for coach role', async () => {
        const userId = 'user-123';
        const userData: UserRole = {
          id: userId,
          email: 'coach@example.com',
          role: 'Coach',
        };

        mockQuery.single.mockResolvedValue({
          data: userData,
          error: null,
        });

        const result = await isFan(userId);

        expect(result).toBe(false);
      });

      it('should return false when user not found', async () => {
        const userId = 'non-existent';

        mockQuery.single.mockResolvedValue({
          data: null,
          error: { message: 'User not found' },
        });

        const result = await isFan(userId);

        expect(result).toBe(false);
      });

      it('should return false when getUserRole returns null', async () => {
        const userId = 'user-123';

        mockQuery.single.mockRejectedValue(new Error('Database error'));

        const result = await isFan(userId);

        expect(result).toBe(false);
      });
    });

    describe('createUserProfile', () => {
      beforeEach(() => {
        // Reset the mock to return different instances for each call
        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'user_profiles') {
            return {
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
        });
      });

      it('should create user profile successfully with default Fan role', async () => {
        const userId = 'user-123';
        const email = 'john.doe@example.com';

        const usersInsert = vi.fn().mockResolvedValue({ error: null });
        const profilesInsert = vi.fn().mockResolvedValue({ error: null });

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return { insert: usersInsert };
          }
          if (table === 'user_profiles') {
            return { insert: profilesInsert };
          }
        });

        const result = await createUserProfile(userId, email);

        expect(mockSupabase.from).toHaveBeenCalledWith('users');
        expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
        expect(usersInsert).toHaveBeenCalledWith({
          id: userId,
          email,
          role: 'Fan',
        });
        expect(profilesInsert).toHaveBeenCalledWith({
          id: userId,
          display_name: 'john.doe',
        });
        expect(result).toBe(true);
      });

      it('should create user profile successfully with Coach role', async () => {
        const userId = 'user-123';
        const email = 'coach@example.com';
        const role = 'Coach';

        const usersInsert = vi.fn().mockResolvedValue({ error: null });
        const profilesInsert = vi.fn().mockResolvedValue({ error: null });

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return { insert: usersInsert };
          }
          if (table === 'user_profiles') {
            return { insert: profilesInsert };
          }
        });

        const result = await createUserProfile(userId, email, role);

        expect(usersInsert).toHaveBeenCalledWith({
          id: userId,
          email,
          role: 'Coach',
        });
        expect(profilesInsert).toHaveBeenCalledWith({
          id: userId,
          display_name: 'coach',
        });
        expect(result).toBe(true);
      });

      it('should return false when user creation fails', async () => {
        const userId = 'user-123';
        const email = 'john@example.com';
        const error = { message: 'User already exists' };

        const usersInsert = vi.fn().mockResolvedValue({ error });
        const profilesInsert = vi.fn().mockResolvedValue({ error: null });

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return { insert: usersInsert };
          }
          if (table === 'user_profiles') {
            return { insert: profilesInsert };
          }
        });

        const result = await createUserProfile(userId, email);

        expect(result).toBe(false);
        expect(consoleSpy.error).toHaveBeenCalledWith('Error creating user:', error);
        expect(profilesInsert).not.toHaveBeenCalled();
      });

      it('should return false when profile creation fails', async () => {
        const userId = 'user-123';
        const email = 'john@example.com';
        const error = { message: 'Profile creation failed' };

        const usersInsert = vi.fn().mockResolvedValue({ error: null });
        const profilesInsert = vi.fn().mockResolvedValue({ error });

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return { insert: usersInsert };
          }
          if (table === 'user_profiles') {
            return { insert: profilesInsert };
          }
        });

        const result = await createUserProfile(userId, email);

        expect(result).toBe(false);
        expect(consoleSpy.error).toHaveBeenCalledWith('Error creating user profile:', error);
      });

      it('should handle exceptions in try-catch block', async () => {
        const userId = 'user-123';
        const email = 'john@example.com';
        const error = new Error('Network error');

        mockSupabase.from.mockImplementation(() => {
          throw error;
        });

        const result = await createUserProfile(userId, email);

        expect(result).toBe(false);
        expect(consoleSpy.error).toHaveBeenCalledWith('Error in createUserProfile:', error);
      });

      it('should extract display name correctly from various email formats', async () => {
        const testCases = [
          { email: 'simple@example.com', expectedDisplayName: 'simple' },
          { email: 'first.last@example.com', expectedDisplayName: 'first.last' },
          { email: 'user+tag@example.com', expectedDisplayName: 'user+tag' },
          { email: 'user123@example.com', expectedDisplayName: 'user123' },
        ];

        for (const { email, expectedDisplayName } of testCases) {
          const usersInsert = vi.fn().mockResolvedValue({ error: null });
          const profilesInsert = vi.fn().mockResolvedValue({ error: null });

          mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'users') {
              return { insert: usersInsert };
            }
            if (table === 'user_profiles') {
              return { insert: profilesInsert };
            }
          });

          await createUserProfile('user-123', email);

          expect(profilesInsert).toHaveBeenCalledWith({
            id: 'user-123',
            display_name: expectedDisplayName,
          });
        }
      });
    });
  });

  describe('Integration Tests', () => {
    describe('User Role Management Workflow', () => {
      it('should handle complete user onboarding workflow', async () => {
        const userId = 'new-user-123';
        const email = 'newuser@example.com';
        const role = 'Fan';

        // Mock successful user creation
        const usersInsert = vi.fn().mockResolvedValue({ error: null });
        const profilesInsert = vi.fn().mockResolvedValue({ error: null });

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return { insert: usersInsert };
          }
          if (table === 'user_profiles') {
            return { insert: profilesInsert };
          }
        });

        // Create user profile
        const created = await createUserProfile(userId, email, role);
        expect(created).toBe(true);

        // Mock user retrieval after creation
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: userId,
              email,
              role,
            },
            error: null,
          }),
        };
        mockSupabase.from.mockReturnValue(mockQuery);

        // Verify user role
        const userRole = await getUserRole(userId);
        expect(userRole).toEqual({
          id: userId,
          email,
          role,
        });

        // Check role-specific functions
        const isFanResult = await isFan(userId);
        const isCoachResult = await isCoach(userId);

        expect(isFanResult).toBe(true);
        expect(isCoachResult).toBe(false);
      });

      it('should handle multiple users with different roles', async () => {
        const users = [
          { id: 'fan-1', email: 'fan1@example.com', role: 'Fan' as const },
          { id: 'fan-2', email: 'fan2@example.com', role: 'Fan' as const },
          { id: 'coach-1', email: 'coach1@example.com', role: 'Coach' as const },
          { id: 'coach-2', email: 'coach2@example.com', role: 'Coach' as const },
        ];

        // Mock getUserRole to return different users based on ID
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => {
            const lastEqCall = mockQuery.eq.mock.calls[mockQuery.eq.mock.calls.length - 1];
            const requestedUserId = lastEqCall[1];
            const user = users.find(u => u.id === requestedUserId);
            
            return Promise.resolve({
              data: user || null,
              error: user ? null : { message: 'User not found' },
            });
          }),
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        // Test each user
        for (const user of users) {
          const userRole = await getUserRole(user.id);
          expect(userRole).toEqual(user);

          const isFanResult = await isFan(user.id);
          const isCoachResult = await isCoach(user.id);

          if (user.role === 'Fan') {
            expect(isFanResult).toBe(true);
            expect(isCoachResult).toBe(false);
          } else {
            expect(isFanResult).toBe(false);
            expect(isCoachResult).toBe(true);
          }
        }
      });

      it('should handle user profile creation with role verification', async () => {
        const userId = 'integration-user';
        const email = 'integration@example.com';
        const role = 'Coach';

        // Mock user and profile creation
        const usersInsert = vi.fn().mockResolvedValue({ error: null });
        const profilesInsert = vi.fn().mockResolvedValue({ error: null });
        
        // Mock subsequent user retrieval
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: userId,
              email,
              role,
            },
            error: null,
          }),
        };

        let callCount = 0;
        mockSupabase.from.mockImplementation((table: string) => {
          callCount++;
          if (callCount <= 2) {
            // First two calls are for creation
            if (table === 'users') {
              return { insert: usersInsert };
            }
            if (table === 'user_profiles') {
              return { insert: profilesInsert };
            }
          } else {
            // Subsequent calls are for retrieval
            return mockQuery;
          }
        });

        // Create user profile
        const created = await createUserProfile(userId, email, role);
        expect(created).toBe(true);

        // Verify user was created with correct role
        const userRole = await getUserRole(userId);
        expect(userRole).toEqual({
          id: userId,
          email,
          role,
        });

        // Verify role-specific functions work correctly
        const isCoachResult = await isCoach(userId);
        const isFanResult = await isFan(userId);

        expect(isCoachResult).toBe(true);
        expect(isFanResult).toBe(false);

        // Verify the database operations were called correctly
        expect(usersInsert).toHaveBeenCalledWith({
          id: userId,
          email,
          role,
        });
        expect(profilesInsert).toHaveBeenCalledWith({
          id: userId,
          display_name: 'integration',
        });
      });

      it('should handle error scenarios in complete workflow', async () => {
        const userId = 'error-user';
        const email = 'error@example.com';

        // Mock failed user creation
        const usersInsert = vi.fn().mockResolvedValue({ 
          error: { message: 'Database constraint violation' } 
        });

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return { insert: usersInsert };
          }
        });

        // Attempt to create user profile
        const created = await createUserProfile(userId, email);
        expect(created).toBe(false);

        // Mock user retrieval to return null (user doesn't exist)
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        // Verify user role operations return appropriate defaults
        const userRole = await getUserRole(userId);
        expect(userRole).toBeNull();

        const isCoachResult = await isCoach(userId);
        const isFanResult = await isFan(userId);

        expect(isCoachResult).toBe(false);
        expect(isFanResult).toBe(false);
      });
    });
  });
});