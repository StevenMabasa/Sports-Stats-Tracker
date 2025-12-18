import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeamsList from "../pages/userDashboard/TeamsList";

describe("TeamsList Component", () => {
  const teams = [
    { id: "t1", name: "Team A" },
    { id: "t2", name: "Team B" },
  ];

  let mockIsFavorite: (teamId: string) => boolean;
  let mockToggleFavorite: (teamId: string) => Promise<void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsFavorite = vi.fn((teamId) => teamId === "t1"); // t1 is favorite by default
    mockToggleFavorite = vi.fn(async () => Promise.resolve());
  });

  // Helper to render with router context
  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders team names and favorite stars correctly", () => {
    renderWithRouter(
      <TeamsList
        teams={teams}
        isFavorite={mockIsFavorite}
        toggleFavorite={mockToggleFavorite}
        loading={false}
      />
    );

    // Check team names
    expect(screen.getByText("Team A")).toBeInTheDocument();
    expect(screen.getByText("Team B")).toBeInTheDocument();

    // Check star buttons
    const starA = screen.getByLabelText("Remove from favorites");
    const starB = screen.getByLabelText("Add to favorites");
    expect(starA).toBeInTheDocument();
    expect(starB).toBeInTheDocument();
  });

  it("calls toggleFavorite when star is clicked", async () => {
    renderWithRouter(
      <TeamsList
        teams={teams}
        isFavorite={mockIsFavorite}
        toggleFavorite={mockToggleFavorite}
        loading={false}
      />
    );

    const starB = screen.getByLabelText("Add to favorites");
    fireEvent.click(starB);

    expect(mockToggleFavorite).toHaveBeenCalledWith("t2");
  });

  it("disables star button while loading", () => {
    renderWithRouter(
      <TeamsList
        teams={teams}
        isFavorite={mockIsFavorite}
        toggleFavorite={mockToggleFavorite}
        loading={true}
      />
    );

    const starA = screen.getByLabelText("Remove from favorites");
    const starB = screen.getByLabelText("Add to favorites");

    expect(starA).toBeDisabled();
    expect(starB).toBeDisabled();
  });

  it("shows toggling state when star is clicked", async () => {
    // Override toggleFavorite to delay for a short time
    mockToggleFavorite = vi.fn(
      async (): Promise<void> =>
        new Promise<void>((resolve) => setTimeout(resolve, 50))
    );

    renderWithRouter(
      <TeamsList
        teams={teams}
        isFavorite={mockIsFavorite}
        toggleFavorite={mockToggleFavorite}
        loading={false}
      />
    );

    const starB = screen.getByLabelText("Add to favorites");

    fireEvent.click(starB);

    // During the toggle, the button should show "⏳"
    expect(starB.textContent).toBe("⏳");
    expect(starB).toBeDisabled();
  });
});
