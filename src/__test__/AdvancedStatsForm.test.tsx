import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, beforeEach } from "vitest";
import AdvancedStatsForm from "../pages/coachDashboard/matchManaging/PlayerStatsForm/AdvancedStatsForm";

// Mock the child forms
vi.mock("../pages/coachDashboard/matchManaging/PlayerStatsForm/GKStatsForm", () => ({
  default: ({ onSave }: { onSave: Function }) => (
    <button onClick={() => onSave({ saves: 5 })}>GK Save</button>
  ),
}));
vi.mock("../pages/coachDashboard/matchManaging/PlayerStatsForm/MidStatsForm", () => ({
  default: ({ onSave }: { onSave: Function }) => (
    <button onClick={() => onSave({ chancesCreated: 10 })}>Mid Save</button>
  ),
}));
vi.mock("../pages/coachDashboard/matchManaging/PlayerStatsForm/StrStatsForm", () => ({
  default: ({ onSave }: { onSave: Function }) => (
    <button onClick={() => onSave({ goals: 2 })}>Str Save</button>
  ),
}));
vi.mock("../pages/coachDashboard/matchManaging/PlayerStatsForm/DefStatsForm", () => ({
  default: ({ onSave }: { onSave: Function }) => (
    <button onClick={() => onSave({ tackles: 3 })}>Def Save</button>
  ),
}));

describe("AdvancedStatsForm", () => {
  const onSaveMock = vi.fn();

  beforeEach(() => {
    onSaveMock.mockClear();
  });

  // Helper to create a full mock Player object
  const createMockPlayer = (overrides: Partial<any> = {}) => ({
    id: "p1",
    name: "Player",
    teamId: "team1",
    position: "GK",
    jerseyNum: "1",
    imageUrl: "",
    stats: {
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      chancesCreated: 0,
      dribblesAttempted: 0,
      dribblesSuccessful: 0,
      offsides: 0,
      tackles: 0,
      interceptions: 0,
      clearances: 0,
      saves: 0,
      cleansheets: 0,
      savePercentage: 0,
      passCompletion: 0,
      minutesPlayed: 0,
      yellowCards: 0,
      redCards: 0,
      performanceData: [],
    },
    ...overrides,
  });

  it("renders GKStatsForm for GK position", () => {
    const player = createMockPlayer({ id: "p1", name: "Goalie", position: "GK" });
    render(<AdvancedStatsForm player={player} onSave={onSaveMock} />);
    expect(screen.getByText(/Advanced Stats for Goalie/i)).toBeInTheDocument();
    const button = screen.getByText("GK Save");
    fireEvent.click(button);
    expect(onSaveMock).toHaveBeenCalledWith("p1", { saves: 5 });
  });

  it("renders MidStatsForm for midfield positions", () => {
    const player = createMockPlayer({ id: "p2", name: "Midfield", position: "CM" });
    render(<AdvancedStatsForm player={player} onSave={onSaveMock} />);
    const button = screen.getByText("Mid Save");
    fireEvent.click(button);
    expect(onSaveMock).toHaveBeenCalledWith("p2", { chancesCreated: 10 });
  });

  it("renders StrStatsForm for striker positions", () => {
    const player = createMockPlayer({ id: "p3", name: "Striker", position: "ST" });
    render(<AdvancedStatsForm player={player} onSave={onSaveMock} />);
    const button = screen.getByText("Str Save");
    fireEvent.click(button);
    expect(onSaveMock).toHaveBeenCalledWith("p3", { goals: 2 });
  });

  it("renders DefStatsForm for defensive positions", () => {
    const player = createMockPlayer({ id: "p4", name: "Defender", position: "CB" });
    render(<AdvancedStatsForm player={player} onSave={onSaveMock} />);
    const button = screen.getByText("Def Save");
    fireEvent.click(button);
    expect(onSaveMock).toHaveBeenCalledWith("p4", { tackles: 3 });
  });

  it("renders nothing if position is unknown", () => {
    const player = createMockPlayer({ id: "p5", name: "Unknown", position: "XYZ" });
    render(<AdvancedStatsForm player={player} onSave={onSaveMock} />);
    expect(screen.getByText(/Advanced Stats for Unknown/i)).toBeInTheDocument();
    expect(screen.queryByText("GK Save")).not.toBeInTheDocument();
    expect(screen.queryByText("Mid Save")).not.toBeInTheDocument();
    expect(screen.queryByText("Str Save")).not.toBeInTheDocument();
    expect(screen.queryByText("Def Save")).not.toBeInTheDocument();
  });
});
