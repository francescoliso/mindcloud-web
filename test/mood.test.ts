import { describe, it, expect } from "vitest";
import { moodLabel, MOODS } from "@/lib/mood";

describe("moodLabel", () => {
  it("maps each score to its label", () => {
    expect(moodLabel(1)).toBe("Struggling");
    expect(moodLabel(3)).toBe("Okay");
    expect(moodLabel(5)).toBe("Great");
  });

  it("returns Unknown for out-of-range scores", () => {
    expect(moodLabel(0)).toBe("Unknown");
    expect(moodLabel(6)).toBe("Unknown");
  });

  it("has exactly five moods, scored 1..5", () => {
    expect(MOODS.map((m) => m.score)).toEqual([1, 2, 3, 4, 5]);
  });
});
