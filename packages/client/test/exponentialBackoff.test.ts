import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { exponentialBackoffFullJitter } from "../src/api";

describe("exponentialBackoffFullJitter", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("boundary behavior with Math.random pinned", () => {
    test("returns minDelayMs when Math.random returns 0", () => {
      vi.mocked(Math.random).mockReturnValue(0);

      const result = exponentialBackoffFullJitter(1, {
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
      });

      // floor = 250 (default minDelayMs), jitterRange = 1000 - 250 = 750
      // 250 + floor(0 * 750) = 250
      expect(result).toBe(250);
    });

    test("returns near exponential ceiling when Math.random approaches 1", () => {
      vi.mocked(Math.random).mockReturnValue(0.999);

      const result = exponentialBackoffFullJitter(1, {
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
      });

      // floor = 250, jitterRange = 1000 - 250 = 750
      // 250 + floor(0.999 * 750) = 250 + 749 = 999
      expect(result).toBe(999);
    });
  });

  describe("exponential growth", () => {
    test("doubles the ceiling on each successive try", () => {
      vi.mocked(Math.random).mockReturnValue(0.999);

      const opts = { baseDelayMs: 1000, maxDelayMs: 60_000 };

      // With random pinned near 1, the result approaches the exponential ceiling.
      // ceiling = min(maxDelay, base * 2^(tries-1))
      // result ≈ ceiling (minus 1 due to floor)
      const try1 = exponentialBackoffFullJitter(1, opts); // ceiling: 1000
      const try2 = exponentialBackoffFullJitter(2, opts); // ceiling: 2000
      const try3 = exponentialBackoffFullJitter(3, opts); // ceiling: 4000
      const try4 = exponentialBackoffFullJitter(4, opts); // ceiling: 8000

      expect(try2).toBeGreaterThan(try1);
      expect(try3).toBeGreaterThan(try2);
      expect(try4).toBeGreaterThan(try3);

      // Verify approximate doubling (result = minDelay + floor(0.999 * (ceiling - minDelay)))
      // try1 ≈ 999, try2 ≈ 1999, try3 ≈ 3999, try4 ≈ 7999
      expect(try2).toBeCloseTo(try1 * 2, -2);
      expect(try3).toBeCloseTo(try2 * 2, -2);
    });
  });

  describe("caps at maxDelayMs", () => {
    test("never exceeds maxDelayMs regardless of tries", () => {
      vi.mocked(Math.random).mockReturnValue(0.999);

      const result = exponentialBackoffFullJitter(100, {
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
      });

      expect(result).toBeLessThanOrEqual(30_000);
    });

    test("reaches the cap and stays there", () => {
      vi.mocked(Math.random).mockReturnValue(0.999);

      const opts = { baseDelayMs: 1000, maxDelayMs: 10_000 };

      // Try 4: ceiling = min(10000, 1000 * 8) = 8000
      // Try 5: ceiling = min(10000, 1000 * 16) = 10000 (capped)
      // Try 6: ceiling = min(10000, 1000 * 32) = 10000 (still capped)
      const try5 = exponentialBackoffFullJitter(5, opts);
      const try6 = exponentialBackoffFullJitter(6, opts);

      expect(try5).toBe(try6);
    });
  });

  describe("minDelayMs floor", () => {
    test("uses default minDelayMs of 250 when not specified", () => {
      vi.mocked(Math.random).mockReturnValue(0);

      const result = exponentialBackoffFullJitter(1, {
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
      });

      expect(result).toBe(250);
    });

    test("respects custom minDelayMs", () => {
      vi.mocked(Math.random).mockReturnValue(0);

      const result = exponentialBackoffFullJitter(1, {
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
        minDelayMs: 500,
      });

      expect(result).toBe(500);
    });

    test("returns minDelayMs when exponentialDelay is less than or equal to minDelayMs", () => {
      // baseDelayMs of 100, try 1: ceiling = 100, which is < default minDelayMs of 250
      const result = exponentialBackoffFullJitter(1, {
        baseDelayMs: 100,
        maxDelayMs: 30_000,
      });

      expect(result).toBe(250);
    });
  });

  describe("jitter distribution properties", () => {
    test("result is always >= minDelayMs", () => {
      const opts = { baseDelayMs: 1000, maxDelayMs: 30_000 };

      for (let i = 0; i < 100; i++) {
        const result = exponentialBackoffFullJitter(3, opts);
        expect(result).toBeGreaterThanOrEqual(250);
      }
    });

    test("result is always <= maxDelayMs", () => {
      const opts = { baseDelayMs: 1000, maxDelayMs: 30_000 };

      for (let i = 0; i < 100; i++) {
        const result = exponentialBackoffFullJitter(100, opts);
        expect(result).toBeLessThanOrEqual(30_000);
      }
    });

    test("result is always an integer", () => {
      const opts = { baseDelayMs: 1000, maxDelayMs: 30_000 };

      for (let i = 0; i < 100; i++) {
        const result = exponentialBackoffFullJitter(3, opts);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test("produces varied values across invocations (not deterministic)", () => {
      const opts = { baseDelayMs: 1000, maxDelayMs: 30_000 };
      const results = new Set<number>();

      for (let i = 0; i < 50; i++) {
        results.add(exponentialBackoffFullJitter(3, opts));
      }

      // With real Math.random, 50 calls should produce more than 1 unique value
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("edge cases", () => {
    test("handles tries = 0 gracefully", () => {
      vi.mocked(Math.random).mockReturnValue(0.5);

      const result = exponentialBackoffFullJitter(0, {
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
      });

      // Math.max(0, 0-1) = 0, so ceiling = 1000 * 2^0 = 1000
      expect(result).toBeGreaterThanOrEqual(250);
      expect(result).toBeLessThanOrEqual(1000);
    });

    test("handles negative tries gracefully", () => {
      vi.mocked(Math.random).mockReturnValue(0.5);

      const result = exponentialBackoffFullJitter(-1, {
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
      });

      // Math.max(0, -1-1) = 0, so ceiling = 1000 * 2^0 = 1000
      expect(result).toBeGreaterThanOrEqual(250);
      expect(result).toBeLessThanOrEqual(1000);
    });

    test("handles very large tries without overflow issues", () => {
      vi.mocked(Math.random).mockReturnValue(0.5);

      const result = exponentialBackoffFullJitter(1000, {
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
      });

      // Should be capped at maxDelayMs even with huge exponent
      expect(result).toBeGreaterThanOrEqual(250);
      expect(result).toBeLessThanOrEqual(30_000);
    });
  });
});
