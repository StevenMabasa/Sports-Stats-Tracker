import { render, screen } from "@testing-library/react";
import TeamShotsChart from "../pages/coachDashboard/coachStatsPage/Charts/TeamShotsChart";
import type { Match } from "../types";
import { vi } from "vitest";

vi.mock("react-chartjs-2", () => ({
  Bar: (props: any) => (
    <div data-testid="bar-chart">
      <div data-testid="labels">{JSON.stringify(props.data.labels)}</div>
      <div data-testid="datasets">
        {props.data.datasets.map((d: any) => d.label).join(", ")}
      </div>
    </div>
  ),
}));

describe("TeamShotsChart", () => {
  const mockMatches: Match[] = [
    { shots: 5, shotsOnTarget: 3 } as Match,
    { shots: 7, shotsOnTarget: 4 } as Match,
  ];

  it("renders dataset labels", () => {
    render(<TeamShotsChart matches={mockMatches} />);
    expect(screen.getByTestId("datasets")).toHaveTextContent("Shots");
    expect(screen.getByTestId("datasets")).toHaveTextContent("Shots on Target");
  });

  it("renders match labels in reverse order", () => {
    render(<TeamShotsChart matches={mockMatches} />);
    expect(screen.getByTestId("labels")).toHaveTextContent(
      JSON.stringify(["Match 2", "Match 1"])
    );
  });

  it("renders safely with no matches", () => {
    render(<TeamShotsChart matches={[]} />);
    expect(screen.getByTestId("labels")).toHaveTextContent("[]");
  });
});
