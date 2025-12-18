// createPositionDefaultStats.test.ts
import { describe, it, expect } from "vitest";
import { createPositionDefaultStats } from "../types";

describe("createPositionDefaultStats", () => {
  it("should return default stats with zeros for any position", () => {
    const stats = createPositionDefaultStats("STR");

    expect(stats.goals).toBe(0);
    expect(stats.assists).toBe(0);
    expect(stats.tackles).toBe(0);
    expect(stats.saves).toBe(0);
    expect(stats.performanceData).toEqual([0, 0, 0, 0, 0]);
  });

  it("should not change defaults based on position", () => {
    const gkStats = createPositionDefaultStats("GK");
    const defStats = createPositionDefaultStats("DEF");

    expect(gkStats).toEqual(defStats);
  });
});
