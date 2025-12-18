import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import F1DriversPage from '../pages/f1/F1DriversPage';
import { useDrivers } from '../pages/f1/F1ApiBackend';

// Mock the F1ApiBackend hook
vi.mock('../pages/f1/F1ApiBackend', () => ({
  useDrivers: vi.fn(),
}));

// Mock CSS import
vi.mock('../pages/f1/F1DriversPage.css', () => ({}));

// Type assertion for mocked hook
const mockUseDrivers = useDrivers as ReturnType<typeof vi.fn>;

// Mock driver data
const mockDrivers = [
  {
    id: '1',
    full_name: 'Max Verstappen',
    given_name: 'Max',
    family_name: 'VERSTAPPEN',
    code: 'VER',
    image_url: 'https://example.com/verstappen.png',
    country_code: 'NLD',
    driver_number: 1,
  },
  {
    id: '2',
    full_name: 'Lewis Hamilton',
    given_name: 'Lewis',
    family_name: 'HAMILTON',
    code: 'HAM',
    image_url: 'https://example.com/hamilton.png',
    country_code: 'GBR',
    driver_number: 44,
  },
  {
    id: '3',
    full_name: 'Charles Leclerc',
    given_name: 'Charles',
    family_name: 'LECLERC',
    code: 'LEC',
    image_url: 'https://example.com/leclerc.png',
    country_code: 'MCO',
    driver_number: 16,
  },
  {
    id: '4',
    full_name: 'Yuki Tsunoda',
    given_name: 'Yuki',
    family_name: 'TSUNODA',
    code: 'TSU',
    image_url: null,
    country_code: 'JPN',
    driver_number: 22,
  },
  {
    id: '5',
    full_name: 'Test Driver',
    given_name: 'Test',
    family_name: 'DRIVER',
    code: 'TDR',
    image_url: 'https://example.com/test.png',
    country_code: 'XXX', // Unknown country code
    driver_number: 99,
  },
];

describe('F1DriversPage Component', () => {
  // Mock Date to ensure consistent year across tests
  const mockDate = new Date('2025-10-19');
  const realDate = Date;

  beforeEach(() => {
    vi.clearAllMocks();
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as any;
  });

  afterEach(() => {
    global.Date = realDate;
    vi.clearAllMocks();
  });

  describe('Unit Tests - Loading States', () => {
    it('should display loading state with racing car emoji', () => {
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: true,
        error: null,
      });

      render(<F1DriversPage />);

      expect(screen.getByText('2025 Drivers')).toBeInTheDocument();
      expect(screen.getByText('Loading drivers...')).toBeInTheDocument();
      expect(screen.getByText('🏎️')).toBeInTheDocument();
    });
  });

  describe('Unit Tests - Error States', () => {
    it('should display error message when error occurs', () => {
      const mockError = new Error('Failed to fetch drivers');
      
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: mockError,
      });

      render(<F1DriversPage />);

      expect(screen.getByText('2025 Drivers')).toBeInTheDocument();
      expect(screen.getByText('Error loading drivers: Failed to fetch drivers')).toBeInTheDocument();
    });

    it('should display error with correct red styling', () => {
      const mockError = new Error('Network error');
      
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: mockError,
      });

      const { container } = render(<F1DriversPage />);
      const errorDiv = container.querySelector('div[style*="color"]');
      
      expect(errorDiv).toHaveStyle({
        textAlign: 'center',
        padding: '4rem',
        color: '#e10600',
      });
    });

    it('should handle error with empty message', () => {
      const mockError = new Error('');
      
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: mockError,
      });

      render(<F1DriversPage />);

      expect(screen.getByText(/Error loading drivers:/)).toBeInTheDocument();
    });
  });

  describe('Unit Tests - DriverCard Component', () => {
    beforeEach(() => {
      mockUseDrivers.mockReturnValue({
        drivers: [mockDrivers[0]], // Single driver for unit testing
        loading: false,
        error: null,
      });
    });

    it('should render driver card with correct information', () => {
      render(<F1DriversPage />);

      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('VERSTAPPEN')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('🇳🇱')).toBeInTheDocument();
    });

    it('should render driver image with correct src and alt', () => {
      render(<F1DriversPage />);

      const image = screen.getByAltText('Max Verstappen');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/verstappen.png');
      expect(image).toHaveClass('driver-image');
    });

    it('should apply correct CSS classes to driver card elements', () => {
      const { container } = render(<F1DriversPage />);

      expect(container.querySelector('.driver-card')).toBeInTheDocument();
      expect(container.querySelector('.driver-card-header')).toBeInTheDocument();
      expect(container.querySelector('.driver-info')).toBeInTheDocument();
      expect(container.querySelector('.driver-first-name')).toBeInTheDocument();
      expect(container.querySelector('.driver-last-name')).toBeInTheDocument();
      expect(container.querySelector('.driver-number')).toBeInTheDocument();
      expect(container.querySelector('.driver-image-container')).toBeInTheDocument();
      expect(container.querySelector('.driver-card-footer')).toBeInTheDocument();
      expect(container.querySelector('.driver-nationality')).toBeInTheDocument();
    });

    it('should apply gradient background to driver card', () => {
      const { container } = render(<F1DriversPage />);

      const driverCard = container.querySelector('.driver-card');
      expect(driverCard).toHaveStyle({
        background: 'linear-gradient(135deg, #e10600 0%, #a10500 50%, #15151e 100%)',
      });
    });

    it('should render card pattern element', () => {
      const { container } = render(<F1DriversPage />);

      expect(container.querySelector('.driver-card-pattern')).toBeInTheDocument();
    });
  });

  describe('Unit Tests - Image Error Handling', () => {

    it('should not render image when image_url is null', () => {
      mockUseDrivers.mockReturnValue({
        drivers: [mockDrivers[3]], // Driver with null image_url
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      expect(screen.queryByAltText('Yuki Tsunoda')).not.toBeInTheDocument();
      expect(screen.getByText('Yuki')).toBeInTheDocument();
      expect(screen.getByText('TSUNODA')).toBeInTheDocument();
    });
  });

  describe('Unit Tests - Country Flags', () => {
    it('should display correct flag emoji for known country codes', () => {
      mockUseDrivers.mockReturnValue({
        drivers: [
          mockDrivers[0], // NLD - 🇳🇱
          mockDrivers[1], // GBR - 🇬🇧
          mockDrivers[2], // MCO - 🇲🇨
        ],
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      expect(screen.getByText('🇳🇱')).toBeInTheDocument();
      expect(screen.getByText('🇬🇧')).toBeInTheDocument();
      expect(screen.getByText('🇲🇨')).toBeInTheDocument();
    });

    it('should display default flag emoji for unknown country code', () => {
      mockUseDrivers.mockReturnValue({
        drivers: [mockDrivers[4]], // XXX - unknown code
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      expect(screen.getByText('🏁')).toBeInTheDocument();
    });

    it('should handle all defined country codes', () => {
      const allCountryCodes = [
        { code: 'NLD', flag: '🇳🇱' },
        { code: 'MEX', flag: '🇲🇽' },
        { code: 'AUS', flag: '🇦🇺' },
        { code: 'ESP', flag: '🇪🇸' },
        { code: 'GER', flag: '🇩🇪' },
        { code: 'CAN', flag: '🇨🇦' },
        { code: 'FRA', flag: '🇫🇷' },
        { code: 'THA', flag: '🇹🇭' },
        { code: 'CHN', flag: '🇨🇳' },
        { code: 'JPN', flag: '🇯🇵' },
        { code: 'FIN', flag: '🇫🇮' },
        { code: 'DNK', flag: '🇩🇰' },
        { code: 'USA', flag: '🇺🇸' },
        { code: 'ITA', flag: '🇮🇹' },
      ];

      allCountryCodes.forEach(({ code, flag }) => {
        const testDriver = {
          ...mockDrivers[0],
          id: code,
          country_code: code,
        };

        mockUseDrivers.mockReturnValue({
          drivers: [testDriver],
          loading: false,
          error: null,
        });

        const { unmount } = render(<F1DriversPage />);
        
        expect(screen.getByText(flag)).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Integration Tests - Full Page Rendering', () => {
    it('should render page with correct title and current year', () => {
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      const title = screen.getByText('2025 Drivers');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('page-main-title');
    });

    it('should render all drivers in grid layout', () => {
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers.slice(0, 3), // 3 drivers
        loading: false,
        error: null,
      });

      const { container } = render(<F1DriversPage />);

      const grid = container.querySelector('.drivers-grid');
      expect(grid).toBeInTheDocument();

      const driverCards = container.querySelectorAll('.driver-card');
      expect(driverCards).toHaveLength(3);
    });

    it('should render correct number of driver cards', () => {
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { container } = render(<F1DriversPage />);

      const driverCards = container.querySelectorAll('.driver-card');
      expect(driverCards).toHaveLength(5);
    });

    it('should maintain unique keys for each driver card', () => {
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      // Check that all driver names are rendered (ensures unique rendering)
      expect(screen.getByText('VERSTAPPEN')).toBeInTheDocument();
      expect(screen.getByText('HAMILTON')).toBeInTheDocument();
      expect(screen.getByText('LECLERC')).toBeInTheDocument();
      expect(screen.getByText('TSUNODA')).toBeInTheDocument();
      expect(screen.getByText('DRIVER')).toBeInTheDocument();
    });

    it('should handle empty drivers array gracefully', () => {
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
      });

      const { container } = render(<F1DriversPage />);

      expect(screen.getByText('2025 Drivers')).toBeInTheDocument();
      expect(container.querySelector('.drivers-grid')).toBeInTheDocument();
      expect(container.querySelectorAll('.driver-card')).toHaveLength(0);
    });

    it('should handle null drivers array gracefully', () => {
      mockUseDrivers.mockReturnValue({
        drivers: null as any,
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      expect(screen.getByText('2025 Drivers')).toBeInTheDocument();
      // Should not crash, page should render without drivers
    });
  });

  describe('Integration Tests - Driver Information Display', () => {
    beforeEach(() => {
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });
    });

    it('should display all driver numbers correctly', () => {
      render(<F1DriversPage />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('44')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('22')).toBeInTheDocument();
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('should display all driver given names correctly', () => {
      render(<F1DriversPage />);

      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Lewis')).toBeInTheDocument();
      expect(screen.getByText('Charles')).toBeInTheDocument();
      expect(screen.getByText('Yuki')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should display all driver family names correctly', () => {
      render(<F1DriversPage />);

      expect(screen.getByText('VERSTAPPEN')).toBeInTheDocument();
      expect(screen.getByText('HAMILTON')).toBeInTheDocument();
      expect(screen.getByText('LECLERC')).toBeInTheDocument();
      expect(screen.getByText('TSUNODA')).toBeInTheDocument();
      expect(screen.getByText('DRIVER')).toBeInTheDocument();
    });

    it('should display correct flag emojis for all drivers', () => {
      render(<F1DriversPage />);

      expect(screen.getByText('🇳🇱')).toBeInTheDocument(); // Netherlands
      expect(screen.getByText('🇬🇧')).toBeInTheDocument(); // Great Britain
      expect(screen.getByText('🇲🇨')).toBeInTheDocument(); // Monaco
      expect(screen.getByText('🇯🇵')).toBeInTheDocument(); // Japan
      expect(screen.getByText('🏁')).toBeInTheDocument(); // Default flag
    });
  });

  describe('Integration Tests - Page Structure', () => {
    it('should have correct overall page structure', () => {
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { container } = render(<F1DriversPage />);

      const page = container.querySelector('.f1-drivers-page');
      expect(page).toBeInTheDocument();

      const title = page?.querySelector('.page-main-title');
      expect(title).toBeInTheDocument();

      const grid = page?.querySelector('.drivers-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should render page container with correct class', () => {
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { container } = render(<F1DriversPage />);

      expect(container.querySelector('.f1-drivers-page')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle driver with very long name', () => {
      const longNameDriver = {
        ...mockDrivers[0],
        given_name: 'VeryLongFirstName',
        family_name: 'VERYLONGLASTNAME',
      };

      mockUseDrivers.mockReturnValue({
        drivers: [longNameDriver],
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      expect(screen.getByText('VeryLongFirstName')).toBeInTheDocument();
      expect(screen.getByText('VERYLONGLASTNAME')).toBeInTheDocument();
    });

    it('should handle driver number 0', () => {
      const zeroNumberDriver = {
        ...mockDrivers[0],
        driver_number: 0,
      };

      mockUseDrivers.mockReturnValue({
        drivers: [zeroNumberDriver],
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle driver with special characters in name', () => {
      const specialCharDriver = {
        ...mockDrivers[0],
        given_name: 'Jean-Éric',
        family_name: 'PÉREZ',
      };

      mockUseDrivers.mockReturnValue({
        drivers: [specialCharDriver],
        loading: false,
        error: null,
      });

      render(<F1DriversPage />);

      expect(screen.getByText('Jean-Éric')).toBeInTheDocument();
      expect(screen.getByText('PÉREZ')).toBeInTheDocument();
    });

    it('should handle transition from loading to loaded state', async () => {
      // Start with loading
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: true,
        error: null,
      });

      const { rerender } = render(<F1DriversPage />);
      expect(screen.getByText('Loading drivers...')).toBeInTheDocument();

      // Update to loaded state
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      rerender(<F1DriversPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading drivers...')).not.toBeInTheDocument();
        expect(screen.getByText('VERSTAPPEN')).toBeInTheDocument();
      });
    });

    it('should handle transition from loaded to error state', async () => {
      // Start with loaded state
      mockUseDrivers.mockReturnValue({
        drivers: mockDrivers,
        loading: false,
        error: null,
      });

      const { rerender } = render(<F1DriversPage />);
      expect(screen.getByText('VERSTAPPEN')).toBeInTheDocument();

      // Update to error state
      mockUseDrivers.mockReturnValue({
        drivers: [],
        loading: false,
        error: new Error('Connection lost'),
      });

      rerender(<F1DriversPage />);

      await waitFor(() => {
        expect(screen.queryByText('VERSTAPPEN')).not.toBeInTheDocument();
        expect(screen.getByText('Error loading drivers: Connection lost')).toBeInTheDocument();
      });
    });
  });
});