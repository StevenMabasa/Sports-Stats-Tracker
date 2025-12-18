import { describe, it, expect, vi } from "vitest";

const mockRender = vi.fn();
const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.mock("../App.tsx", () => ({
  default: () => "MockedApp",
}));

describe("main.tsx", () => {
  it("mounts App inside StrictMode at #root", async () => {
    // Fake root element
    const fakeRoot = document.createElement("div");
    fakeRoot.id = "root";
    document.body.appendChild(fakeRoot);

    await import("../main.tsx");

    // Assertions
    expect(mockCreateRoot).toHaveBeenCalledWith(fakeRoot);
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockRender.mock.calls[0][0]).toMatchSnapshot();
  });
});
