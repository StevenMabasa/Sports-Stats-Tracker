import { render, screen } from "@testing-library/react";
import TeamPerformanceChart from "../pages/coachDashboard/coachStatsPage/TeamPerformanceChart";
import type { Match } from "../types";
import { vi } from "vitest";

// Mock Recharts
vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive">{children}</div>
    ),
    LineChart: ({ data, children }: any) => (
      <div data-testid="line-chart">
        <div data-testid="data">{JSON.stringify(data)}</div>
        {children}
      </div>
    ),
    Line: ({ dataKey }: any) => <div data-testid={`line-${dataKey}`} />,
    XAxis: ({ dataKey }: any) => <div data-testid={`xaxis-${dataKey}`} />,
    YAxis: () => <div data-testid="yaxis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    CartesianGrid: () => <div data-testid="grid" />,
    Legend: () => <div data-testid="legend" />,
  };
});

describe("TeamPerformanceChart", () => {
  const mockMatches: Match[] = [
    { teamScore: 2, opponentScore: 1 } as Match,
    { teamScore: 3, opponentScore: 2 } as Match,
  ];

  it("renders chart with reversed match data", () => {
    render(<TeamPerformanceChart matches={mockMatches} />);
    const data = JSON.parse(screen.getByTestId("data").textContent || "[]");

    // Should be reversed
    expect(data[0].name).toBe("Match 2");
    expect(data[1].name).toBe("Match 1");

    // Should map scores
    expect(data[0].Goals_For).toBe(3);
    expect(data[0].Goals_Against).toBe(2);
  });

  it("renders lines for goals for and against", () => {
    render(<TeamPerformanceChart matches={mockMatches} />);
    expect(screen.getByTestId("line-Goals_For")).toBeInTheDocument();
    expect(screen.getByTestId("line-Goals_Against")).toBeInTheDocument();
  });

  it("renders safely with no matches", () => {
    render(<TeamPerformanceChart matches={[]} />);
    const data = JSON.parse(screen.getByTestId("data").textContent || "[]");
    expect(data).toEqual([]);
  });
});
