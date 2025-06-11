import { describe, expect, test } from "vitest";

import Knock, { Feed, FeedClient } from "../src/index";

/**
 * Package Exports Test Suite
 *
 * Verifies that all public API exports are available and properly typed.
 * This ensures the package interface remains stable and accessible.
 */
describe("Package Exports", () => {
  describe("Primary Exports", () => {
    test("exports Knock as default export", () => {
      expect(Knock).toBeDefined();
      expect(typeof Knock).toBe("function");
      expect(Knock.name).toBe("Knock");
    });

    test("exports Feed named export", () => {
      expect(Feed).toBeDefined();
      expect(typeof Feed).toBe("function");
      expect(Feed.name).toBe("Feed");
    });

    test("exports FeedClient named export", () => {
      expect(FeedClient).toBeDefined();
      expect(typeof FeedClient).toBe("function");
      expect(FeedClient.name).toBe("FeedClient");
    });
  });

  describe("Constructor Functionality", () => {
    test("can create Knock instance from default export", () => {
      const knock = new Knock("pk_test_12345");
      expect(knock).toBeInstanceOf(Knock);
      expect(knock.apiKey).toBe("pk_test_12345");
    });

    test("can create FeedClient instance", () => {
      const knock = new Knock("pk_test_12345");
      const feedClient = new FeedClient(knock);
      expect(feedClient).toBeInstanceOf(FeedClient);
    });

    test("maintains proper inheritance relationships", () => {
      const knock = new Knock("pk_test_12345");
      const feedClient = new FeedClient(knock);

      // Verify the instances are properly constructed
      expect(knock.constructor).toBe(Knock);
      expect(feedClient.constructor).toBe(FeedClient);
    });
  });

  describe("Export Consistency", () => {
    test("all exports are accessible", () => {
      // Verify no exports are undefined or null
      expect(Knock).not.toBeUndefined();
      expect(Knock).not.toBeNull();
      expect(Feed).not.toBeUndefined();
      expect(Feed).not.toBeNull();
      expect(FeedClient).not.toBeUndefined();
      expect(FeedClient).not.toBeNull();
    });

    test("exports can be destructured properly", async () => {
      // Test that destructuring works as expected
      const exports = await import("../src/index.js");
      const { Feed: DestructuredFeed, FeedClient: DestructuredFeedClient } =
        exports;

      expect(DestructuredFeed).toBe(Feed);
      expect(DestructuredFeedClient).toBe(FeedClient);
      expect(exports.default).toBe(Knock);
    });
  });
});
