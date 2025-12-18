import { render, screen, fireEvent} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import RedesignedDashboard from "../pages/userDashboard/RedesignedDashboard";

// Mock services and hooks
const mockNavigate = vi.fn();
const mockLocation = { pathname: "/user-dashboard" };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock the custom hooks
const mockDbData = {
  teams: [
    { id: "1", name: "Team A" },
    { id: "2", name: "Team B" },
    { id: "3", name: "Team C" }
  ],
  players: [
    { id: "1", name: "Player 1", teamId: "1" },
    { id: "2", name: "Player 2", teamId: "2" },
    { id: "3", name: "Player 3", teamId: "3" }
  ],
  matches: [
    { id: "1", homeTeamId: "1", awayTeamId: "2", homeScore: 2, awayScore: 1, date: "2025-08-01" },
    { id: "2", homeTeamId: "2", awayTeamId: "3", homeScore: 0, awayScore: 0, date: "2025-08-05" }
  ],
  loading: false,
  error: null,
  debugData: vi.fn()
};

const mockFavoriteTeams = {
  favoriteTeamIds: ["2"],
  isFavorite: vi.fn((teamId: string) => teamId === "2"),
  toggleFavorite: vi.fn(),
  loading: false
};

const mockLocalStorage = ["Fan", vi.fn()];

vi.mock("../pages/userDashboard/hooks/useDbData.ts", () => ({
  useDbData: vi.fn(() => mockDbData)
}));

vi.mock("../pages/userDashboard/hooks/useFavorites.ts", () => ({
  useFavoriteTeams: vi.fn(() => mockFavoriteTeams)
}));

vi.mock("../pages/userDashboard/hooks/useLocalStorage.ts", () => ({
  useLocalStorage: vi.fn(() => mockLocalStorage)
}));

// --- Mock child components for UNIT tests ---
vi.mock("../pages/userDashboard/Topbar.tsx", () => ({
  default: ({ username, setUsername, onProfile }: any) => (
    <div data-testid="topbar">
      <span data-testid="username-display">{username}</span>
      <button onClick={onProfile}>Profile</button>
      <input 
        data-testid="username-input" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
    </div>
  ),
}));

vi.mock("../pages/userDashboard/Sidebar.tsx", () => ({
  default: ({ activeTab, goToTab }: any) => (
    <div data-testid="sidebar">
      <button onClick={() => goToTab("overview")} className={activeTab === "overview" ? "active" : ""}>
        Overview
      </button>
      <button onClick={() => goToTab("teams")} className={activeTab === "teams" ? "active" : ""}>
        Teams
      </button>
      <button onClick={() => goToTab("players")} className={activeTab === "players" ? "active" : ""}>
        Players
      </button>
      <button onClick={() => goToTab("matches")} className={activeTab === "matches" ? "active" : ""}>
        Matches
      </button>
      <button onClick={() => goToTab("favorites")} className={activeTab === "favorites" ? "active" : ""}>
        Favorites
      </button>
    </div>
  ),
}));

vi.mock("../pages/userDashboard/StatsCards.tsx", () => ({
  default: ({ teams, players, matches }: any) => (
    <div data-testid="stats-cards">
      <div>Teams: {teams}</div>
      <div>Players: {players}</div>
      <div>Matches: {matches}</div>
    </div>
  ),
}));

vi.mock("../pages/userDashboard/MatchList.tsx", () => ({
  default: ({ matches, query, setQuery, onOpen }: any) => (
    <div data-testid="matches-list">
      <input 
        data-testid="search-input"
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search matches..."
      />
      {matches.map((match: any) => (
        <div key={match.id} data-testid={`match-${match.id}`}>
          <span>Match {match.id}</span>
          <button onClick={() => onOpen(match.id)}>View Details</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../pages/userDashboard/TeamsList.tsx", () => ({
  default: ({ teams, isFavorite, toggleFavorite, loading }: any) => (
    <div data-testid="teams-list">
      {loading && <div data-testid="teams-loading">Loading teams...</div>}
      {teams.map((team: any) => (
        <div key={team.id} data-testid={`team-${team.id}`}>
          <span>{team.name}</span>
          <button 
            onClick={() => toggleFavorite(team.id)}
            data-testid={`favorite-btn-${team.id}`}
          >
            {isFavorite(team.id) ? "★" : "☆"}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../pages/userDashboard/PlayersList.tsx", () => ({
  default: ({ players}: any) => (
    <div data-testid="players-list">
      {players.map((player: any) => (
        <div key={player.id} data-testid={`player-${player.id}`}>
          <span>{player.name}</span>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../pages/userDashboard/PlayerDetails.tsx", () => ({
  default: ({ onBack }: any) => (
    <div data-testid="player-details">
      <button onClick={onBack}>Back to Players</button>
      <div>Player Details View</div>
    </div>
  ),
}));

vi.mock("../pages/userDashboard/MatchDetailsPage.tsx", () => ({
  default: ({ onBack, username}: any) => (
    <div data-testid="match-details">
      <button onClick={onBack}>Back to Matches</button>
      <div>Match Details for {username}</div>
    </div>
  ),
}));

//UNIT TESTS
describe("RedesignedDashboard - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = "/user-dashboard";
  });

  it("should render dashboard with overview tab by default", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
    expect(screen.getByTestId("matches-list")).toBeInTheDocument();
  });

  it("should display correct stats in overview", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    expect(screen.getByText("Teams: 3")).toBeInTheDocument();
    expect(screen.getByText("Players: 3")).toBeInTheDocument();
    expect(screen.getByText("Matches: 2")).toBeInTheDocument();
  });

  it("should display username from localStorage hook", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    expect(screen.getByTestId("username-display")).toHaveTextContent("Fan");
  });

  it("should render sidebar and topbar components", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("topbar")).toBeInTheDocument();
  });

  it("should navigate to profile when profile button is clicked", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    fireEvent.click(screen.getByText("Profile"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile-settings");
  });
});

// INTEGRATION TESTS
describe("RedesignedDashboard - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = "/user-dashboard";
  });

  it("should switch to teams tab and show teams list", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    fireEvent.click(screen.getByText("Teams"));
    
    expect(mockNavigate).toHaveBeenCalledWith("/teams");
    expect(screen.getByTestId("teams-list")).toBeInTheDocument();
    expect(screen.queryByTestId("stats-cards")).not.toBeInTheDocument();
  });

  it("should switch to players tab and show players list", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    fireEvent.click(screen.getByText("Players"));
    
    expect(mockNavigate).toHaveBeenCalledWith("/players");
    expect(screen.getByTestId("players-list")).toBeInTheDocument();
  });

  it("should switch to matches tab and show matches list", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    fireEvent.click(screen.getByText("Matches"));
    
    expect(mockNavigate).toHaveBeenCalledWith("/matches");
    expect(screen.getByTestId("matches-list")).toBeInTheDocument();
  });

  it("should switch to favorites tab and show filtered teams", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    fireEvent.click(screen.getByText("Favorites"));
    
    expect(mockNavigate).toHaveBeenCalledWith("/favorites");
    expect(screen.getByTestId("teams-list")).toBeInTheDocument();
  });

  it("should navigate back to overview when overview button is clicked", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    // First go to another tab
    fireEvent.click(screen.getByText("Teams"));
    
    // Then back to overview
    fireEvent.click(screen.getByText("Overview"));
    
    expect(mockNavigate).toHaveBeenCalledWith("/user-dashboard");
    expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
  });

  it("should open match details when match is selected", () => {
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    const viewDetailsButtons = screen.getAllByText("View Details");
    fireEvent.click(viewDetailsButtons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith("/matches/1");
    expect(screen.getByTestId("match-details")).toBeInTheDocument();
  });

  it("should navigate back to matches list from match details", () => {
    mockLocation.pathname = "/matches/1";
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    fireEvent.click(screen.getByText("Back to Matches"));
    expect(mockNavigate).toHaveBeenCalledWith("/matches");
  });

  it("should handle URL-based navigation to match details", () => {
    mockLocation.pathname = "/matches/1";
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    expect(screen.getByTestId("match-details")).toBeInTheDocument();
    expect(screen.queryByTestId("matches-list")).not.toBeInTheDocument();
  });

  it("should handle URL-based navigation to player details", () => {
    mockLocation.pathname = "/players/1";
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    expect(screen.getByTestId("player-details")).toBeInTheDocument();
    expect(screen.queryByTestId("players-list")).not.toBeInTheDocument();
  });
});

//EDGE CASE TESTS
describe("RedesignedDashboard - Edge Case Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = "/user-dashboard";
  });

  it("should handle invalid URL paths by defaulting to overview", () => {
    mockLocation.pathname = "/invalid-path";
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    // Should default to overview
    expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
  });

  it("should handle non-existent match ID in URL by showing matches list", () => {
    mockLocation.pathname = "/matches/non-existent";
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    // Should show matches list instead of details
    expect(screen.getByTestId("matches-list")).toBeInTheDocument();
    expect(screen.queryByTestId("match-details")).not.toBeInTheDocument();
  });

  it("should handle empty pathname correctly", () => {
    mockLocation.pathname = "";
    render(<RedesignedDashboard />, { wrapper: MemoryRouter });
    
    // Should default to overview
    expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
  });
});