import { renderHook, act } from "@testing-library/react";
import { useFavoriteTeams } from "../pages/userDashboard/hooks/useFavorites";
import * as favoritesService from "../services/favoritesService";
import supabase from "../../supabaseClient";
import { vi } from "vitest";

vi.mock("../../supabaseClient");
vi.mock("../services/favoritesService");

describe("useFavoriteTeams hook", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    process.env.VITE_SUPABASE_URL = "mock-url";
    process.env.VITE_SUPABASE_ANON_KEY = "mock-key";
    
    // Default supabase mocks
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null })
    });
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });
    (favoritesService.fetchUserFavorites as any).mockResolvedValue([]);
  });

  it("loads favorites from localStorage if no credentials", async () => {
    process.env.VITE_SUPABASE_URL = "";
    localStorage.setItem("rs_favorite_teams_v1", JSON.stringify(["team1"]));

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    expect(result.current.favoriteTeamIds).toEqual(["team1"]);
    expect(result.current.loading).toBe(false);
  });

  it("isFavorite returns correct value", async () => {
    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => result.current.toggleFavorite("team1"));
    expect(result.current.isFavorite("team1")).toBe(true);

    await act(async () => result.current.toggleFavorite("team1"));
    expect(result.current.isFavorite("team1")).toBe(false);
  });

  it("toggleFavorite updates localStorage without credentials", async () => {
    process.env.VITE_SUPABASE_URL = "";
    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => result.current.toggleFavorite("team1"));

    expect(JSON.parse(localStorage.getItem("rs_favorite_teams_v1")!)).toEqual(["team1"]);
  });

  it("loads favorites from database when user is authenticated", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    (favoritesService.fetchUserFavorites as any).mockResolvedValue(["team1", "team2"]);

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    expect(favoritesService.fetchUserFavorites).toHaveBeenCalledWith("user1");
    expect(result.current.favoriteTeamIds).toEqual(["team1", "team2"]);
    expect(result.current.loading).toBe(false);
  });

  it("creates user profile if it doesn't exist", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    
    // Mock profile doesn't exist
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null })
    });

    renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    expect(supabase.from).toHaveBeenCalledWith('user_profiles');
  });

  it("handles error when checking user profile", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    
    // Mock error when checking profile
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error("DB Error") }),
      insert: vi.fn().mockResolvedValue({ error: null })
    });

    localStorage.setItem("rs_favorite_teams_v1", JSON.stringify(["team1"]));

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    // Should fallback to localStorage
    expect(result.current.favoriteTeamIds).toEqual(["team1"]);
  });

  it("handles error when creating user profile", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    
    // Mock profile creation error
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: new Error("Create Error") })
    });

    localStorage.setItem("rs_favorite_teams_v1", JSON.stringify(["team1"]));

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    // Should fallback to localStorage
    expect(result.current.favoriteTeamIds).toEqual(["team1"]);
  });

  it("toggleFavorite calls addFavorite/removeFavorite with credentials", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    (favoritesService.addFavorite as any).mockResolvedValue(true);
    (favoritesService.removeFavorite as any).mockResolvedValue(true);
    
    // Mock existing profile
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "user1" }, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null })
    });

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    await act(async () => result.current.toggleFavorite("team1"));
    expect(favoritesService.addFavorite).toHaveBeenCalledWith("user1", "team1");
    expect(result.current.favoriteTeamIds).toContain("team1");

    await act(async () => result.current.toggleFavorite("team1"));
    expect(favoritesService.removeFavorite).toHaveBeenCalledWith("user1", "team1");
    expect(result.current.favoriteTeamIds).not.toContain("team1");
  });

  it("falls back to localStorage if database operation fails", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    (favoritesService.addFavorite as any).mockResolvedValue(false);
    
    // Mock existing profile
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "user1" }, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null })
    });

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    await act(async () => result.current.toggleFavorite("team1"));
    
    // Should not update state if database operation failed
    expect(result.current.favoriteTeamIds).not.toContain("team1");
  });

  it("falls back to localStorage if ensureUserProfile fails during toggle", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    
    // Mock profile check failure
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error("DB Error") }),
      insert: vi.fn().mockResolvedValue({ error: null })
    });

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    await act(async () => result.current.toggleFavorite("team1"));
    
    expect(result.current.favoriteTeamIds).toContain("team1");
    expect(JSON.parse(localStorage.getItem("rs_favorite_teams_v1")!)).toContain("team1");
  });

  it("handles error during auth.getUser()", async () => {
    (supabase.auth.getUser as any).mockRejectedValue(new Error("Auth Error"));
    localStorage.setItem("rs_favorite_teams_v1", JSON.stringify(["team1"]));

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    // Should fallback to localStorage
    expect(result.current.favoriteTeamIds).toEqual(["team1"]);
    expect(result.current.loading).toBe(false);
  });

  it("handles error during toggleFavorite with database operations", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    (favoritesService.addFavorite as any).mockRejectedValue(new Error("Service Error"));
    
    // Mock existing profile
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "user1" }, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null })
    });

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    await act(async () => result.current.toggleFavorite("team1"));
    
    // Should fallback to localStorage on error
    expect(result.current.favoriteTeamIds).toContain("team1");
    expect(JSON.parse(localStorage.getItem("rs_favorite_teams_v1")!)).toContain("team1");
  });

  it("handles invalid JSON in localStorage", async () => {
    localStorage.setItem("rs_favorite_teams_v1", "invalid-json");
    process.env.VITE_SUPABASE_URL = "";

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    expect(result.current.favoriteTeamIds).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("handles missing Supabase key", async () => {
    process.env.VITE_SUPABASE_ANON_KEY = "";
    localStorage.setItem("rs_favorite_teams_v1", JSON.stringify(["team1"]));

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    expect(result.current.favoriteTeamIds).toEqual(["team1"]);
  });

  it("handles exception in ensureUserProfile", async () => {
    const mockUser = { id: "user1" };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
    
    // Mock exception in supabase call
    (supabase.from as any).mockImplementation(() => {
      throw new Error("Supabase Exception");
    });

    localStorage.setItem("rs_favorite_teams_v1", JSON.stringify(["team1"]));

    const { result } = renderHook(() => useFavoriteTeams());

    await act(async () => Promise.resolve());

    // Should fallback to localStorage
    expect(result.current.favoriteTeamIds).toEqual(["team1"]);
  });
});