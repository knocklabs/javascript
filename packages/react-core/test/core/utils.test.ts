import { describe, test, expect } from "vitest";
import { formatBadgeCount } from "../../src";

describe("formatBadgeCount", () => {
  test("returns count when count is less than 10", () => {
    expect(formatBadgeCount(9)).toBe(9);
    expect(formatBadgeCount(5)).toBe(5);
    expect(formatBadgeCount(0)).toBe(0);
  });

  test("returns 9+ when count is greater than 9", () => {
    expect(formatBadgeCount(10)).toBe("9+");
    expect(formatBadgeCount(100)).toBe("9+");
  });
});
