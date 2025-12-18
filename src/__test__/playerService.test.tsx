import { describe, it, expect, vi, beforeEach } from "vitest";
import * as playerService from "../services/playerService";

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const queryBuilder = {
  select: mockSelect,
  eq: mockEq,
  in: mockIn,
  order: mockOrder,
  limit: mockLimit,
  single: mockSingle,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
};

vi.mock("../../supabaseClient.ts", () => ({
  default: {
    from: vi.fn(() => queryBuilder),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset all query builder methods to return themselves for chaining
  mockSelect.mockReturnValue(queryBuilder);
  mockEq.mockReturnValue(queryBuilder);
  mockIn.mockReturnValue(queryBuilder);
  mockOrder.mockReturnValue(queryBuilder);
  mockLimit.mockReturnValue(queryBuilder);
  mockInsert.mockReturnValue(queryBuilder);
  mockUpdate.mockReturnValue(queryBuilder);
  mockDelete.mockReturnValue(queryBuilder);
});

// --- Mock data ---
const mockPlayer1 = {
  id: "p1",
  team_id: "t1",
  name: "John Doe",
  position: "Forward",
  jersey_num: "10",
  image_url: null,
};

const mockPlayer2 = {
  id: "p2",
  team_id: "t1",
  name: "Jane Doe",
  position: "Midfielder",
  jersey_num: "8",
  image_url: null,
};

describe("playerService full coverage", () => {
  it("fetchPlayers returns players", async () => {
    mockSelect.mockResolvedValueOnce({ data: [mockPlayer1, mockPlayer2], error: null });
    const players = await playerService.fetchPlayers();
    expect(players).toHaveLength(2);
    expect(players[0]).toMatchObject(mockPlayer1);
  });

  it("fetchPlayers returns empty array on error", async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const players = await playerService.fetchPlayers();
    expect(players).toEqual([]);
  });

  it("fetchPlayersWithStats returns [] if no players", async () => {
    mockSelect.mockResolvedValueOnce({ data: [], error: null });
    const result = await playerService.fetchPlayersWithStats("t1");
    expect(result).toEqual([]);
  });

  it("fetchPlayersWithStats returns [] on error", async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const result = await playerService.fetchPlayersWithStats("t1");
    expect(result).toEqual([]);
  });

  it("fetchPlayerStats returns null if no data", async () => {
    mockSelect.mockResolvedValueOnce({ data: [], error: null });
    const stats = await playerService.fetchPlayerStats("p1");
    expect(stats).toBeNull();
  });

  it("fetchPlayerStats returns null on error", async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const stats = await playerService.fetchPlayerStats("p1");
    expect(stats).toBeNull();
  });

  it("fetchAggregatedStatsForPlayers returns {} if no ids", async () => {
    const result = await playerService.fetchAggregatedStatsForPlayers([]);
    expect(result).toEqual({});
  });

  it("fetchAggregatedStatsForPlayers returns {} on error", async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const result = await playerService.fetchAggregatedStatsForPlayers(["p1"]);
    expect(result).toEqual({});
  });

  it("fetchPlayerStatsByMatch returns [] on error", async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const result = await playerService.fetchPlayerStatsByMatch("p1");
    expect(result).toEqual([]);
  });

  it("createPlayer returns null on error", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("fail") });

    const id = await playerService.createPlayer({
      team_id: "t1",
      name: "New Player",
      position: "Midfielder",
      jersey_num: "8",
      image_url: null,
    });

    expect(id).toBeNull();
  });

  it("updatePlayer returns true on success", async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    const ok = await playerService.updatePlayer("p1", { name: "Updated" });
    expect(ok).toBe(true);
  });

  it("updatePlayer returns false on error", async () => {
    mockEq.mockResolvedValueOnce({ error: new Error("fail") });

    const ok = await playerService.updatePlayer("p1", { name: "Updated" });
    expect(ok).toBe(false);
  });

  it("deletePlayer returns true on success", async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    const ok = await playerService.deletePlayer("p1");
    expect(ok).toBe(true);
  });

  it("deletePlayer returns false on error", async () => {
    mockEq.mockResolvedValueOnce({ error: new Error("fail") });

    const ok = await playerService.deletePlayer("p1");
    expect(ok).toBe(false);
  });

  it("fetchPlayerStats calculates totals and averages correctly", async () => {
    const mockStats = [
      { 
        goals: 2, assists: 1, shots: 5, shots_on_target: 3, chances_created: 2, 
        dribbles_attempted: 1, dribbles_successful: 1, offsides: 0, tackles: 2, 
        interceptions: 1, clearances: 0, saves: 0, clean_sheets: 0, pass_completion: 80, 
        minutes_played: 90, yellow_cards: 0, red_cards: 0, player_id: "p1" 
      },
      { 
        goals: 1, assists: 0, shots: 3, shots_on_target: 1, chances_created: 1, 
        dribbles_attempted: 0, dribbles_successful: 0, offsides: 0, tackles: 1, 
        interceptions: 0, clearances: 0, saves: 0, clean_sheets: 0, pass_completion: 70, 
        minutes_played: 80, yellow_cards: 1, red_cards: 0, player_id: "p1" 
      },
    ];

    mockOrder.mockResolvedValueOnce({ data: mockStats, error: null });

    const result = await playerService.fetchPlayerStats("p1");
    
    expect(result).not.toBeNull();
    expect(result!.goals).toBe(3);
    expect(result!.assists).toBe(1);
    expect(result!.shots).toBe(8);
    expect(result!.passCompletion).toBeCloseTo((80 + 70) / 2);
    expect(result!.performanceData).toEqual([0, 0, 0, 1, 2]);
  });

  it("fetchPlayersWithStats returns players with default stats if no stats found", async () => {

    mockEq.mockResolvedValueOnce({ data: [mockPlayer1], error: null });
    mockIn.mockResolvedValueOnce({ data: [], error: null });
    
    const result = await playerService.fetchPlayersWithStats("t1");
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p1");
    expect(result[0].stats.goals).toBe(0);
    expect(result[0].stats.performanceData).toEqual([0, 0, 0, 0, 0]);
  });

  it("fetchAggregatedStatsForPlayers aggregates stats correctly for multiple players", async () => {
    const mockStatsData = [
      { player_id: "p1", goals: 1, assists: 0, shots: 2, shots_on_target: 1, chances_created: 0, dribbles_attempted: 0, dribbles_successful: 0, offsides: 0, tackles: 1, interceptions: 0, clearances: 0, saves: 0, clean_sheets: 0, pass_completion: 85, minutes_played: 90, yellow_cards: 0, red_cards: 0 },
      { player_id: "p2", goals: 2, assists: 1, shots: 4, shots_on_target: 2, chances_created: 1, dribbles_attempted: 1, dribbles_successful: 1, offsides: 0, tackles: 2, interceptions: 1, clearances: 0, saves: 0, clean_sheets: 0, pass_completion: 90, minutes_played: 90, yellow_cards: 0, red_cards: 0 }
    ];

    mockIn.mockResolvedValueOnce({ data: mockStatsData, error: null });

    const result = await playerService.fetchAggregatedStatsForPlayers(["p1", "p2"]);
    
    expect(result["p1"]).toBeDefined();
    expect(result["p2"]).toBeDefined();
    expect(result["p1"].goals).toBe(1);
    expect(result["p2"].goals).toBe(2);
    expect(result["p1"].assists).toBe(0);
    expect(result["p2"].assists).toBe(1);
  });
});