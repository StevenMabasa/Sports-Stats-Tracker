import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTeamData } from "../pages/coachDashboard/hooks/useTeamData";
import * as teamService from "../services/teamService";

vi.mock("../services/teamService", () => ({
  getCurrentTeamId: vi.fn(),
  fetchTeamById: vi.fn(),
}));

describe("useTeamData hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading = true", () => {
    (teamService.getCurrentTeamId as any).mockReturnValue("team-123");
    (teamService.fetchTeamById as any).mockResolvedValue(null);

    const { result } = renderHook(() => useTeamData());
    expect(result.current.isLoading).toBe(true);
  });

  it("sets error if no teamId is found", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue(null);

    const { result } = renderHook(() => useTeamData());

    await waitFor(() => {
      expect(result.current.error).toMatch(/No team found/i);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.team).toBeNull();
    });
  });

  it("sets error if fetchTeamById returns null", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue("team-123");
    (teamService.fetchTeamById as any).mockResolvedValue(null);

    const { result } = renderHook(() => useTeamData());

    await waitFor(() => {
      expect(result.current.error).toMatch(/Team not found/i);
      expect(result.current.team).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("returns valid team when data is found", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue("team-123");
    (teamService.fetchTeamById as any).mockResolvedValue({
      id: "team-123",
      name: "Kaizer Chiefs",
      coach_id: "coach-1",
    });

    const { result } = renderHook(() => useTeamData());

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.team).toEqual({
        id: "team-123",
        name: "Kaizer Chiefs",
        coachId: "coach-1",
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("handles fetch error gracefully", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue("team-123");
    (teamService.fetchTeamById as any).mockRejectedValue(new Error("DB down"));

    const { result } = renderHook(() => useTeamData());

    await waitFor(() => {
      expect(result.current.error).toMatch(/Failed to load team data/i);
      expect(result.current.team).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
