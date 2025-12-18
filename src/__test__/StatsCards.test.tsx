import { render, screen } from "@testing-library/react";
import StatsCards from "../pages/userDashboard/StatsCards";
import { describe, it, expect } from "vitest";

describe("StatsCards - UI Tests", () => {
  it("renders all card headings", () => {
    render(<StatsCards teams={5} players={20} matches={10} />);

    expect(screen.getByText("Total Teams")).toBeInTheDocument();
    expect(screen.getByText("Total Players")).toBeInTheDocument();
    expect(screen.getByText("Matches")).toBeInTheDocument();
  });

  it("displays the correct numbers for teams, players, and matches", () => {
    render(<StatsCards teams={7} players={50} matches={15} />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
