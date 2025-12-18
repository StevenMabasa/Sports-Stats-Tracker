import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../pages/userDashboard/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns initial value if nothing in storage", () => {
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("reads from storage if present", () => {
    localStorage.setItem("key", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("updates storage when state changes", () => {
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    act(() => result.current[1]("new value"));
    expect(localStorage.getItem("key")).toBe(JSON.stringify("new value"));
  });

  it("falls back to initial value on invalid JSON", () => {
    localStorage.setItem("key", "not-json");
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    expect(result.current[0]).toBe("default");
  });
});
