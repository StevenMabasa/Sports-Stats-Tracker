import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import F1Dashboard from "../pages/f1/F1Dashboard";

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Outlet: () => <div data-testid="outlet" />,
  };
});

// Optional: mock F1Sidebar if you want to isolate tests
vi.mock("../pages/f1/F1Sidebar", () => ({
  default: ({ activeTab, onNavigate }: any) => (
    <div>
      <button data-testid="drivers" onClick={() => onNavigate("drivers")}>
        Drivers {activeTab === "drivers" && "(active)"}
      </button>
      <button data-testid="teams" onClick={() => onNavigate("teams")}>
        Teams {activeTab === "teams" && "(active)"}
      </button>
      <button data-testid="stats" onClick={() => onNavigate("stats")}>
        Stats {activeTab === "stats" && "(active)"}
      </button>
      <button data-testid="f1Results" onClick={() => onNavigate("f1Results")}>
        Results {activeTab === "f1Results" && "(active)"}
      </button>
    </div>
  ),
}));

describe("F1Dashboard Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders sidebar and main content", () => {
    render(
      <MemoryRouter>
        <F1Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Drivers/)).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("defaults to drivers tab active", () => {
    render(
      <MemoryRouter>
        <F1Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Drivers \(active\)/)).toBeInTheDocument();
  });

  it("clicking a tab updates activeTab and navigates", () => {
    render(
      <MemoryRouter>
        <F1Dashboard />
      </MemoryRouter>
    );

    const teamsButton = screen.getByTestId("teams");
    fireEvent.click(teamsButton);

    expect(mockNavigate).toHaveBeenCalledWith("/f1-dashboard/teams");
    expect(screen.getByText(/Teams \(active\)/)).toBeInTheDocument();
  });

  it("renders Outlet for nested routes", () => {
    render(
      <MemoryRouter>
        <F1Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});
