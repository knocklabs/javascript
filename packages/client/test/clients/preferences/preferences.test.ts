// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import PreferencesClient from "../../../src/clients/preferences";
import Knock from "../../../src/knock";
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

/**
 * Modern Preferences Client Test Suite
 *
 * This test suite demonstrates modern testing practices including:
 * - User journey-focused test organization
 * - Realistic mock behavior
 * - Comprehensive error scenario testing
 * - Authentication lifecycle testing
 * - Proper cleanup and resource management
 */
describe("Preferences Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Getting Preferences", () => {
    test("fetches user preferences successfully", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const mockPreferences = {
        categories: {
          marketing: true,
          security: false,
        },
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: mockPreferences,
      });

      const client = new PreferencesClient(knock);
      const result = await client.get();

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/users/user_123/preferences/default",
      });
      expect(result).toEqual(mockPreferences);
    });

    test("requires authentication", async () => {
      const { knock } = createMockKnock();

      const client = new PreferencesClient(knock);

      await expect(client.get()).rejects.toThrow(
        "Not authenticated. Please call `authenticate` first.",
      );
    });
  });

  describe("Setting Preferences", () => {
    test("updates user preferences successfully", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const preferences = {
        channel_types: {
          email: true,
          in_app_feed: false,
        },
        workflows: {},
        categories: {
          marketing: {
            channel_types: {
              email: false,
            },
          },
          security: {
            channel_types: {
              email: true,
            },
          },
        },
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: preferences,
      });

      const client = new PreferencesClient(knock);
      const result = await client.set(preferences);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default",
        data: preferences,
      });
      expect(result).toEqual(preferences);
    });

    test("handles preference update errors", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: "Invalid preferences",
      });

      const client = new PreferencesClient(knock);

      await expect(
        client.set({
          channel_types: {},
          workflows: {},
          categories: {},
        }),
      ).rejects.toThrow("Invalid preferences");
    });
  });

  describe("Error Handling", () => {
    test("handles network errors gracefully", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockRejectedValue(new Error("Network error"));

      const client = new PreferencesClient(knock);

      await expect(client.get()).rejects.toThrow("Network error");
    });
  });
});
