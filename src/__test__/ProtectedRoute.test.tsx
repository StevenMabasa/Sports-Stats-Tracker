import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../components/ProtectedRoute";
import supabase from "../../supabaseClient";
import { MemoryRouter } from "react-router-dom";
import { getUserRole } from "../services/roleService";

const mockNavigate = vi.fn();

// Mock Supabase client
vi.mock("../../supabaseClient", () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
  };
});

// Mock roleService
vi.mock("../services/roleService", () => ({
  getUserRole: vi.fn(),
}));

describe("ProtectedRoute component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders child content when requiredRole matches", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
      error: null,
    });
    (getUserRole as any).mockResolvedValue({ role: "Coach" });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="Coach">
          <div>Coach Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(await screen.findByText("Coach Content")).toBeInTheDocument();
  });

  it("redirects to login when user is not logged in", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="Coach">
          <div>Should not render</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // wait for useEffect to run
    await screen.findByText(/Checking access/i);

    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    expect(screen.queryByText("Should not render")).not.toBeInTheDocument();
  });

  it("redirects to redirectTo if user role does not match", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
      error: null,
    });
    (getUserRole as any).mockResolvedValue({ role: "Fan" });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="Coach" redirectTo="/role-selection">
          <div>Should not render</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await screen.findByText(/Checking access/i);

    expect(mockNavigate).toHaveBeenCalledWith("/role-selection", { replace: true });
    expect(screen.queryByText("Should not render")).not.toBeInTheDocument();
  });

  it("renders children if no role is required and user is logged in", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
      error: null,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>No Role Required</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(await screen.findByText("No Role Required")).toBeInTheDocument();
  });

  it("handles getUserRole returning null and redirects to redirectTo", async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
      error: null,
    });
    (getUserRole as any).mockResolvedValue(null);

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="Coach" redirectTo="/role-selection">
          <div>Should not render</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await screen.findByText(/Checking access/i);

    expect(mockNavigate).toHaveBeenCalledWith("/role-selection", { replace: true });
    expect(screen.queryByText("Should not render")).not.toBeInTheDocument();
  });
});
