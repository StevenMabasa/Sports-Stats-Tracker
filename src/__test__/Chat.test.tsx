import {describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Chat from "../pages/userDashboard/Chat";
import { fetchChatForMatch, sendChatMessage, deleteChatMessage, type DbChatRecord } from "../services/chatService";


// Mock the services
vi.mock("../services/chatService", () => ({
  fetchChatForMatch: vi.fn(),
  sendChatMessage: vi.fn(),
  deleteChatMessage: vi.fn(),
}));

// Mock supabase client
vi.mock("../../supabaseClient", () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };

  const mockSupabase = {
    channel: vi.fn().mockReturnValue(mockChannel),
    removeChannel: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null
      })
    }
  };

  return { default: mockSupabase };
});

// Type the mocked functions
const mockFetchChatForMatch = fetchChatForMatch as MockedFunction<
  typeof fetchChatForMatch
>;
const mockSendChatMessage = sendChatMessage as MockedFunction<
  typeof sendChatMessage
>;
const mockDeleteChatMessage = deleteChatMessage as MockedFunction<
  typeof deleteChatMessage
>;

describe("Chat Component", () => {
  const defaultProps = {
    matchId: "match-123",
    username: "TestUser",
  };

   const mockMessages: DbChatRecord[] = [
    {
      id: "1",
      match_id: "match-123",
      user_id: "user-1",
      author: "John",
      message: "Great game!",
      inserted_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      match_id: "match-123",
      user_id: "user-2",
      author: "Jane",
      message: "Amazing play!",
      inserted_at: "2024-01-01T10:05:00Z",
    },
  ];


  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchChatForMatch.mockResolvedValue([]);
    mockSendChatMessage.mockResolvedValue(undefined);
    mockDeleteChatMessage.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // UNIT TESTS
  describe("Unit Tests - Component Rendering", () => {
    it("renders the chat component with correct title", () => {
      render(<Chat {...defaultProps} />);
      expect(screen.getByText("Match Chat")).toBeInTheDocument();
    });

    it("renders input field with correct placeholder", () => {
      render(<Chat {...defaultProps} />);
      expect(
        screen.getByPlaceholderText("Write a message...")
      ).toBeInTheDocument();
    });

    it("renders send button", () => {
      render(<Chat {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "Send" })
      ).toBeInTheDocument();
    });

    it('shows "No messages yet" when no messages are present', async () => {
      mockFetchChatForMatch.mockResolvedValue([]);
      render(<Chat {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("No messages yet — share your thoughts!")
        ).toBeInTheDocument();
      });
    });

    it("displays messages when they exist", async () => {
      mockFetchChatForMatch.mockResolvedValue(mockMessages);
      render(<Chat {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Great game!")).toBeInTheDocument();
        expect(screen.getByText("Amazing play!")).toBeInTheDocument();
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("Jane")).toBeInTheDocument();
      });
    });
  });

  describe("Unit Tests - User Interactions", () => {
    it("calls sendChatMessage when send button is clicked with text", async () => {
      const user = userEvent.setup();
      mockFetchChatForMatch.mockResolvedValue([]);
      render(<Chat {...defaultProps} />);

      const input = screen.getByPlaceholderText("Write a message...");
      const sendButton = screen.getByRole("button", { name: "Send" });

      await user.type(input, "Hello world!");
      await user.click(sendButton);

      expect(mockSendChatMessage).toHaveBeenCalledWith(
        "match-123",
        "TestUser",
        "Hello world!",
        "test-user-id"
      );
    });

    it("calls sendChatMessage when Enter key is pressed with text", async () => {
      const user = userEvent.setup();
      mockFetchChatForMatch.mockResolvedValue([]);
      render(<Chat {...defaultProps} />);

      const input = screen.getByPlaceholderText("Write a message...");

      await user.type(input, "Hello world!");
      await user.keyboard("{Enter}");

      expect(mockSendChatMessage).toHaveBeenCalledWith(
        "match-123",
        "TestUser",
        "Hello world!",
        "test-user-id"
      );
    });

    it("does not send message when input is empty", async () => {
      const user = userEvent.setup();
      mockFetchChatForMatch.mockResolvedValue([]);
      render(<Chat {...defaultProps} />);

      const sendButton = screen.getByRole("button", { name: "Send" });
      await user.click(sendButton);

      expect(mockSendChatMessage).not.toHaveBeenCalled();
    });

    it("does not send message when input contains only whitespace", async () => {
      const user = userEvent.setup();
      mockFetchChatForMatch.mockResolvedValue([]);
      render(<Chat {...defaultProps} />);

      const input = screen.getByPlaceholderText("Write a message...");
      const sendButton = screen.getByRole("button", { name: "Send" });

      await user.type(input, "   ");
      await user.click(sendButton);

      expect(mockSendChatMessage).not.toHaveBeenCalled();
    });

    it("clears input after sending message", async () => {
      const user = userEvent.setup();
      mockFetchChatForMatch.mockResolvedValue([]);
      render(<Chat {...defaultProps} />);

      const input = screen.getByPlaceholderText("Write a message...");
      const sendButton = screen.getByRole("button", { name: "Send" });

      await user.type(input, "Test message");
      expect(input).toHaveValue("Test message");

      await user.click(sendButton);

      await waitFor(() => {
        expect(input).toHaveValue("");
      });
    });

    it("calls deleteChatMessage when delete button is clicked for user's own message", async () => {
      const user = userEvent.setup();
      // Create messages where the first one belongs to the current user
      const messagesWithUserOwnership = [
        {
          ...mockMessages[0],
          user_id: "test-user-id" // This matches the mocked user ID
        },
        {
          ...mockMessages[1],
          user_id: "other-user-id" // This is a different user
        }
      ];
      mockFetchChatForMatch.mockResolvedValue(messagesWithUserOwnership);
      render(<Chat {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Great game!")).toBeInTheDocument();
      });

      // Only one delete button should be visible (for the user's own message)
      const deleteButtons = screen.getAllByText("Delete");
      expect(deleteButtons).toHaveLength(1);
      await user.click(deleteButtons[0]);

      expect(mockDeleteChatMessage).toHaveBeenCalledWith("1");
    });

    it("does not show delete button for messages from other users", async () => {
      // Create messages where none belong to the current user
      const messagesFromOtherUsers = [
        {
          ...mockMessages[0],
          user_id: "other-user-1"
        },
        {
          ...mockMessages[1],
          user_id: "other-user-2"
        }
      ];
      mockFetchChatForMatch.mockResolvedValue(messagesFromOtherUsers);
      render(<Chat {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Great game!")).toBeInTheDocument();
        expect(screen.getByText("Amazing play!")).toBeInTheDocument();
      });

      // No delete buttons should be visible
      const deleteButtons = screen.queryAllByText("Delete");
      expect(deleteButtons).toHaveLength(0);
    });
  });

});
