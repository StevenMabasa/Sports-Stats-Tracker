import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../pages/AdminDashboard';
import supabase from '../../supabaseClient';
import { deleteUserCompletely } from '../services/adminService';

// Mock the adminService
vi.mock('../services/adminService', () => ({
  deleteUserCompletely: vi.fn(),
}));

vi.mock('../../supabaseClient', () => ({
  default: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(() => ({})),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.confirm and window.location
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'location', {
  writable: true,
  value: { assign: vi.fn() },
});

// Test data
const mockChats = [
  {
    id: 'chat1',
    author: 'John Doe',
    message: 'Hello, this is a test chat message',
    user_id: 'user1',
    inserted_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'chat2',
    author: 'Jane Smith',
    message: 'Another test message',
    user_id: 'user2',
    inserted_at: '2023-01-02T00:00:00Z',
  },
];

const mockUsers = [
  {
    id: 'user1',
    email: 'user1@test.com',
    role: 'user',
    created_at: '2023-01-01T00:00:00Z',
    last_sign_in: new Date().toISOString(),
  },
  {
    id: 'user2',
    email: 'admin@test.com',
    role: 'admin',
    created_at: '2023-01-02T00:00:00Z',
    last_sign_in_at: '2023-01-01T00:00:00Z',
  },
];

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful auth mock
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: 'admin-id' } } }
    });

    (supabase.auth.signOut as any).mockResolvedValue({});
    (deleteUserCompletely as any).mockResolvedValue(true);

    // Default admin profile mock
    const mockFrom = vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { role: 'admin' }
              })
            })),
            order: vi.fn().mockResolvedValue({ data: mockUsers })
          }))
        };
      }
      if (table === 'chats') {
        return {
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockChats })
          })),
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null })
          }))
        };
      }
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockUsers })
          }))
        };
      }
      return {
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [] })
        }))
      };
    });

    (supabase.from as any).mockImplementation(mockFrom);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // UNIT TESTS - Testing individual component functionality
  describe('Unit Tests', () => {
    it('should render loading state initially', () => {
      renderComponent();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render dashboard header with correct title', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should render logout button', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
    });

    it('should render navigation tabs', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Chats' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'User Management' })).toBeInTheDocument();
      });
    });
  });

  // UI TESTS - Testing user interface interactions
  describe('UI Tests', () => {
    it('should highlight active tab correctly', async () => {
      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        const chatsTab = screen.getByRole('button', { name: 'Chats' });
        expect(chatsTab).toHaveClass('active');
      });

      // Click User Management tab
      const usersTab = screen.getByRole('button', { name: 'User Management' });
      await user.click(usersTab);
      
      expect(usersTab).toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Chats' })).not.toHaveClass('active');
    });

    it('should switch between tabs and show appropriate content', async () => {
      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        // Should show chats content by default
        expect(screen.getByText('Hello, this is a test chat message')).toBeInTheDocument();
      });

      // Switch to users tab
      const usersTab = screen.getByRole('button', { name: 'User Management' });
      await user.click(usersTab);
      
      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument();
        expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      });
    });

    it('should display chat cards with correct information', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Hello, this is a test chat message')).toBeInTheDocument();
        expect(screen.getByText('Another test message')).toBeInTheDocument();
      });
    });

    it('should show delete buttons for chats and users', async () => {
      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        // Should show remove buttons for chats
        const removeButtons = screen.getAllByText('Remove');
        expect(removeButtons).toHaveLength(2);
      });

      // Switch to users tab
      const usersTab = screen.getByRole('button', { name: 'User Management' });
      await user.click(usersTab);
      
      await waitFor(() => {
        // Should show delete buttons for users
        const deleteButtons = screen.getAllByText('Delete');
        expect(deleteButtons).toHaveLength(2);
      });
    });
  });

  // INTEGRATION TESTS - Testing component interactions with external services
  describe('Integration Tests', () => {
    it('should delete a chat successfully', async () => {
      const mockDelete = vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      }));
      
      const mockFrom = vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: { role: 'admin' } })
              })),
              order: vi.fn().mockResolvedValue({ data: mockUsers })
            }))
          };
        }
        if (table === 'chats') {
          return {
            select: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({ data: mockChats })
            })),
            delete: mockDelete
          };
        }
        if (table === 'users') {
          return {
            select: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({ data: mockUsers })
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [] })
          }))
        };
      });
      (supabase.from as any).mockImplementation(mockFrom);
      (window.confirm as any).mockReturnValue(true);

      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByText('Remove');
      await user.click(removeButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove this chat?');
      expect(mockDelete).toHaveBeenCalled();
    });

    // it('should delete a user successfully', async () => {
    //   (deleteUserCompletely as any).mockResolvedValue(true);
    //   (window.confirm as any).mockReturnValue(true);

    //   renderComponent();
    //   const user = userEvent.setup();
      
    //   // Switch to users tab
    //   const usersTab = screen.getByRole('button', { name: 'User Management' });
    //   await user.click(usersTab);
      
    //   await waitFor(() => {
    //     expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    //   });

    //   const deleteButtons = screen.getAllByText('Delete');
    //   await user.click(deleteButtons[0]);

    //   expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user and all related data?');
    //   expect(deleteUserCompletely).toHaveBeenCalledWith('user1');
    // });

    it('should handle logout successfully', async () => {
      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith('/');
    });
  });

  // EDGE TESTS - Testing edge cases and error scenarios
  describe('Edge Tests', () => {

    it('should handle empty chats list', async () => {
      const mockFrom = vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: { role: 'admin' } })
              })),
              order: vi.fn().mockResolvedValue({ data: [] })
            }))
          };
        }
        if (table === 'chats') {
          return {
            select: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({ data: [] })
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [] })
          }))
        };
      });
      (supabase.from as any).mockImplementation(mockFrom);

      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No chats found.')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockFrom = vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: { role: 'admin' } })
              })),
              order: vi.fn().mockRejectedValue(new Error('API Error'))
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            order: vi.fn().mockRejectedValue(new Error('API Error'))
          }))
        };
      });
      (supabase.from as any).mockImplementation(mockFrom);

      renderComponent();
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should handle logout error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (supabase.auth.signOut as any).mockRejectedValue(new Error('Logout error'));

      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error during logout:', expect.any(Error));
        expect(window.location.assign).toHaveBeenCalledWith('/');
      });

      consoleSpy.mockRestore();
    });

  });
});