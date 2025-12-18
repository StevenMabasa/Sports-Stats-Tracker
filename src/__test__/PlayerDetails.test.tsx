import { render, screen } from "@testing-library/react";
import PlayerDetails from "../pages/userDashboard/PlayerDetails";
import { fetchPlayerStatsByMatch, fetchPlayers } from "../services/playerService";
import { fetchMatches } from "../services/matchService";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock all service modules
vi.mock("../services/playerService");
vi.mock("../services/matchService");
vi.mock("../services/teamService");

const renderWithRouter = (playerId = "p1") =>
  render(
    <MemoryRouter initialEntries={[`/player/${playerId}`]}>
      <Routes>
        <Route path="/player/:playerId" element={<PlayerDetails onBack={() => {}} />} />
      </Routes>
    </MemoryRouter>
  );

describe("PlayerDetails - UI Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    (fetchPlayerStatsByMatch as any).mockResolvedValueOnce([]);
    (fetchPlayers as any).mockResolvedValueOnce([]);
    (fetchMatches as any).mockResolvedValueOnce([]);

    renderWithRouter();
    expect(screen.getByText(/Loading player statistics/i)).toBeInTheDocument();
  });

  it("renders error state when service throws", async () => {
    (fetchPlayerStatsByMatch as any).mockRejectedValueOnce(new Error("Boom"));

    renderWithRouter();

    expect(await screen.findByText(/Error Loading Player Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load player data/i)).toBeInTheDocument();
  });

  it("renders no stats state when stats are empty", async () => {
    (fetchPlayerStatsByMatch as any).mockResolvedValueOnce([]);
    (fetchPlayers as any).mockResolvedValueOnce([]);
    (fetchMatches as any).mockResolvedValueOnce([]);

    renderWithRouter();
    expect(await screen.findByText(/No statistics found for this player/i)).toBeInTheDocument();
  });

//   it("renders player details with stats", async () => {
//     (fetchPlayerStatsByMatch as any).mockResolvedValueOnce([
//       {
//         id: "s1",
//         match_id: "m1",
//         goals: 2,
//         assists: 1,
//         minutes_played: 90,
//         yellow_cards: 1,
//         red_cards: 0,
//         shots: 3,
//         shots_on_target: 2,
//         pass_completion: 80,
//         tackles: 1,
//         chances_created: 2,
//         dribbles_successful: 3,
//         dribbles_attempted: 4,
//         offsides: 0,
//         interceptions: 1,
//         clearances: 1,
//         saves: 0,
//         clean_sheets: 0,
//       },
//     ]);

//     (fetchPlayers as any).mockResolvedValueOnce([
//       { id: "p1", name: "John Doe", position: "Forward", team_id: "t1" },
//     ]);

//     (fetchMatches as any).mockResolvedValueOnce([
//       {
//         id: "m1",
//         date: "2023-01-01",
//         opponentName: "Team B",
//         teamScore: 3,
//         opponentScore: 1,
//         teamId: "t1",
//       },
//     ]);

//     (fetchTeamById as any).mockResolvedValueOnce({ id: "t1", name: "Dream FC" });

//     renderWithRouter();

//     // Wait for the player name to appear
//     expect(await screen.findByRole("heading", { name: /john doe/i })).toBeInTheDocument();
//     expect(screen.getByText(/Forward • Dream FC/i)).toBeInTheDocument();
//     expect(screen.getByText("2")).toBeInTheDocument(); // goals
//     expect(screen.getByText("1")).toBeInTheDocument(); // assists
//   });
});
