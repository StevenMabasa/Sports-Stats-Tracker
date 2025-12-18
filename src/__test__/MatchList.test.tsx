import { render, screen, fireEvent } from "@testing-library/react";
import MatchesList from "../pages/userDashboard/MatchList";
import { describe, it, vi, expect, beforeEach } from "vitest";
import type { UiMatch } from "../pages/userDashboard/hooks/useDbData";

// Mock data
const teams = [
  { id: "t1", name: "Team One" },
  { id: "t2", name: "Team Two" },
];

const matches: UiMatch[] = [
  {
    id: "m1",
    homeTeamId: "t1",
    awayTeamId: "t2",
    homeScore: 2,
    awayScore: 1,
    date: "2025-09-18",
    status: "finished",
  },
  {
    id: "m2",
    homeTeamId: "t2",
    awayTeamId: "t1",
    homeScore: 0,
    awayScore: 0,
    date: "2025-09-19",
    status: "pending",
  },
];


describe("MatchesList - Unit Tests", () => {
  let query = "";
  const setQuery = vi.fn((s) => (query = s));
  const onOpen = vi.fn();

  beforeEach(() => {
    query = "";
    vi.clearAllMocks();
  });


  it("renders empty state when no matches", () => {
    render(<MatchesList matches={[]} teams={teams} query={query} setQuery={setQuery} onOpen={onOpen} />);
    expect(screen.getByText(/No matches found/i)).toBeInTheDocument();
  });

  it("updates query on input change", () => {
    render(<MatchesList matches={matches} teams={teams} query={query} setQuery={setQuery} onOpen={onOpen} />);
    const input = screen.getByPlaceholderText(/Search teams or dates/i);
    fireEvent.change(input, { target: { value: "Team One" } });
    expect(setQuery).toHaveBeenCalledWith("Team One");
  });

  it("clears search query when Clear button is clicked", () => {
    render(<MatchesList matches={matches} teams={teams} query={query} setQuery={setQuery} onOpen={onOpen} />);
    const clearBtn = screen.getByText(/Clear/i);
    fireEvent.click(clearBtn);
    expect(setQuery).toHaveBeenCalledWith("");
  });


  it("copies score to clipboard when Share button is clicked", () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } });
    global.alert = vi.fn();

    render(<MatchesList matches={matches} teams={teams} query={query} setQuery={setQuery} onOpen={onOpen} />);
    const shareButtons = screen.getAllByText(/Share/i);
    fireEvent.click(shareButtons[0]);

    expect(writeTextMock).toHaveBeenCalledWith("Team One 2-1 Team Two");
    expect(global.alert).toHaveBeenCalledWith("Copied score to clipboard");
  });
});
