import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TeamSetup from "../pages/TeamSetup";
import * as teamService from "../services/teamService";
import supabase from "../../supabaseClient";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/teamService", () => ({
  createTeam: vi.fn(),
  fetchTeamById: vi.fn(),
  slugify: vi.fn((name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')),
}));

vi.mock("../../supabaseClient", () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({}),
  };
});

describe("TeamSetup component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading when userId is not available", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });

    render(
      <MemoryRouter>
        <TeamSetup />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("updates team name input", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
    });

    render(
      <MemoryRouter>
        <TeamSetup />
      </MemoryRouter>
    );

    const input = await screen.findByPlaceholderText(/Orlando Pirates FC/i);
    fireEvent.change(input, { target: { value: "Orlando Pirates" } });

    expect((input as HTMLInputElement).value).toBe("Orlando Pirates");
  });

  it("submits and navigates on success", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
    });
    (teamService.fetchTeamById as any).mockResolvedValue(null); // No existing team
    (teamService.createTeam as any).mockResolvedValue({ id: "team-1" });

    render(
      <MemoryRouter>
        <TeamSetup />
      </MemoryRouter>
    );

    fireEvent.change(await screen.findByPlaceholderText(/Orlando Pirates FC/i), {
      target: { value: "Test Team" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Team/i }));

    await waitFor(() => {
      expect(teamService.createTeam).toHaveBeenCalledWith(
        "Test Team",
        null,
        "user-123"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/coach-dashboard?tab=players");
    });
  });

  it("shows error when createTeam fails", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
    });
    (teamService.createTeam as any).mockResolvedValue(null);

    render(
      <MemoryRouter>
        <TeamSetup />
      </MemoryRouter>
    );

    fireEvent.change(await screen.findByPlaceholderText(/Orlando Pirates FC/i), {
      target: { value: "Fail Team" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Team/i }));

    expect(await screen.findByText(/could not create your team/i)).toBeInTheDocument();
  });
});
