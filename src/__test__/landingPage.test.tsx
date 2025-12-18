import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/landingPage';
import supabase from '../../supabaseClient';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock supabase
vi.mock('../../supabaseClient', () => ({
  default: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver as any;

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
  };

  describe('Authentication States', () => {
    


    it('should display admin button when user role is admin', async () => {
      const mockUser = {
        id: 'admin-123',
        email: 'admin@example.com',
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'admin' },
            }),
          }),
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });
    });

    it('should not display admin button when user role is not admin', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'fan' },
            }),
          }),
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });
    });

    it('should navigate to login when sign in is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        const signInBtn = screen.getByText('Sign In');
        fireEvent.click(signInBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should navigate to signup when get started is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        const getStartedBtns = screen.getAllByText('Get Started');
        fireEvent.click(getStartedBtns[0]);
        expect(mockNavigate).toHaveBeenCalledWith('/signup');
      });
    });

    it('should navigate to user dashboard when dashboard button is clicked', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'fan' },
            }),
          }),
        }),
      });

      renderComponent();

      await waitFor(() => {
        const dashboardBtn = screen.getByText('Dashboard');
        fireEvent.click(dashboardBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/user-dashboard');
      });
    });

    it('should navigate to admin dashboard when admin button is clicked', async () => {
      const mockUser = {
        id: 'admin-123',
        email: 'admin@example.com',
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'admin' },
            }),
          }),
        }),
      });

      renderComponent();

      await waitFor(() => {
        const adminBtn = screen.getByText('Admin');
        fireEvent.click(adminBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
      });
    });

    it('should sign out and navigate to home when sign out is clicked', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'fan' },
            }),
          }),
        }),
      });

      (supabase.auth.signOut as any).mockResolvedValue({});

      renderComponent();

      await waitFor(async () => {
        const signOutBtn = screen.getByText('Sign Out');
        fireEvent.click(signOutBtn);
        
        await waitFor(() => {
          expect(supabase.auth.signOut).toHaveBeenCalled();
          expect(mockNavigate).toHaveBeenCalledWith('/');
        });
      });
    });
  });

  describe('Content Rendering', () => {
    beforeEach(() => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });
    });

    it('should render hero section with correct title', () => {
      renderComponent();

      expect(screen.getByText('Track. Analyze.')).toBeInTheDocument();
      expect(screen.getByText('Dominate.')).toBeInTheDocument();
    });

    it('should render roles section with all roles', () => {
      renderComponent();

      expect(screen.getByText('Built for Everyone')).toBeInTheDocument();
      expect(screen.getByText('For Coaches')).toBeInTheDocument();
      expect(screen.getByText('For Fans')).toBeInTheDocument();
      expect(screen.getByText('For Administrators')).toBeInTheDocument();
    });

    it('should render footer with branding', () => {
      renderComponent();

      expect(screen.getByText('Empowering football success through data-driven insights')).toBeInTheDocument();
    });
  });

  describe('Intersection Observer', () => {
    it('should setup intersection observer on mount', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });

      renderComponent();

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      }, { timeout: 200 });
    });

    it('should observe fade-in sections', async () => {
      const mockObserve = vi.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: mockObserve,
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });

      renderComponent();

      await waitFor(() => {
        expect(mockObserve).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe('Role-Based CTA Buttons', () => {
    beforeEach(() => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });
    });

    it('should navigate to signup when role card CTA buttons are clicked', () => {
      renderComponent();

      const startCoachingBtn = screen.getByText('Start Coaching');
      const startFollowingBtn = screen.getByText('Start Following');
      const adminPortalBtn = screen.getByText('Admin Portal');

      fireEvent.click(startCoachingBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/signup');

      fireEvent.click(startFollowingBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/signup');

      fireEvent.click(adminPortalBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
  });

  describe('CTA Section', () => {
    it('should show "Get Started Today" button when not logged in', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Get Started Today')).toBeInTheDocument();
      });
    });

    it('should show "Go to Dashboard" button when logged in', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'fan' },
            }),
          }),
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
      });
    });
  });
});