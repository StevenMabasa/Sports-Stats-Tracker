import { describe, it, expect, vi, beforeEach } from "vitest";
import {saveLineup, loadLineup, updatePlayerPosition, addPlayerToLineup, removePlayerFromLineup, debugLineup, type LineupPlayer, type DbLineupRecord,
} from "../services/lineupService";

// --- Mock supabaseClient ---
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../supabaseClient", () => {
  const mockFrom = vi.fn(() => ({
    select: mockSelect.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    order: mockOrder,
    insert: mockInsert,
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
  }));

  return { default: { from: mockFrom } };
});

import supabase from "../../supabaseClient";

describe("lineupService", () => {
  const teamId = "team1";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock chainable methods
    mockDelete.mockReturnThis();
    mockEq.mockReturnThis();
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockInsert.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ id: "1" }], error: null }),
    });
    mockUpdate.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ id: "1" }], error: null }),
    });
  });

  // --- saveLineup tests ---
  it("saveLineup deletes old lineup and inserts new lineup", async () => {
    const lineup: LineupPlayer[] = [
      { playerId: "p1", positionX: 10, positionY: 20 },
      { playerId: "p2", positionX: 30, positionY: 40 },
    ];

    // Mock successful delete
    mockEq.mockResolvedValueOnce({ data: null, error: null });

    const result = await saveLineup(teamId, lineup);
    expect(result).toBe(true);

    expect(supabase.from).toHaveBeenCalledWith("lineups");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("team_id", teamId);
    expect(mockInsert).toHaveBeenCalledWith([
      { team_id: teamId, player_id: "p1", position_x: 10, position_y: 20 },
      { team_id: teamId, player_id: "p2", position_x: 30, position_y: 40 },
    ]);
  });

  it("saveLineup handles delete error", async () => {
    const lineup: LineupPlayer[] = [
      { playerId: "p1", positionX: 10, positionY: 20 },
    ];

    // Mock delete error
    mockEq.mockResolvedValueOnce({ data: null, error: new Error("Delete failed") });

    const result = await saveLineup(teamId, lineup);
    expect(result).toBe(false);
  });

  it("saveLineup returns true for empty lineup after successful delete", async () => {
    const lineup: LineupPlayer[] = [];

    // Mock successful delete
    mockEq.mockResolvedValueOnce({ data: null, error: null });

    const result = await saveLineup(teamId, lineup);
    expect(result).toBe(true);

    expect(mockDelete).toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("saveLineup handles insert error", async () => {
    const lineup: LineupPlayer[] = [
      { playerId: "p1", positionX: 10, positionY: 20 },
    ];

    // Mock successful delete but failed insert
    mockEq.mockResolvedValueOnce({ data: null, error: null });
    mockInsert.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: new Error("Insert failed") }),
    });

    const result = await saveLineup(teamId, lineup);
    expect(result).toBe(false);
  });

  it("saveLineup handles unexpected error", async () => {
    const lineup: LineupPlayer[] = [
      { playerId: "p1", positionX: 10, positionY: 20 },
    ];

    // Mock throwing an exception
    mockEq.mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    const result = await saveLineup(teamId, lineup);
    expect(result).toBe(false);
  });

  // --- loadLineup tests ---
  it("loadLineup returns lineup players", async () => {
    const fakeData: DbLineupRecord[] = [
      { id: "1", team_id: teamId, player_id: "p1", position_x: 10, position_y: 20, created_at: "", updated_at: "" },
    ];

    mockOrder.mockResolvedValueOnce({ data: fakeData, error: null });

    const result = await loadLineup(teamId);
    expect(result).toEqual([{ playerId: "p1", positionX: 10, positionY: 20 }]);
  });

  it("loadLineup handles database error", async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error("Database error") });

    const result = await loadLineup(teamId);
    expect(result).toEqual([]);
  });

  it("loadLineup handles null data", async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: null });

    const result = await loadLineup(teamId);
    expect(result).toEqual([]);
  });

  it("loadLineup handles unexpected error", async () => {
    mockOrder.mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    const result = await loadLineup(teamId);
    expect(result).toEqual([]);
  });

  // --- updatePlayerPosition tests ---
  it("updatePlayerPosition calls supabase.update and returns true", async () => {
    const result = await updatePlayerPosition(teamId, "p1", 50, 60);
    expect(result).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ position_x: 50, position_y: 60 }));
    expect(mockEq).toHaveBeenCalledWith("team_id", teamId);
    expect(mockEq).toHaveBeenCalledWith("player_id", "p1");
  });

  it("updatePlayerPosition handles unexpected error", async () => {
    mockUpdate.mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    const result = await updatePlayerPosition(teamId, "p1", 50, 60);
    expect(result).toBe(false);
  });

  // --- addPlayerToLineup tests ---
  it("addPlayerToLineup inserts a new player", async () => {
    const result = await addPlayerToLineup(teamId, "p3", 15, 25);
    expect(result).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({ team_id: teamId, player_id: "p3", position_x: 15, position_y: 25 });
  });

  it("addPlayerToLineup handles database error", async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: new Error("Insert failed") }),
    });

    const result = await addPlayerToLineup(teamId, "p3", 15, 25);
    expect(result).toBe(false);
  });

  it("addPlayerToLineup handles unexpected error", async () => {
    mockInsert.mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    const result = await addPlayerToLineup(teamId, "p3", 15, 25);
    expect(result).toBe(false);
  });

  // --- removePlayerFromLineup tests ---
  it("removePlayerFromLineup deletes a player", async () => {
    mockDelete.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [{ id: "1" }], error: null }),
        }),
      }),
    });

    const result = await removePlayerFromLineup(teamId, "p1");
    expect(result).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });

  it("removePlayerFromLineup handles unexpected error", async () => {
    mockDelete.mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    const result = await removePlayerFromLineup(teamId, "p1");
    expect(result).toBe(false);
  });

  it("debugLineup handles database error", async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: new Error("Database error") });

    // Should not throw even with database error
    await expect(debugLineup(teamId)).resolves.toBeUndefined();
  });

  it("debugLineup handles unexpected error", async () => {
    mockEq.mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    // Should not throw even with unexpected error
    await expect(debugLineup(teamId)).resolves.toBeUndefined();
  });
});