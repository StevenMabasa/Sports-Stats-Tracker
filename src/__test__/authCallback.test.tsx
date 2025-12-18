import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthCallback from '../pages/authCallback';
import { getUserRole, createUserProfile } from '../services/roleService';
import supabase from '../../supabaseClient';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../../supabaseClient', () => ({
  default: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('../services/roleService', () => ({
  getUserRole: vi.fn(),
  createUserProfile: vi.fn(),
}));

vi.mock('../components/RoleSelection', () => ({
  default: ({ onRoleSelected, userId, userEmail }: any) => (
    <div data-testid="role-selection">
      <div>Role Selection Component</div>
      <div>User ID: {userId}</div>
      <div>User Email: {userEmail}</div>
      <button onClick={() => onRoleSelected('Fan')}>Select Fan</button>
      <button onClick={() => onRoleSelected('Coach')}>Select Coach</button>
      <button onClick={() => onRoleSelected('Admin')}>Select Admin</button>
    </div>
  ),
}));

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};

// Import mocked modules
import { useNavigate } from 'react-router-dom';

// Type assertions for mocked modules
const mockNavigate = useNavigate as any;
const mockSupabase = supabase as any;
const mockGetUserRole = getUserRole as any;
const mockCreateUserProfile = createUserProfile as any;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000/auth/callback',
  search: '',
  origin: 'http://localhost:3000',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('AuthCallback Component', () => {
  const mockNavigateFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockLocation.search = '';
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
    consoleSpy.warn.mockClear();
    mockNavigate.mockReturnValue(mockNavigateFn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests', () => {
    describe('Initial Loading State', () => {
      it('should display loading message initially', () => {
        // Mock pending session
        mockSupabase.auth.getSession.mockReturnValue(new Promise(() => {}));

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    describe('OAuth Error Handling', () => {
      it('should navigate to login when OAuth error occurs', async () => {
        mockLocation.search = '?error=access_denied&error_description=User%20cancelled';

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockNavigateFn).toHaveBeenCalledWith('/login', { replace: true });
        });

        expect(consoleSpy.error).toHaveBeenCalledWith(
          '[AuthCallback] OAuth provider returned error:',
          expect.objectContaining({
            error: 'access_denied',
            description: 'User cancelled'
          })
        );
      });
    });

    describe('Session Error Handling', () => {
      it('should navigate to login when session fetch returns error', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: { message: 'Session error' },
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockNavigateFn).toHaveBeenCalledWith('/login', { replace: true });
        });
      });

      it('should navigate to login when no session exists', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockNavigateFn).toHaveBeenCalledWith('/login', { replace: true });
        });
      });

      it('should navigate to login when session user is null', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: { user: null } },
          error: null,
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockNavigateFn).toHaveBeenCalledWith('/login', { replace: true });
        });
      });
    });

    describe('Existing User Scenarios', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockSession = {
        user: mockUser,
      };

      it('should redirect existing coach to coach dashboard', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        mockGetUserRole.mockResolvedValue({
          id: mockUser.id,
          email: mockUser.email,
          role: 'Coach',
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockGetUserRole).toHaveBeenCalledWith(mockUser.id);
          expect(mockNavigateFn).toHaveBeenCalledWith('/coach-dashboard', {
            replace: true,
            state: {
              username: mockUser.email,
              userId: mockUser.id,
              isGoogleUser: true,
            },
          });
        });

        expect(localStorage.getItem('user_role')).toBe('Coach');
        expect(localStorage.getItem('user_id')).toBe(mockUser.id);
      });

      it('should redirect existing fan to user dashboard', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        mockGetUserRole.mockResolvedValue({
          id: mockUser.id,
          email: mockUser.email,
          role: 'Fan',
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockGetUserRole).toHaveBeenCalledWith(mockUser.id);
          expect(mockNavigateFn).toHaveBeenCalledWith('/user-dashboard', {
            replace: true,
            state: {
              username: mockUser.email,
              userId: mockUser.id,
              isGoogleUser: true,
            },
          });
        });

        expect(localStorage.getItem('user_role')).toBe('Fan');
        expect(localStorage.getItem('user_id')).toBe(mockUser.id);
      });

      it('should redirect existing admin to admin dashboard', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        mockGetUserRole.mockResolvedValue({
          id: mockUser.id,
          email: mockUser.email,
          role: 'Admin',
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockGetUserRole).toHaveBeenCalledWith(mockUser.id);
          expect(mockNavigateFn).toHaveBeenCalledWith('/admin-dashboard', {
            replace: true,
            state: {
              username: mockUser.email,
              userId: mockUser.id,
              isGoogleUser: true,
            },
          });
        });

        expect(localStorage.getItem('user_role')).toBe('Admin');
        expect(localStorage.getItem('user_id')).toBe(mockUser.id);
      });

      it('should handle user with unknown email', async () => {
        const userWithoutEmail = {
          id: 'user-123',
          email: null,
        };

        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: { user: userWithoutEmail } },
          error: null,
        });

        mockGetUserRole.mockResolvedValue(null);

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('User Email: Unknown')).toBeInTheDocument();
        });
      });

      it('should navigate to login when getUserRole throws error', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        mockGetUserRole.mockRejectedValue(new Error('Database error'));

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockNavigateFn).toHaveBeenCalledWith('/login', { replace: true });
        });
      });
    });

    describe('New User Scenarios', () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
      };

      const mockSession = {
        user: mockUser,
      };


      it('should not call navigate when showing role selection', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        mockGetUserRole.mockResolvedValue(null);

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        });

        // Should not have navigated anywhere yet
        expect(mockNavigateFn).not.toHaveBeenCalled();
      });

      it('should show role selection when from=signup parameter is present', async () => {
        mockLocation.search = '?from=signup';
        
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        // Even with existing role, should show role selection
        mockGetUserRole.mockResolvedValue({
          id: mockUser.id,
          email: mockUser.email,
          role: 'Fan',
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        });

        // getUserRole should not be called when from=signup
        expect(mockGetUserRole).not.toHaveBeenCalled();
      });

      it('should show role selection when cameFromSignup localStorage flag is set', async () => {
        localStorage.setItem('cameFromSignup', '1');
        
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        mockGetUserRole.mockResolvedValue({
          id: mockUser.id,
          email: mockUser.email,
          role: 'Fan',
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        });

        // localStorage flag should be removed
        expect(localStorage.getItem('cameFromSignup')).toBeNull();
      });
    });
  });

  describe('Integration Tests', () => {
    describe('Role Selection Workflow', () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
      };

      const mockSession = {
        user: mockUser,
      };

      beforeEach(() => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });
        
        mockGetUserRole.mockResolvedValue(null); // New user
      });

      it('should handle successful fan role selection', async () => {
        mockCreateUserProfile.mockResolvedValue(true);

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        });

        // Click fan role selection
        const fanButton = screen.getByText('Select Fan');
        fireEvent.click(fanButton);

        await waitFor(() => {
          expect(mockCreateUserProfile).toHaveBeenCalledWith(mockUser.id, mockUser.email, 'Fan');
          expect(mockNavigateFn).toHaveBeenCalledWith('/user-dashboard', { replace: true });
        });

        expect(localStorage.getItem('user_role')).toBe('Fan');
        expect(localStorage.getItem('user_id')).toBe(mockUser.id);
      });

      it('should handle successful coach role selection', async () => {
        mockCreateUserProfile.mockResolvedValue(true);

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        });

        // Click coach role selection
        const coachButton = screen.getByText('Select Coach');
        fireEvent.click(coachButton);

        await waitFor(() => {
          expect(mockCreateUserProfile).toHaveBeenCalledWith(mockUser.id, mockUser.email, 'Coach');
          expect(mockNavigateFn).toHaveBeenCalledWith('/team-setup', { replace: true });
        });

        expect(localStorage.getItem('user_role')).toBe('Coach');
        expect(localStorage.getItem('user_id')).toBe(mockUser.id);
      });

      it('should handle successful admin role selection', async () => {
        mockCreateUserProfile.mockResolvedValue(true);

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        });

        // Click admin role selection
        const adminButton = screen.getByText('Select Admin');
        fireEvent.click(adminButton);

        await waitFor(() => {
          // Creating an Admin via role selection is not allowed; ensure we did NOT attempt to create the profile
          expect(mockCreateUserProfile).not.toHaveBeenCalled();
          // Navigation must not occur; user should remain on role selection and be informed
          expect(mockNavigateFn).not.toHaveBeenCalled();
        });

        expect(localStorage.getItem('user_role')).toBeNull();
        expect(localStorage.getItem('user_id')).toBeNull();
      });

      it('should navigate to login when role creation fails', async () => {
        mockCreateUserProfile.mockResolvedValue(false);

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        });

        const fanButton = screen.getByText('Select Fan');
        fireEvent.click(fanButton);

        await waitFor(() => {
          // createUserProfile was attempted
          expect(mockCreateUserProfile).toHaveBeenCalledWith(mockUser.id, mockUser.email, 'Fan');
        });

        // The component does not navigate to /login on profile creation failure;
        // instead it sets an error and keeps the role selection visible.
        expect(mockNavigateFn).not.toHaveBeenCalled();
        expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        expect(localStorage.getItem('user_role')).toBeNull();
      });

      it('should navigate to login when role creation throws error', async () => {
        mockCreateUserProfile.mockRejectedValue(new Error('Database error'));

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('role-selection')).toBeInTheDocument();
        });

        const fanButton = screen.getByText('Select Fan');
        fireEvent.click(fanButton);

        await waitFor(() => {
          // createUserProfile was attempted and threw
          expect(mockCreateUserProfile).toHaveBeenCalledWith(mockUser.id, mockUser.email, 'Fan');
          // an error should have been logged by the component
          expect(consoleSpy.error).toHaveBeenCalledWith('[AuthCallback] Error handling user profile:', expect.any(Error));
        });

        // Component should not navigate to /login on exception; role selection remains
        expect(mockNavigateFn).not.toHaveBeenCalled();
        expect(screen.getByTestId('role-selection')).toBeInTheDocument();
      });

      it('should not handle role selection without userData', async () => {
        // Mock a scenario where userData is null (edge case)
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: { user: null } },
          error: null,
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(mockNavigateFn).toHaveBeenCalledWith('/login', { replace: true });
        });

        // Since there's no userData, role selection should not be shown
        expect(screen.queryByTestId('role-selection')).not.toBeInTheDocument();
      });
    });

    describe('Complete Authentication Flow', () => {

      it('should handle complete existing user login flow', async () => {
        const mockUser = {
          id: 'existing-user-123',
          email: 'existing@example.com',
        };

        // Step 1: Session exists
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: { user: mockUser } },
          error: null,
        });

        // Step 2: User exists as coach
        mockGetUserRole.mockResolvedValue({
          id: mockUser.id,
          email: mockUser.email,
          role: 'Coach',
        });

        render(
          <TestWrapper>
            <AuthCallback />
          </TestWrapper>
        );

        // Should show loading initially
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Should navigate directly to coach dashboard
        await waitFor(() => {
          expect(mockSupabase.auth.getSession).toHaveBeenCalled();
          expect(mockGetUserRole).toHaveBeenCalledWith(mockUser.id);
          expect(mockNavigateFn).toHaveBeenCalledWith('/coach-dashboard', {
            replace: true,
            state: {
              username: mockUser.email,
              userId: mockUser.id,
              isGoogleUser: true,
            },
          });
        });

        // Role selection should never be shown
        expect(screen.queryByTestId('role-selection')).not.toBeInTheDocument();
      });

      it('should handle role-based navigation correctly for different user types', async () => {
        const userTypes = [
          { role: 'Coach', expectedPath: '/coach-dashboard' },
          { role: 'Fan', expectedPath: '/user-dashboard' },
          { role: 'Admin', expectedPath: '/admin-dashboard' },
        ];

        for (const userType of userTypes) {
          // Reset mocks for each iteration
          vi.clearAllMocks();
          mockNavigateFn.mockClear();
          localStorageMock.clear();

          const mockUser = {
            id: `${userType.role.toLowerCase()}-user-123`,
            email: `${userType.role.toLowerCase()}@example.com`,
          };

          mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null,
          });

          mockGetUserRole.mockResolvedValue({
            id: mockUser.id,
            email: mockUser.email,
            role: userType.role,
          });

          const { unmount } = render(
            <TestWrapper>
              <AuthCallback />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(mockNavigateFn).toHaveBeenCalledWith(userType.expectedPath, {
              replace: true,
              state: {
                username: mockUser.email,
                userId: mockUser.id,
                isGoogleUser: true,
              },
            });
          });

          expect(localStorage.getItem('user_role')).toBe(userType.role);
          expect(localStorage.getItem('user_id')).toBe(mockUser.id);

          unmount();
        }
      });
    });
  });
});