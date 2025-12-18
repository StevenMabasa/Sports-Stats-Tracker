import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MatchDetail from "../pages/userDashboard/MatchDetail";
import type { UiMatch, UiTeam, UiPlayer } from "../pages/userDashboard/hooks/useDbData";

const mockMatch: UiMatch = {
  id: "m1",
  date: "2024-09-10",
  status: "finished",
  homeScore: 2,
  awayScore: 1,
  homeTeamId: "t1",
  awayTeamId: "t2",
};


const homeTeam: UiTeam = { id: "t1", name: "Barcelona" };
const awayTeam: UiTeam = { id: "t2", name: "Real Madrid" };

const players: UiPlayer[] = [
  { id: "p1", name: "Messi", position: "FW", teamId: "t1", stats: {
      goals: 1,
      assists: 0,
      minutesPlayed: 0
  } },
  { id: "p2", name: "Xavi", position: "MF", teamId: "t1", stats: {
      goals: 0,
      assists: 0,
      minutesPlayed: 0
  } },
  { id: "p3", name: "Ronaldo", position: "FW", teamId: "t2", stats: {
      goals: 1,
      assists: 0,
      minutesPlayed: 0
  } },
];

describe("MatchDetail", () => {
  it("renders null when match is not provided", () => {
    const { container } = render(
      <MatchDetail match={undefined as unknown as UiMatch} players={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders match header correctly", () => {
    render(<MatchDetail match={mockMatch} homeTeam={homeTeam} awayTeam={awayTeam} players={players} />);
    
    expect(screen.getByText("Barcelona vs Real Madrid")).toBeInTheDocument();
    expect(screen.getByText("2024-09-10 • finished")).toBeInTheDocument();
    expect(screen.getByText("2 - 1")).toBeInTheDocument();
  });

  it("renders home team players", () => {
    render(<MatchDetail match={mockMatch} homeTeam={homeTeam} awayTeam={awayTeam} players={players} />);
    
    expect(screen.getByText("Messi • FW • ⚽ 1")).toBeInTheDocument();
    expect(screen.getByText("Xavi • MF • ⚽ 0")).toBeInTheDocument();
  });

  it("renders away team players", () => {
    render(<MatchDetail match={mockMatch} homeTeam={homeTeam} awayTeam={awayTeam} players={players} />);
    
    expect(screen.getByText("Ronaldo • FW • ⚽ 1")).toBeInTheDocument();
  });


  it("renders no players if team has none", () => {
    const noPlayerMatch = { ...mockMatch, homeTeamId: "t1", awayTeamId: "t2" };
    render(<MatchDetail match={noPlayerMatch} homeTeam={homeTeam} awayTeam={awayTeam} players={[]} />);
    
    // Still shows teams and score
    expect(screen.getByText("Barcelona vs Real Madrid")).toBeInTheDocument();
    expect(screen.getByText("2 - 1")).toBeInTheDocument();
  });
});
