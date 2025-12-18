import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import MatchDetailsModal from "../pages/coachDashboard/matchManaging/MatchDetailsModal";
import type { Match, Player, MatchEvent } from "../types";

// Mock services
vi.mock("../services/matchService", () => ({
  upsertPlayerStats: vi.fn().mockResolvedValue("mock-stats-id"),
  updateMatch: vi.fn().mockResolvedValue(true),
}));

// Mock AdvancedStatsForm component
vi.mock("../pages/coachDashboard/matchManaging/PlayerStatsForm/AdvancedStatsForm", () => ({
  default: ({ player, onSave }: { player: Player; onSave: (playerId: string, stats: Record<string, number>) => void }) => (
    <div data-testid="advanced-stats-form">
      <h4>Advanced Stats for {player.name}</h4>
      <button 
        data-testid="save-stats-btn"
        onClick={() => onSave(player.id, { goals: 2, assists: 1, shots: 5 })}
      >
        Save Stats
      </button>
    </div>
  )
}));

// Mock InlineAlert component
vi.mock("../components/InlineAlert", () => ({
  default: ({ message, type, onClose }: { message: string; type: string; onClose: () => void }) => (
    <div data-testid="inline-alert" className={`alert-${type}`}>
      {message}
      <button onClick={onClose}>×</button>
    </div>
  )
}));

const mockMatch: Match = {
  id: "m1",
  opponentName: "Team B",
  teamScore: 2,
  opponentScore: 1,
  possession: 50,
  shots: 10,
  shotsOnTarget: 5,
  corners: 3,
  fouls: 2,
  offsides: 1,
  passes: 400,
  passAccuracy: 80,
  tackles: 7,
  saves: 2,
  status: "completed",
  date: "2025-09-08",
  teamId: "t1"
};

const mockPlayers: Player[] = [
  {
    id: "p1",
    name: "Player 1",
    teamId: "t1",
    position: "Forward",
    stats: {
      goals: 1,
      assists: 0,
      minutesPlayed: 90,
      shots: 5,
      shotsOnTarget: 3,
      chancesCreated: 2,
      dribblesAttempted: 4,
      dribblesSuccessful: 3,
      offsides: 1,
      tackles: 0,
      interceptions: 1,
      clearances: 0,
      saves: 0,
      cleansheets: 0,
      savePercentage: 0,
      passCompletion: 80,
      yellowCards: 0,
      redCards: 0,
      performanceData: []
    },
    jerseyNum: "10",
    imageUrl: ""
  },
  {
    id: "p2",
    name: "Player 2",
    teamId: "t1",
    position: "Midfielder",
    stats: {
      goals: 0,
      assists: 1,
      minutesPlayed: 90,
      shots: 2,
      shotsOnTarget: 1,
      chancesCreated: 3,
      dribblesAttempted: 2,
      dribblesSuccessful: 2,
      offsides: 0,
      tackles: 2,
      interceptions: 1,
      clearances: 0,
      saves: 0,
      cleansheets: 0,
      savePercentage: 0,
      passCompletion: 85,
      yellowCards: 0,
      redCards: 0,
      performanceData: []
    },
    jerseyNum: "8",
    imageUrl: ""
  },
];

const mockEvents: MatchEvent[] = [
  { id: "e1", matchId: "m1", playerId: "p1", eventType: "goal" },
];

// Import the actual services for mocking
import { updateMatch } from "../services/matchService";

describe("MatchDetailsModal", () => {
  const onClose = vi.fn();
  const onUpdateTeamStats = vi.fn();
  const onAddPlayerEvent = vi.fn();
  const onRemovePlayerEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = () => {
    return render(
      <MatchDetailsModal
        match={mockMatch}
        players={mockPlayers}
        events={mockEvents}
        onClose={onClose}
        onUpdateTeamStats={onUpdateTeamStats}
        onAddPlayerEvent={onAddPlayerEvent}
        onRemovePlayerEvent={onRemovePlayerEvent}
      />
    );
  };

  it("renders match details", () => {
    renderModal();
    expect(screen.getByText("Match Details")).toBeInTheDocument();
    expect(screen.getByText("t1 vs Team B (2 - 1)")).toBeInTheDocument();
  });

  it("shows AdvancedStatsForm when player is selected", () => {
    renderModal();
    const dropdown = screen.getByRole("combobox");
    fireEvent.change(dropdown, { target: { value: "p1" } });
    
    expect(screen.getByTestId("advanced-stats-form")).toBeInTheDocument();
    expect(screen.getByText("Advanced Stats for Player 1")).toBeInTheDocument();
  });

  it("does not show AdvancedStatsForm when no player is selected", () => {
    renderModal();
    expect(screen.queryByTestId("advanced-stats-form")).not.toBeInTheDocument();
  });

  it("updates team stats on input blur", async () => {
    renderModal();
    
    const possessionInput = screen.getByDisplayValue("50");
    fireEvent.blur(possessionInput, { target: { value: "60" } });
    
    await waitFor(() => {
      expect(updateMatch).toHaveBeenCalledWith("m1", expect.objectContaining({
        possession: 60
      }));
    });
    
    await waitFor(() => {
      expect(onUpdateTeamStats).toHaveBeenCalledWith("m1", { possession: 60 });
    });
  });

  it("handles team stats update failure", async () => {
    (updateMatch as any).mockResolvedValueOnce(false);
    renderModal();
    
    const possessionInput = screen.getByDisplayValue("50");
    fireEvent.blur(possessionInput, { target: { value: "60" } });
    
    await waitFor(() => {
      expect(screen.getByText("Failed to update team stats. Please try again.")).toBeInTheDocument();
    });
  });


});