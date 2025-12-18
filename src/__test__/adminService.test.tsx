import { vi, describe, it, expect, beforeEach } from "vitest";
import supabase from "../../supabaseClient";
import { deleteUserCompletely } from "../services/adminService";

type MockSupabase = typeof supabase & {
  __mocks: {
    deleteFn: ReturnType<typeof vi.fn>;
    updateFn: ReturnType<typeof vi.fn>;
    listFn: ReturnType<typeof vi.fn>;
    removeFn: ReturnType<typeof vi.fn>;
  };
};

vi.mock("../../supabaseClient", () => {
  const deleteFn = vi.fn(() => Promise.resolve({ error: null }));
  const updateFn = vi.fn(() => Promise.resolve({ error: null }));
  const listFn = vi.fn(() =>
    Promise.resolve({ data: [{ name: "file1.png" }], error: null })
  );
  const removeFn = vi.fn(() => Promise.resolve({ error: null }));

  return {
    default: {
        from: vi.fn(() => ({
            delete: () => ({ eq: deleteFn }),
            update: () => ({ eq: updateFn }),
        })),
        storage: {
            from: vi.fn(() => ({
                list: listFn,
                remove: removeFn,
            })),
        },
        __mocks: { deleteFn, updateFn, listFn, removeFn },
    } as unknown as MockSupabase,
  };
});

describe("deleteUserCompletely", () => {
  let mocks: any;
  const userId = "user123";

  beforeEach(async () => {
    vi.clearAllMocks();
    mocks = ((await import("../../supabaseClient")).default as MockSupabase).__mocks;
  });

  it("deletes user and related data successfully", async () => {
    mocks.listFn.mockResolvedValueOnce({
      data: [{ name: "file1.png" }],
      error: null,
    });

    const result = await deleteUserCompletely(userId);

    expect(result).toBe(true);

    // dependent deletions called
    expect(mocks.deleteFn).toHaveBeenCalled();
    expect(mocks.updateFn).toHaveBeenCalled();

    // storage list and remove called
    expect(mocks.listFn).toHaveBeenCalledWith(userId, { limit: 100, offset: 0 });
    expect(mocks.removeFn).toHaveBeenCalledWith([`${userId}/file1.png`]);
  });

  it("handles case where no files found", async () => {
    mocks.listFn.mockResolvedValueOnce({ data: [], error: null });

    const result = await deleteUserCompletely(userId);

    expect(result).toBe(true);
    expect(mocks.removeFn).not.toHaveBeenCalled();
  });

  it("handles listError gracefully", async () => {
    mocks.listFn.mockResolvedValueOnce({ data: null, error: { message: "oops" } });

    const result = await deleteUserCompletely(userId);

    expect(result).toBe(true);
    expect(mocks.removeFn).not.toHaveBeenCalled();
  });

  it("swallows remove errors", async () => {
    mocks.listFn.mockResolvedValueOnce({ data: [{ name: "f.png" }], error: null });
    mocks.removeFn.mockRejectedValueOnce(new Error("remove fail"));

    const result = await deleteUserCompletely(userId);

    expect(result).toBe(true);
  });

  it("returns false if unexpected error occurs", async () => {
    // Force throw inside function
    (supabase.from as any).mockImplementationOnce(() => {
      throw new Error("unexpected");
    });

    const result = await deleteUserCompletely(userId);

    expect(result).toBe(false);
  });
});
