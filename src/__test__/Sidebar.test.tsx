import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../pages/userDashboard/Sidebar";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Sidebar Component", () => {
  const mockGoToTab = vi.fn();
  const tabs = ["overview", "teams", "players", "matches", "favorites"] as const;

  beforeEach(() => {
    mockGoToTab.mockClear();
  });

  it("renders without crashing", () => {
    render(<Sidebar activeTab="overview" goToTab={mockGoToTab} />);
  });

  it("renders the brand correctly", () => {
    render(<Sidebar activeTab="overview" goToTab={mockGoToTab} />);
    const brandElements = screen.getAllByText("R&S Sports");
    expect(brandElements.length).toBeGreaterThan(0); // at least h1 or h3 is present
  });

  it("renders all tab buttons", () => {
    render(<Sidebar activeTab="overview" goToTab={mockGoToTab} />);
    tabs.forEach(tab => {
      expect(screen.getByText(tab[0].toUpperCase() + tab.slice(1))).toBeInTheDocument();
    });
  });

  it("applies the 'active' class to the activeTab", () => {
    render(<Sidebar activeTab="players" goToTab={mockGoToTab} />);
    expect(screen.getByText("Players")).toHaveClass("active");
    expect(screen.getByText("Teams")).not.toHaveClass("active");
  });

  it("calls goToTab when a tab button is clicked", () => {
    render(<Sidebar activeTab="overview" goToTab={mockGoToTab} />);
    fireEvent.click(screen.getByText("Matches"));
    expect(mockGoToTab).toHaveBeenCalledTimes(1);
    expect(mockGoToTab).toHaveBeenCalledWith("matches");
  });

});
