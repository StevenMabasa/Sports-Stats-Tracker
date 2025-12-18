import { describe, it, expect } from "vitest";
import { calculateTeamStats } from "../pages/coachDashboard/coachStatsPage/team-stats-helper";
import type { Match } from "../types";

const baseMatch: Omit<Match, "id" | "teamScore" | "opponentScore"> = {
  teamId: "team-1",
  opponentName: "Opponent",
  date: "2025-09-20",
  status: "completed",
};

describe("calculateTeamStats", () => {
  it("returns null when no matches provided", () => {
    expect(calculateTeamStats([])).toBeNull();
  });

  it("calculates basic win/draw/loss stats", () => {
    const matches: Match[] = [
      { ...baseMatch, id: "1", teamScore: 2, opponentScore: 1 },
      { ...baseMatch, id: "2", teamScore: 1, opponentScore: 1 },
      { ...baseMatch, id: "3", teamScore: 0, opponentScore: 2 },
    ];

    const stats = calculateTeamStats(matches)!;

    expect(stats.totalMatches).toBe(3);
    expect(stats.wins).toBe(1);
    expect(stats.draws).toBe(1);
    expect(stats.losses).toBe(1);
    expect(stats.winPercentage).toBe(Math.round((1 / 3) * 100));
  });

  it("aggregates goals and goal difference", () => {
    const matches: Match[] = [
      { ...baseMatch, id: "1", teamScore: 3, opponentScore: 1 },
      { ...baseMatch, id: "2", teamScore: 0, opponentScore: 2 },
    ];

    const stats = calculateTeamStats(matches)!;

    expect(stats.goalsFor).toBe(3);
    expect(stats.goalsAgainst).toBe(3);
    expect(stats.goalDifference).toBe(0);
    expect(stats.avgGoalsFor).toBe("1.50");
    expect(stats.avgGoalsAgainst).toBe("1.50");
  });

  it("aggregates advanced stats (shots, passes, etc.)", () => {
    const matches: Match[] = [
      {
        ...baseMatch,
        id: "1",
        teamScore: 2,
        opponentScore: 1,
        shots: 10,
        possession: 60,
        fouls: 5,
        shotsOnTarget: 6,
        corners: 4,
        offsides: 2,
        passes: 300,
        passAccuracy: 85,
        tackles: 10,
        saves: 3,
      },
      {
        ...baseMatch,
        id: "2",
        teamScore: 1,
        opponentScore: 2,
        shots: 8,
        possession: 55,
        fouls: 7,
        shotsOnTarget: 3,
        corners: 6,
        offsides: 1,
        passes: 250,
        passAccuracy: 80,
        tackles: 12,
        saves: 4,
      },
    ];

    const stats = calculateTeamStats(matches)!;

    expect(stats.totalShots).toBe(18);
    expect(stats.avgPossession).toBe(Math.round((60 + 55) / 2));
    expect(stats.totalFouls).toBe(12);
    expect(stats.avgFouls).toBe("6.00");
    expect(stats.totalShotsOnTarget).toBe(9);
    expect(stats.avgShotsOnTarget).toBe("4.50");
    expect(stats.avgCorners).toBe("5.00");
    expect(stats.avgOffsides).toBe("1.50");
    expect(stats.totalPasses).toBe(550);
    expect(stats.avgPasses).toBe("275.00");
    expect(stats.avgPassAccuracy).toBe("82.50");
    expect(stats.totalTackles).toBe(22);
    expect(stats.avgTackles).toBe("11.00");
    expect(stats.avgSaves).toBe("3.50");
  });

  it("computes form correctly (last 5 matches)", () => {
    const matches: Match[] = [
      { ...baseMatch, id: "1", teamScore: 2, opponentScore: 1 }, // W
      { ...baseMatch, id: "2", teamScore: 0, opponentScore: 0 }, // D
      { ...baseMatch, id: "3", teamScore: 1, opponentScore: 3 }, // L
      { ...baseMatch, id: "4", teamScore: 4, opponentScore: 2 }, // W
      { ...baseMatch, id: "5", teamScore: 1, opponentScore: 2 }, // L
      { ...baseMatch, id: "6", teamScore: 2, opponentScore: 2 }, // D
    ];

    const stats = calculateTeamStats(matches)!;

    expect(stats.form).toEqual(["W", "D", "L", "W", "L"]);
  });
});
