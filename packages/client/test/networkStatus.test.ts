// @vitest-environment node
import { describe, expect, test } from "vitest";

import { NetworkStatus, isRequestInFlight } from "../src/networkStatus";

describe("networkStatus", () => {
  describe("NetworkStatus enum", () => {
    test("has the correct values", () => {
      expect(NetworkStatus.loading).toBe("loading");
      expect(NetworkStatus.fetchMore).toBe("fetchMore");
      expect(NetworkStatus.ready).toBe("ready");
      expect(NetworkStatus.error).toBe("error");
    });
  });

  describe("isRequestInFlight", () => {
    test("returns true for loading status", () => {
      expect(isRequestInFlight(NetworkStatus.loading)).toBe(true);
    });

    test("returns true for fetchMore status", () => {
      expect(isRequestInFlight(NetworkStatus.fetchMore)).toBe(true);
    });

    test("returns false for ready status", () => {
      expect(isRequestInFlight(NetworkStatus.ready)).toBe(false);
    });

    test("returns false for error status", () => {
      expect(isRequestInFlight(NetworkStatus.error)).toBe(false);
    });
  });
});
