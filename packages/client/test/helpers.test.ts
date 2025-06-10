// @vitest-environment node
import { describe, expect, test } from "vitest";

import { isValidUuid } from "../src/helpers";

/**
 * Helper Functions Test Suite
 *
 * Tests utility functions used throughout the client for data validation,
 * formatting, and other common operations.
 */
describe("Helper Functions", () => {
  describe("UUID Validation", () => {
    describe("isValidUuid function", () => {
      test("validates standard UUID v4 format", () => {
        const validUuids = [
          "123e4567-e89b-12d3-a456-426614174000",
          "987fcdeb-51a2-34b5-c678-901234567890",
          "550e8400-e29b-41d4-a716-446655440000",
          "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // UUID v1
          "6ba7b811-9dad-11d1-80b4-00c04fd430c8", // Another valid UUID
        ];

        validUuids.forEach((uuid) => {
          expect(isValidUuid(uuid)).toBe(true);
        });
      });

      test("rejects invalid UUID formats", () => {
        const invalidUuids = [
          "", // empty string
          "not-a-uuid", // random string
          "123e4567-e89b-12d3-a456", // incomplete UUID
          "123e4567-e89b-12d3-a456-42661417400g", // invalid character
          "123e4567-e89b-12d3-a456_426614174000", // invalid separator
          "123e4567e89b12d3a456426614174000", // no separators
          "123e4567-e89b-12d3-a456-426614174000-extra", // too long
          "g23e4567-e89b-12d3-a456-426614174000", // invalid hex character
        ];

        invalidUuids.forEach((uuid) => {
          expect(isValidUuid(uuid)).toBe(false);
        });
      });

      test("handles edge cases and special inputs", () => {
        // Test null and undefined
        expect(isValidUuid(null as any)).toBe(false);
        expect(isValidUuid(undefined as any)).toBe(false);

        // Test numbers and objects
        expect(isValidUuid(123 as any)).toBe(false);
        expect(isValidUuid({} as any)).toBe(false);
        expect(isValidUuid([] as any)).toBe(false);

        // Test whitespace
        expect(isValidUuid("  123e4567-e89b-12d3-a456-426614174000  ")).toBe(
          false,
        );
        expect(isValidUuid("\n123e4567-e89b-12d3-a456-426614174000\n")).toBe(
          false,
        );
      });

      test("validates UUID case sensitivity", () => {
        const mixedCaseUuids = [
          "123E4567-e89b-12d3-a456-426614174000", // uppercase hex
          "123e4567-E89B-12d3-a456-426614174000", // mixed case
          "123e4567-e89b-12D3-A456-426614174000", // mixed case
        ];

        mixedCaseUuids.forEach((uuid) => {
          // UUIDs should be valid regardless of case
          expect(isValidUuid(uuid)).toBe(true);
        });
      });

      test("validates exact length requirements", () => {
        const exactLength = "123e4567-e89b-12d3-a456-426614174000";
        expect(exactLength).toHaveLength(36); // Standard UUID length
        expect(isValidUuid(exactLength)).toBe(true);

        // Test length variations
        expect(isValidUuid(exactLength.slice(0, 35))).toBe(false); // too short
        expect(isValidUuid(exactLength + "0")).toBe(false); // too long
      });

      test("validates proper hyphen placement", () => {
        // Test with hyphens in wrong positions
        const wrongHyphens = [
          "123e456-7e89b-12d3-a456-426614174000", // hyphen moved
          "123e4567e89b-12d3-a456-426614174000", // missing first hyphen
          "123e4567-e89b12d3-a456-426614174000", // missing second hyphen
          "123e4567-e89b-12d3a456-426614174000", // missing third hyphen
          "123e4567-e89b-12d3-a456426614174000", // missing fourth hyphen
        ];

        wrongHyphens.forEach((uuid) => {
          expect(isValidUuid(uuid)).toBe(false);
        });
      });
    });
  });

  describe("Future Helper Functions", () => {
    test("helper module is extensible", async () => {
      // Verify the helpers module can be imported and extended
      expect(isValidUuid).toBeDefined();
      expect(typeof isValidUuid).toBe("function");

      // This test ensures the module structure supports adding more helpers
      const helpers = await import("../src/helpers.js");
      expect(helpers).toBeDefined();
      expect(helpers.isValidUuid).toBe(isValidUuid);
    });
  });
});
