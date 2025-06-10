// @vitest-environment node
import { describe, expect, test } from "vitest";

import { NetworkStatus, isRequestInFlight } from "../src/networkStatus";

/**
 * Network Status Test Suite
 *
 * Tests the network status enums and utility functions used throughout
 * the client for tracking request states and loading indicators.
 */
describe("Network Status", () => {
  describe("NetworkStatus Constants", () => {
    test("defines all required status values", () => {
      expect(NetworkStatus.loading).toBe("loading");
      expect(NetworkStatus.fetchMore).toBe("fetchMore");
      expect(NetworkStatus.ready).toBe("ready");
      expect(NetworkStatus.error).toBe("error");
    });

    test("maintains consistent typing", () => {
      // Verify all values are strings
      expect(typeof NetworkStatus.loading).toBe("string");
      expect(typeof NetworkStatus.fetchMore).toBe("string");
      expect(typeof NetworkStatus.ready).toBe("string");
      expect(typeof NetworkStatus.error).toBe("string");
    });

    test("provides comprehensive status coverage", () => {
      const allStatuses = Object.values(NetworkStatus);
      expect(allStatuses).toHaveLength(4);
      expect(allStatuses).toContain("loading");
      expect(allStatuses).toContain("fetchMore");
      expect(allStatuses).toContain("ready");
      expect(allStatuses).toContain("error");
    });
  });

  describe("Request Flight Detection", () => {
    describe("isRequestInFlight utility", () => {
      test("correctly identifies loading states as in-flight", () => {
        expect(isRequestInFlight(NetworkStatus.loading)).toBe(true);
        expect(isRequestInFlight(NetworkStatus.fetchMore)).toBe(true);
      });

      test("correctly identifies non-loading states as not in-flight", () => {
        expect(isRequestInFlight(NetworkStatus.ready)).toBe(false);
        expect(isRequestInFlight(NetworkStatus.error)).toBe(false);
      });

      test("handles edge cases gracefully", () => {
        // Test with undefined/null (should be false)
        expect(isRequestInFlight(undefined as unknown as NetworkStatus)).toBe(
          false,
        );
        expect(isRequestInFlight(null as unknown as NetworkStatus)).toBe(false);

        // Test with invalid string values
        expect(isRequestInFlight("invalid" as unknown as NetworkStatus)).toBe(
          false,
        );
        expect(isRequestInFlight("" as unknown as NetworkStatus)).toBe(false);
      });
    });
  });

  describe("State Transitions", () => {
    test("supports logical state progression", () => {
      // Simulate typical state flow
      let currentStatus = NetworkStatus.ready;
      expect(isRequestInFlight(currentStatus)).toBe(false);

      // Start loading
      currentStatus = NetworkStatus.loading;
      expect(isRequestInFlight(currentStatus)).toBe(true);

      // Complete successfully
      currentStatus = NetworkStatus.ready;
      expect(isRequestInFlight(currentStatus)).toBe(false);

      // Load more data
      currentStatus = NetworkStatus.fetchMore;
      expect(isRequestInFlight(currentStatus)).toBe(true);

      // Complete or error
      currentStatus = NetworkStatus.error;
      expect(isRequestInFlight(currentStatus)).toBe(false);
    });

    test("differentiates between loading types", () => {
      // Initial load vs pagination load
      expect(NetworkStatus.loading).not.toBe(NetworkStatus.fetchMore);

      // Both should be considered "in flight" but serve different purposes
      expect(isRequestInFlight(NetworkStatus.loading)).toBe(true);
      expect(isRequestInFlight(NetworkStatus.fetchMore)).toBe(true);
    });
  });
});
