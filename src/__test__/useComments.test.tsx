import { renderHook, act } from "@testing-library/react";
import { useComments } from "../pages/userDashboard/hooks/useComments";

describe("useComments hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with an empty comments map", () => {
    const { result } = renderHook(() => useComments());
    expect(result.current.commentsMap).toEqual({});
  });

  it("can add a comment via sendComment", () => {
    const { result } = renderHook(() => useComments());

    act(() => {
      result.current.sendComment("match1", "Alice", "Nice goal!");
    });

    const comments = result.current.getCommentsForMatch("match1");
    expect(comments).toHaveLength(1);
    expect(comments[0].author).toBe("Alice");
    expect(comments[0].text).toBe("Nice goal!");
  });

  it("ignores empty or whitespace-only comments", () => {
    const { result } = renderHook(() => useComments());

    act(() => {
      result.current.sendComment("match1", "Bob", "   ");
    });

    expect(result.current.getCommentsForMatch("match1")).toHaveLength(0);
  });


  it("persists comments to localStorage", () => {
    const { result, unmount } = renderHook(() => useComments());

    act(() => {
      result.current.sendComment("match42", "Tester", "Saved to LS!");
    });

    // Unmount and re-mount hook (simulate reload)
    unmount();
    const { result: result2 } = renderHook(() => useComments());

    const comments = result2.current.getCommentsForMatch("match42");
    expect(comments).toHaveLength(1);
    expect(comments[0].text).toBe("Saved to LS!");
  });
});
