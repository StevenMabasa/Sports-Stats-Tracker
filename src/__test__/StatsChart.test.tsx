import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StatsChart from '../pages/coachDashboard/playerManagement/StatsChart'
import '@testing-library/jest-dom';


// Mock Recharts components since they use canvas/SVG which can be complex to test
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>
      {children}
    </div>
  ),
  BarChart: ({ children, data, ...props }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} {...props}>
      {children}
    </div>
  ),
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
}));

describe('StatsChart', () => {
  const mockData = [10, 25, 15, 30, 20];

  it('renders without crashing', () => {
    render(<StatsChart data={mockData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders all chart components', () => {
    render(<StatsChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  it('passes correct data to BarChart', () => {
    render(<StatsChart data={mockData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toHaveLength(5);
    expect(chartData[0]).toEqual({ name: 'M1', value: 10 });
    expect(chartData[1]).toEqual({ name: 'M2', value: 25 });
    expect(chartData[2]).toEqual({ name: 'M3', value: 15 });
    expect(chartData[3]).toEqual({ name: 'M4', value: 30 });
    expect(chartData[4]).toEqual({ name: 'M5', value: 20 });
  });

  it('handles empty data array', () => {
    render(<StatsChart data={[]} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toHaveLength(0);
  });

  it('handles single data point', () => {
    render(<StatsChart data={[42]} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toHaveLength(1);
    expect(chartData[0]).toEqual({ name: 'M1', value: 42 });
  });

  it('handles zero and negative values', () => {
    const dataWithZeroAndNegative = [0, -5, 10];
    render(<StatsChart data={dataWithZeroAndNegative} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toEqual([
      { name: 'M1', value: 0 },
      { name: 'M2', value: -5 },
      { name: 'M3', value: 10 }
    ]);
  });

  it('sets correct ResponsiveContainer dimensions', () => {
    render(<StatsChart data={mockData} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveAttribute('width', '100%');
    expect(container).toHaveAttribute('height', '250');
  });

  it('configures Bar with correct fill color', () => {
    render(<StatsChart data={mockData} />);
    
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveAttribute('dataKey', 'value');
    expect(bar).toHaveAttribute('fill', '#0b63d8');
  });

  it('configures XAxis with correct dataKey', () => {
    render(<StatsChart data={mockData} />);
    
    const xAxis = screen.getByTestId('x-axis');
    expect(xAxis).toHaveAttribute('dataKey', 'name');
  });

  describe('data transformation', () => {
    it('transforms numeric data to chart format correctly', () => {
      const testData = [100, 200, 300];
      render(<StatsChart data={testData} />);
      
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
      
      expect(chartData).toEqual([
        { name: 'M1', value: 100 },
        { name: 'M2', value: 200 },
        { name: 'M3', value: 300 }
      ]);
    });

    it('generates correct month labels for large datasets', () => {
      const largeData = Array.from({ length: 12 }, (_, i) => i * 10);
      render(<StatsChart data={largeData} />);
      
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
      
      expect(chartData).toHaveLength(12);
      expect(chartData[0].name).toBe('M1');
      expect(chartData[11].name).toBe('M12');
    });
  });

  describe('component integration', () => {
    it('renders with TypeScript Props interface correctly', () => {
      // This test ensures the component accepts the Props interface correctly
      const props = { data: [1, 2, 3] };
      expect(() => render(<StatsChart {...props} />)).not.toThrow();
    });

    it('maintains component structure when re-rendered with new data', () => {
      const { rerender } = render(<StatsChart data={[1, 2, 3]} />);
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      
      rerender(<StatsChart data={[4, 5, 6, 7]} />);
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
      expect(chartData).toHaveLength(4);
    });
  });
});