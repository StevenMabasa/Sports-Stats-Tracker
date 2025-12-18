import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";
import { vi } from "vitest";

// Mock pages
vi.mock("../pages/landingPage", () => ({ default: () => <div>Landing Page</div> }));
vi.mock("../pages/login", () => ({ default: () => <div>Login Page</div> }));
vi.mock("../pages/signup", () => ({ default: () => <div>Signup Page</div> }));
vi.mock("../pages/coachDashboard/CoachDashboard", () => ({ default: () => <div>Coach Dashboard</div> }));
vi.mock("../pages/ProfileSettings", () => ({ default: () => <div>Profile Settings</div> }));
vi.mock("../pages/authCallback", () => ({ default: () => <div>Auth Callback</div> }));
vi.mock("../pages/TeamSetup", () => ({ default: () => <div>Team Setup</div> }));
vi.mock("../pages/userDashboard/RedesignedDashboard", () => ({ default: () => <div>User Dashboard</div> }));

// Mock ProtectedRoute to render children immediately
vi.mock("../components/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("App Routing", () => {
  it("renders landing page on '/' route", () => {
    window.history.pushState({}, "Landing", "/");
    render(<App />);
    expect(screen.getByText("Landing Page")).toBeInTheDocument();
  });

  it("renders login page on '/login'", () => {
    window.history.pushState({}, "Login", "/login");
    render(<App />);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects unknown route to landing page", () => {
    window.history.pushState({}, "Unknown", "/unknown");
    render(<App />);
    expect(screen.getByText("Landing Page")).toBeInTheDocument();
  });

  it("renders protected coach dashboard with ProtectedRoute", () => {
    window.history.pushState({}, "Coach Dashboard", "/coach-dashboard");
    render(<App />);
    expect(screen.getByText("Coach Dashboard")).toBeInTheDocument();
  });

  it("renders protected user dashboard with ProtectedRoute", () => {
    window.history.pushState({}, "User Dashboard", "/user-dashboard");
    render(<App />);
    expect(screen.getByText("User Dashboard")).toBeInTheDocument();
  });

});
