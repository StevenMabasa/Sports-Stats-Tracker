import { describe, it, expect } from "vitest";
import supabase from "../../supabaseClient";

describe("supabaseClient", () => {
  it("should export a Supabase client object", () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase).toBe("object");
  });
});
