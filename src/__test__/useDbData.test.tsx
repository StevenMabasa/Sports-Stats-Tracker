import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useDbData } from "../pages/userDashboard/hooks/useDbData";
import * as matchService from "../services/matchService";
import * as playerService from "../services/playerService";
import * as teamService from "../services/teamService";

vi.mock("../services/matchService");
vi.mock("../services/playerService");
vi.mock("../services/teamService");

describe("useDbData hook", () => {
  const mockMatches = [
    { id: "m1", teamId: "t1", opponentName: "Team B", teamScore: 2, opponentScore: 1, date: "2025-09-16", status: "completed" },
  ];

  const mockPlayers = [
    { id: "p1", team_id: "t1", name: "John Doe", position: "Forward" },
  ];

  const mockTeams = [
    { id: "t1", name: "Team A" },
  ];

  const mockAggregatedStats = {
    p1: { goals: 3, assists: 1, minutesPlayed: 90 },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches and maps data correctly", async () => {
    (matchService.fetchMatches as any).mockResolvedValue(mockMatches);
    (playerService.fetchPlayers as any).mockResolvedValue(mockPlayers);
    (playerService.fetchAggregatedStatsForPlayers as any).mockResolvedValue(mockAggregatedStats);
    (teamService.fetchTeamById as any).mockImplementation((id: string) => {
      return Promise.resolve(mockTeams.find(t => t.id === id));
    });

    const { result } = renderHook(() => useDbData());

    // wait for loading to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    // validate derived data
    expect(result.current.teams).toHaveLength(2);
    expect(result.current.players).toHaveLength(1);
    expect(result.current.matches).toHaveLength(1);

    const player = result.current.players[0];
    expect(player.stats.goals).toBe(3);
    expect(player.stats.assists).toBe(1);
    expect(player.stats.minutesPlayed).toBe(90);

    const match = result.current.matches[0];
    expect(match.homeTeamId).toBe("t1");
    expect(match.awayTeamId).toBe("opponent:Team B");
    expect(match.status).toBe("finished");
  });

  it("handles errors correctly", async () => {
    (matchService.fetchMatches as any).mockRejectedValue(new Error("Failed to fetch matches"));
    (playerService.fetchPlayers as any).mockResolvedValue(mockPlayers);

    const { result } = renderHook(() => useDbData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch matches");
    expect(result.current.teams).toHaveLength(0);
    expect(result.current.players).toHaveLength(0);
    expect(result.current.matches).toHaveLength(0);
  });
});
