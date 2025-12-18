import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/login";
import { vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

vi.mock("../../supabaseClient", () => ({
  default: {
    auth: {
      signInWithOAuth: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    },
  },
}));

describe("Login Component - Unit Tests", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders login header and Google button", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Header
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();

    // Google login button
    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();

    // Signup link
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it("calls supabase.auth.signInWithOAuth when Google button is clicked", async () => {
    const { default: supabase } = await import("../../supabaseClient");

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth-callback" },
    });
  });
});

//INTEGRATION TESTS

const server = setupServer(
  http.post("https://*.supabase.co/auth/v1/token", () => {
    return HttpResponse.json(
      {
        access_token: "fake_token",
        user: { id: "123", email: "test@example.com" },
      },
      { status: 200 }
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Login Component - Integration Tests", () => {
  it("handles successful Google sign-in flow", async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() =>
      expect(
        screen.queryByText(/an unexpected error occurred/i)
      ).not.toBeInTheDocument()
    );
  });

});
