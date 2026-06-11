import { describe, it, expect } from "vitest";
import { weekStart, dayStart, localDateOnlyUTC, toDateOnly } from "@/lib/week";

describe("weekStart", () => {
  it("returns the Monday of the week for a mid-week date", () => {
    // Wed 2026-06-10
    const monday = weekStart(new Date(2026, 5, 10, 15, 30));
    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getDate()).toBe(8);
    expect(monday.getHours()).toBe(0);
  });

  it("treats Sunday as the end of the week, not the start", () => {
    // Sun 2026-06-14 → Monday should be 2026-06-08
    const monday = weekStart(new Date(2026, 5, 14));
    expect(monday.getDate()).toBe(8);
  });

  it("returns the same day when given a Monday", () => {
    const monday = weekStart(new Date(2026, 5, 8, 9));
    expect(monday.getDate()).toBe(8);
  });
});

describe("dayStart", () => {
  it("zeroes the time", () => {
    const d = dayStart(new Date(2026, 5, 10, 23, 59, 59));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});

describe("localDateOnlyUTC", () => {
  it("maps the local calendar day to UTC midnight", () => {
    const d = localDateOnlyUTC(new Date(2026, 5, 10, 23, 0));
    expect(d.toISOString()).toBe("2026-06-10T00:00:00.000Z");
  });
});

describe("toDateOnly", () => {
  it("formats yyyy-MM-dd with zero padding", () => {
    expect(toDateOnly(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
