// @vitest-environment node
import { describe, expect, test } from "vitest";

import { isValidUuid } from "../src/helpers";

describe("helpers", () => {
  describe("isValidUuid", () => {
    test("returns true for valid UUIDs", () => {
      const validUuids = [
        "123e4567-e89b-12d3-a456-426614174000",
        "987fcdeb-51a2-34b5-c678-901234567890",
        "550e8400-e29b-41d4-a716-446655440000",
      ];

      validUuids.forEach((uuid) => {
        expect(isValidUuid(uuid)).toBe(true);
      });
    });

    test("returns false for invalid UUIDs", () => {
      const invalidUuids = [
        "", // empty string
        "not-a-uuid", // random string
        "123e4567-e89b-12d3-a456", // incomplete UUID
        "123e4567-e89b-12d3-a456-42661417400g", // invalid character
        "123e4567-e89b-12d3-a456_426614174000", // invalid separator
        "123e4567e89b12d3a456426614174000", // no separators
      ];

      invalidUuids.forEach((uuid) => {
        expect(isValidUuid(uuid)).toBe(false);
      });
    });
  });
});
