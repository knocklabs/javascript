import { describe, expect, test, vi } from "vitest";

import {
  isValidHttpUrl,
  maybeNavigateToUrlWithDelay,
} from "../../src/modules/guide/components/helpers";

describe("guide helpers", () => {
  test("isValidHttpUrl correctly validates", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://foo.bar")).toBe(true);
    expect(isValidHttpUrl("ftp://invalid.com")).toBe(false);
    expect(isValidHttpUrl("not-a-url")).toBe(false);
  });

  test("maybeNavigateToUrlWithDelay schedules navigation for valid url", () => {
    vi.useFakeTimers();
    const assignSpy = vi.fn();
    const originalLocation = window.location;
    // Override
    (
      globalThis as unknown as {
        location: Location & { assign: (url: string) => void };
      }
    ).location = { ...originalLocation, assign: assignSpy };

    maybeNavigateToUrlWithDelay("https://example.com", 100);

    // nothing yet
    expect(assignSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(assignSpy).toHaveBeenCalledWith("https://example.com");

    (globalThis as unknown as { location: Location }).location =
      originalLocation;
    vi.useRealTimers();
  });
});
