import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import CoachProfile from "../pages/coachDashboard/CoachProfile";
import * as teamService from "../services/teamService";

vi.mock("../services/teamService", () => ({
  fetchTeamById: vi.fn(),
  updateTeam: vi.fn(),
  uploadTeamLogo: vi.fn(),
  getCurrentTeamId: vi.fn(),
}));

describe("CoachProfile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state and then team data", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue("123");
    (teamService.fetchTeamById as any).mockResolvedValue({
      name: "Alpha FC",
      coach_name: "John Doe",
      logo_url: "logo.jpg",
    });

    render(<CoachProfile />);

    // Loading indicator first
    expect(screen.getByText(/loading team profile/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText("Team name")).toHaveValue("Alpha FC");
      expect(screen.getByLabelText("Coach name")).toHaveValue("John Doe");
    });
  });

  it("shows create form when no team found", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue(null);

    render(<CoachProfile />);

    await waitFor(() => {
      expect(screen.getByLabelText("Team name")).toBeInTheDocument();
      expect(screen.getByLabelText("Coach name")).toBeInTheDocument();
      expect(screen.getByLabelText("Save profile changes")).toBeInTheDocument();
    });
  });

  it("allows editing team and coach name", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue("321");
    (teamService.fetchTeamById as any).mockResolvedValue({
      name: "Beta FC",
      coach_name: "Alice",
    });
    (teamService.updateTeam as any).mockResolvedValue(true);

    render(<CoachProfile />);

    await waitFor(() => screen.getByLabelText("Team name"));

    fireEvent.change(screen.getByLabelText("Team name"), { target: { value: "Gamma FC" } });
    fireEvent.change(screen.getByLabelText("Coach name"), { target: { value: "Bob" } });

    fireEvent.click(screen.getByLabelText("Save profile changes"));

    await waitFor(() => {
      expect(teamService.updateTeam).toHaveBeenCalledWith("321", {
        name: "Gamma FC",
        coach_name: "Bob",
      });
      expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
    });
  });

  it("toggles the logo upload dropzone", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue("123");
    (teamService.fetchTeamById as any).mockResolvedValue({
      name: "Alpha FC",
      coach_name: "John Doe",
    });

    render(<CoachProfile />);

    await waitFor(() => screen.getByText(/alpha fc/i));

    const button = screen.getByLabelText("Update team logo");
    fireEvent.click(button);

    expect(screen.getByLabelText("Drag and drop new logo")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByLabelText("Drag and drop new logo")).not.toBeInTheDocument();
  });

  it("handles file upload successfully", async () => {
    const file = new File(["dummy"], "logo.png", { type: "image/png" });
    (teamService.getCurrentTeamId as any).mockReturnValue("999");
    (teamService.fetchTeamById as any).mockResolvedValue({
      name: "Delta FC",
      coach_name: "Coach Z",
    });
    (teamService.uploadTeamLogo as any).mockResolvedValue("https://cdn/logo.png");
    (teamService.updateTeam as any).mockResolvedValue(true);

    render(<CoachProfile />);

    await waitFor(() => screen.getByLabelText("Update team logo"));

    fireEvent.click(screen.getByLabelText("Update team logo"));

    const fileInput = screen.getByLabelText("Drag and drop new logo").querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();

    fireEvent.change(fileInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(teamService.uploadTeamLogo).toHaveBeenCalledWith("999", file);
      expect(screen.getByText(/logo updated successfully/i)).toBeInTheDocument();
    });
  });

  it("handles service errors gracefully", async () => {
    (teamService.getCurrentTeamId as any).mockReturnValue("errTeam");
    (teamService.fetchTeamById as any).mockRejectedValue(new Error("Server error"));

    render(<CoachProfile />);

    await waitFor(() => {
      expect(screen.getByText(/error loading team data/i)).toBeInTheDocument();
    });
  });
});
