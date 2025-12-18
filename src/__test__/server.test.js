import request from "supertest";
import { describe, it, beforeEach, expect, vi } from "vitest";
import app from "../../API's/server";

// --- Supabase Mocks ---
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockOrder = vi.fn();

// Create a flexible query builder that can handle different chains
const createQueryBuilder = () => ({
  select: mockSelect,
  eq: mockEq,
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  order: mockOrder,
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => createQueryBuilder()),
    auth: { getSession: vi.fn() },
  })),
}));

describe("API Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks to return themselves for chaining
    mockSelect.mockReturnValue(createQueryBuilder());
    mockEq.mockReturnValue(createQueryBuilder());
    mockInsert.mockReturnValue(createQueryBuilder());
    mockUpdate.mockReturnValue(createQueryBuilder());
    mockDelete.mockReturnValue(createQueryBuilder());
    mockOrder.mockReturnValue(createQueryBuilder());
  });

  // --- Health ---
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  // --- Teams ---
  it("GET /teams/:teamId returns a team", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: "team1", name: "My Team" }, error: null });
    const res = await request(app).get("/teams/team1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "team1", name: "My Team" });
  });

  it("GET /teams/:teamId handles not found", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const res = await request(app).get("/teams/unknown");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Team not found" });
  });

  it("GET /teams/:teamId handles database error", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).get("/teams/team1");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch team" });
  });

  it("POST /teams creates a team", async () => {
    mockSingle.mockResolvedValue({ data: { id: "team1", name: "New Team" }, error: null });
    const res = await request(app).post("/teams").send({ id: "team1", name: "New Team" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "team1", name: "New Team" });
  });

  it("POST /teams validates required fields", async () => {
    const res = await request(app).post("/teams").send({ name: "Team without ID" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "id and name are required" });
  });

  it("POST /teams validates name field", async () => {
    const res = await request(app).post("/teams").send({ id: "team1" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "id and name are required" });
  });

  it("POST /teams handles database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).post("/teams").send({ id: "team1", name: "New Team" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create team" });
  });

  it("PUT /teams/:teamId updates a team", async () => {
    mockSingle.mockResolvedValue({ data: { id: "team1", name: "Updated Team" }, error: null });
    const res = await request(app).put("/teams/team1").send({ name: "Updated Team" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "team1", name: "Updated Team" });
  });

  it("PUT /teams/:teamId handles database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).put("/teams/team1").send({ name: "Updated Team" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to update team" });
  });

  // --- Players ---
  it("GET /teams/:teamId/players returns players", async () => {
    // Mock the chain: .select().eq().order()
    mockOrder.mockResolvedValue({ data: [{ id: "p1", name: "Player One" }], error: null });
    const res = await request(app).get("/teams/team1/players");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "p1", name: "Player One" }]);
  });

  it("GET /teams/:teamId/players handles database error", async () => {
    // Mock the chain: .select().eq().order()
    mockOrder.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).get("/teams/team1/players");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch players" });
  });

  it("POST /teams/:teamId/players creates player", async () => {
    mockSingle.mockResolvedValue({ data: { id: "p1", name: "Player One" }, error: null });
    const res = await request(app).post("/teams/team1/players").send({ name: "Player One" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "p1", name: "Player One" });
  });

  it("POST /teams/:teamId/players validates name field", async () => {
    const res = await request(app).post("/teams/team1/players").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "name is required" });
  });

  it("POST /teams/:teamId/players handles database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).post("/teams/team1/players").send({ name: "Player One" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create player" });
  });

  it("PUT /players/:playerId updates player", async () => {
    mockSingle.mockResolvedValue({ data: { id: "p1", name: "Updated Player" }, error: null });
    const res = await request(app).put("/players/p1").send({ name: "Updated Player" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "p1", name: "Updated Player" });
  });

  it("PUT /players/:playerId handles database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).put("/players/p1").send({ name: "Updated Player" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to update player" });
  });

  it("DELETE /players/:playerId deletes player", async () => {
    mockDelete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const res = await request(app).delete("/players/p1");
    expect(res.status).toBe(204);
  });

  it("DELETE /players/:playerId handles database error", async () => {
    // Mock the chain: .delete().eq()
    mockEq.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).delete("/players/p1");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to delete player" });
  });

  // --- Matches ---
  it("GET /teams/:teamId/matches returns matches", async () => {
    // Mock the chain: .select().eq().order()
    mockOrder.mockResolvedValue({ data: [{ id: "m1", opponent_name: "Opp" }], error: null });
    const res = await request(app).get("/teams/team1/matches");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "m1", opponent_name: "Opp" }]);
  });

  it("GET /teams/:teamId/matches handles database error", async () => {
    // Mock the chain: .select().eq().order()
    mockOrder.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).get("/teams/team1/matches");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch matches" });
  });

  it("POST /teams/:teamId/matches creates match", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "m1", opponent_name: "Opponent", date: "2024-01-01" },
      error: null,
    });
    const res = await request(app)
      .post("/teams/team1/matches")
      .send({ opponent_name: "Opponent", date: "2024-01-01" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "m1", opponent_name: "Opponent", date: "2024-01-01" });
  });

  it("POST /teams/:teamId/matches validates required fields", async () => {
    const res = await request(app).post("/teams/team1/matches").send({ opponent_name: "Opponent" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "opponent_name and date are required" });
  });

  it("POST /teams/:teamId/matches validates opponent_name field", async () => {
    const res = await request(app).post("/teams/team1/matches").send({ date: "2024-01-01" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "opponent_name and date are required" });
  });

  it("POST /teams/:teamId/matches handles database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app)
      .post("/teams/team1/matches")
      .send({ opponent_name: "Opponent", date: "2024-01-01" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create match" });
  });

  it("PUT /matches/:matchId updates match", async () => {
    mockSingle.mockResolvedValue({ data: { id: "m1", opponent_name: "Updated Opp" }, error: null });
    const res = await request(app).put("/matches/m1").send({ opponent_name: "Updated Opp" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "m1", opponent_name: "Updated Opp" });
  });

  it("PUT /matches/:matchId handles database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).put("/matches/m1").send({ opponent_name: "Updated Opp" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to update match" });
  });

  it("DELETE /matches/:matchId deletes match", async () => {
    mockDelete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const res = await request(app).delete("/matches/m1");
    expect(res.status).toBe(204);
  });

  it("DELETE /matches/:matchId handles database error", async () => {
    // Mock the chain: .delete().eq()
    mockEq.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).delete("/matches/m1");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to delete match" });
  });

  // --- Match Events ---
  it("GET /matches/:matchId/events returns events", async () => {
    // Mock the chain: .select().eq().order()
    mockOrder.mockResolvedValue({ data: [{ id: "e1", type: "goal" }], error: null });
    const res = await request(app).get("/matches/m1/events");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "e1", type: "goal" }]);
  });

  it("GET /matches/:matchId/events handles database error", async () => {
    // Mock the chain: .select().eq().order()
    mockOrder.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).get("/matches/m1/events");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch events" });
  });

  it("POST /matches/:matchId/events creates event", async () => {
    mockSingle.mockResolvedValue({ data: { id: "e1", event_type: "goal" }, error: null });
    const res = await request(app).post("/matches/m1/events").send({ 
      player_id: "p1", 
      event_type: "goal" 
    });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "e1", event_type: "goal" });
  });

  it("POST /matches/:matchId/events validates required fields", async () => {
    const res = await request(app).post("/matches/m1/events").send({ player_id: "p1" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "player_id and event_type are required" });
  });

  it("POST /matches/:matchId/events validates player_id field", async () => {
    const res = await request(app).post("/matches/m1/events").send({ event_type: "goal" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "player_id and event_type are required" });
  });

  it("POST /matches/:matchId/events handles database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).post("/matches/m1/events").send({ 
      player_id: "p1", 
      event_type: "goal" 
    });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create event" });
  });

  it("DELETE /events/:eventId deletes event", async () => {
    mockDelete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const res = await request(app).delete("/events/e1");
    expect(res.status).toBe(204);
  });

  it("DELETE /events/:eventId handles database error", async () => {
    // Mock the chain: .delete().eq()
    mockEq.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).delete("/events/e1");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to delete event" });
  });

  // --- Team Summary ---
  it("GET /teams/:teamId/summary returns team summary", async () => {
    // Mock the chain: .select().eq()
    mockEq.mockResolvedValue({ 
      data: [
        { team_score: 2, opponent_score: 1, shots: 15, shots_on_target: 8, possession: 60, corners: 5, fouls: 12, offsides: 2, xg: 1.8, passes: 450, pass_accuracy: 85, tackles: 20, saves: 3 },
        { team_score: 1, opponent_score: 0, shots: 12, shots_on_target: 5, possession: 55, corners: 3, fouls: 8, offsides: 1, xg: 1.2, passes: 380, pass_accuracy: 82, tackles: 15, saves: 2 }
      ], 
      error: null 
    });
    const res = await request(app).get("/teams/team1/summary");
    expect(res.status).toBe(200);
    expect(res.body.goals_for).toBe(3);
    expect(res.body.goals_against).toBe(1);
    expect(res.body.possession_avg).toBe(58); // (60+55)/2 = 57.5, rounded to 58
    expect(res.body.pass_accuracy_avg).toBe(84); // (85+82)/2 = 83.5, rounded to 84
  });

  it("GET /teams/:teamId/summary handles empty data", async () => {
    // Mock the chain: .select().eq()
    mockEq.mockResolvedValue({ data: [], error: null });
    const res = await request(app).get("/teams/team1/summary");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it("GET /teams/:teamId/summary handles null data", async () => {
    // Mock the chain: .select().eq()
    mockEq.mockResolvedValue({ data: null, error: null });
    const res = await request(app).get("/teams/team1/summary");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it("GET /teams/:teamId/summary handles database error", async () => {
    // Mock the chain: .select().eq()
    mockEq.mockResolvedValue({ data: null, error: new Error("DB error") });
    const res = await request(app).get("/teams/team1/summary");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch summary" });
  });

  it("GET /teams/:teamId/summary calculates averages with some null values", async () => {
    // Mock the chain: .select().eq()
    mockEq.mockResolvedValue({ 
      data: [
        { team_score: 2, opponent_score: 1, possession: 60, pass_accuracy: 85 },
        { team_score: 1, opponent_score: 0, possession: null, pass_accuracy: null },
        { team_score: 0, opponent_score: 2, possession: 50, pass_accuracy: 80 }
      ], 
      error: null 
    });
    const res = await request(app).get("/teams/team1/summary");
    expect(res.status).toBe(200);
    expect(res.body.possession_avg).toBe(55); // (60+50)/2 = 55
    expect(res.body.pass_accuracy_avg).toBe(83); // (85+80)/2 = 82.5, rounded to 83
  });
});