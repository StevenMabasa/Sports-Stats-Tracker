import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchChatForMatch,
  sendChatMessage,
  type DbChatRecord,
} from "../services/chatService";

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../supabaseClient", () => {
  const mockFrom = vi.fn(() => ({
    select: mockSelect.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    order: mockOrder,
    insert: mockInsert,
    delete: mockDelete.mockReturnThis(),
  }));

  return { default: { from: mockFrom } };
});

import supabase from "../../supabaseClient";

describe("chatService", () => {
  const matchId = "match1";

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockInsert.mockResolvedValue({ data: null, error: null });
    mockDelete.mockReturnValue({ eq: mockEq.mockReturnThis() });
  });

  it("fetchChatForMatch returns chat records", async () => {
    const fakeData: DbChatRecord[] = [
      {
        id: "1",
        match_id: matchId,
        user_id: "u1",
        author: "Alice",
        message: "Hello",
        inserted_at: "2025-09-08T10:00:00Z",
      },
    ];

    mockOrder.mockResolvedValueOnce({ data: fakeData, error: null });

    const result = await fetchChatForMatch(matchId);

    expect(supabase.from).toHaveBeenCalledWith("chats");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("match_id", matchId);
    expect(mockOrder).toHaveBeenCalledWith("inserted_at", { ascending: true });
    expect(result).toEqual(fakeData);
  });

  it("fetchChatForMatch returns empty array on error", async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: "Failed" } });

    const result = await fetchChatForMatch(matchId);
    expect(result).toEqual([]);
  });

  it("sendChatMessage calls supabase.insert with correct data", async () => {
    await sendChatMessage(matchId, "Alice", "Hello", "u1");

    expect(supabase.from).toHaveBeenCalledWith("chats");
    expect(mockInsert).toHaveBeenCalledWith({
      match_id: matchId,
      author: "Alice",
      message: "Hello",
      user_id: "u1",
    });
  });

});
