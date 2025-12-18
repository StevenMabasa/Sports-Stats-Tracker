import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Topbar from "../pages/userDashboard/Topbar";

// Mock supabase
const signOutMock = vi.fn().mockResolvedValue({});
vi.mock("../../../supabaseClient", () => ({
  default: {
    auth: {
      signOut: signOutMock,
    },
  },
}));

// Mock react-router-dom navigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("Topbar - UI Tests", () => {
  let setUsernameMock: ReturnType<typeof vi.fn>;
  let onProfileMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setUsernameMock = vi.fn();
    onProfileMock = vi.fn();
    vi.clearAllMocks();
  });

  it("renders input with username", () => {
    render(
      <MemoryRouter>
        <Topbar username="Alice" setUsername={setUsernameMock} onProfile={onProfileMock} />
      </MemoryRouter>
    );

    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
  });

  it("updates username when input changes", () => {
    render(
      <MemoryRouter>
        <Topbar username="" setUsername={setUsernameMock} onProfile={onProfileMock} />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Bob" } });

    expect(setUsernameMock).toHaveBeenCalledWith("Bob");
  });

  
});
