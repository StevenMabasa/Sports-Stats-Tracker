import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import DashboardSidebar from "../pages/coachDashboard/DashboardSidebar";

vi.mock("../../supabaseClient", () => ({
  default: { auth: { signOut: vi.fn() } },
}));

describe("DashboardSidebar", () => {
  let mockOnNavigate: (tab: string) => void;

  beforeEach(() => {
    mockOnNavigate = vi.fn();
  });

  const renderSidebar = () =>
    render(
      <MemoryRouter>
        <DashboardSidebar onNavigate={mockOnNavigate} />
      </MemoryRouter>
    );

  it("sidebar is closed by default", () => {
    renderSidebar();
    const sidebar = screen.getByRole("complementary");
    expect(sidebar.classList.contains("open")).toBe(false);
  });

  it("opens sidebar when hamburger menu is clicked", () => {
    renderSidebar();
    fireEvent.click(screen.getByLabelText("Toggle navigation menu"));
    const sidebar = screen.getByRole("complementary");
    expect(sidebar.classList.contains("open")).toBe(true);
  });

  it("closes sidebar when close button is clicked", () => {
    renderSidebar();
    fireEvent.click(screen.getByLabelText("Toggle navigation menu")); // open
    fireEvent.click(screen.getByText("×")); // close
    const sidebar = screen.getByRole("complementary");
    expect(sidebar.classList.contains("open")).toBe(false);
  });

  it("calls onNavigate and closes sidebar when nav button is clicked", () => {
    renderSidebar();
    fireEvent.click(screen.getByLabelText("Toggle navigation menu")); // open
    fireEvent.click(screen.getByText("Players")); // navigate

    expect(mockOnNavigate).toHaveBeenCalledWith("players");

    const sidebar = screen.getByRole("complementary");
    expect(sidebar.classList.contains("open")).toBe(false);
  });
});
