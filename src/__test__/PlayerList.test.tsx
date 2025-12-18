import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlayersList from "../pages/userDashboard/PlayersList";
import { BrowserRouter } from "react-router-dom";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (ui: React.ReactNode) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("PlayersList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const players = [
    { id: "p1", name: "Player One", teamId: "t1", position: "Forward", stats: { goals: 5, assists: 3, minutesPlayed: 450 } },
    { id: "p2", name: "Player Two", teamId: "t2", position: "Midfielder", stats: { goals: 2, assists: 4, minutesPlayed: 400 } },
  ];

  const teams = [
    { id: "t1", name: "Team A" },
    { id: "t2", name: "Team B" },
  ];

  it("renders players with their stats and team", () => {
    renderWithRouter(<PlayersList players={players} teams={teams} />);

    // Check player names and positions
    expect(screen.getByText(/Player One/i)).toBeInTheDocument();
    expect(screen.getByText(/Forward/i)).toBeInTheDocument();
    expect(screen.getByText(/Player Two/i)).toBeInTheDocument();
    expect(screen.getByText(/Midfielder/i)).toBeInTheDocument();

    // Check team names
    expect(screen.getByText(/Team: Team A/i)).toBeInTheDocument();
    expect(screen.getByText(/Team: Team B/i)).toBeInTheDocument();

    // Check goals and assists
    expect(screen.getByText(/G 5 • A 3/i)).toBeInTheDocument();
    expect(screen.getByText(/G 2 • A 4/i)).toBeInTheDocument();
  });

  it("navigates to player details when clicked", () => {
    renderWithRouter(<PlayersList players={players} teams={teams} />);

    const playerOneDiv = screen.getByText(/Player One/i).closest("div.rs-player");
    expect(playerOneDiv).toBeTruthy();

    if (playerOneDiv) {
      fireEvent.click(playerOneDiv);
      expect(mockNavigate).toHaveBeenCalledWith("/players/p1");
    }

    const playerTwoDiv = screen.getByText(/Player Two/i).closest("div.rs-player");
    expect(playerTwoDiv).toBeTruthy();

    if (playerTwoDiv) {
      fireEvent.click(playerTwoDiv);
      expect(mockNavigate).toHaveBeenCalledWith("/players/p2");
    }
  });

  it("shows teamId if team not found", () => {
    const unknownTeamPlayer = [{ id: "p3", name: "Unknown Player", teamId: "tX", position: "Defender", stats: { goals: 0, assists: 1, minutesPlayed: 90 } }];
    renderWithRouter(<PlayersList players={unknownTeamPlayer} teams={teams} />);
    expect(screen.getByText(/Team: tX/i)).toBeInTheDocument();
  });
});
