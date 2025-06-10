// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Preferences from "../../../src/clients/preferences";
import type {
  PreferenceSet,
  WorkflowPreferenceSetting,
} from "../../../src/clients/preferences/interfaces";
import { setupKnockTest, useTestHooks } from "../../test-utils/test-setup";

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
  const getTestSetup = useTestHooks(() => setupKnockTest());

  const mockPreferenceSet: PreferenceSet = {
    id: "default",
    channel_types: {
      in_app_feed: true,
      email: false,
    },
    workflows: {
      onboarding: {
        channel_types: {
          in_app_feed: true,
          email: false,
        },
      },
    },
    categories: {
      marketing: {
        channel_types: {
          in_app_feed: true,
          email: false,
        },
      },
    },
  };

  describe("Preference Set Management", () => {
    describe("Getting Preference Sets", () => {
      test("fetches all preference sets successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: [mockPreferenceSet],
          });

          const client = new Preferences(knock);
          const result = await client.getAll();

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/users/user_123/preferences",
          });
          expect(result).toEqual([mockPreferenceSet]);
        } finally {
          cleanup();
        }
      });

      test("fetches a specific preference set", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          const result = await client.get({ preferenceSet: "default" });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/users/user_123/preferences/default",
          });
          expect(result).toEqual(mockPreferenceSet);
        } finally {
          cleanup();
        }
      });

      test("fetches preference set with tenant context", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.get({
            preferenceSet: "tenant_specific",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/users/user_123/preferences/tenant_specific",
          });
        } finally {
          cleanup();
        }
      });

      test("handles empty preference sets gracefully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: [],
          });

          const client = new Preferences(knock);
          const result = await client.getAll();

          expect(result).toEqual([]);
        } finally {
          cleanup();
        }
      });
    });

    describe("Setting Preferences", () => {
      test("updates a complete preference set", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const preferences = {
            channel_types: {
              in_app_feed: true,
              email: false,
            },
            workflows: {
              onboarding: {
                channel_types: {
                  in_app_feed: true,
                  email: false,
                },
              },
            },
            categories: {
              marketing: {
                channel_types: {
                  in_app_feed: true,
                  email: false,
                },
              },
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.set(preferences, { preferenceSet: "default" });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/default",
            data: preferences,
          });
        } finally {
          cleanup();
        }
      });

      test("handles complex workflow preferences", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const complexPreferences = {
            channel_types: {
              in_app_feed: true,
              email: true,
              sms: false,
              push: true,
            },
            workflows: {
              welcome_series: {
                channel_types: { email: true, sms: false },
              },
              weekly_digest: false, // Boolean workflow preference
              urgent_alerts: {
                channel_types: { sms: true, push: true },
              },
            },
            categories: {
              marketing: {
                channel_types: { email: false },
              },
              security: {
                channel_types: { email: true, sms: true },
              },
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: complexPreferences,
          });

          const client = new Preferences(knock);
          await client.set(complexPreferences, {
            preferenceSet: "comprehensive",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/comprehensive",
            data: complexPreferences,
          });
        } finally {
          cleanup();
        }
      });
    });
  });

  describe("Channel Type Preferences", () => {
    describe("Bulk Channel Type Updates", () => {
      test("updates multiple channel type preferences", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const channelTypes = {
            in_app_feed: true,
            email: false,
            sms: true,
            push: false,
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.setChannelTypes(channelTypes, {
            preferenceSet: "default",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/default/channel_types",
            data: channelTypes,
          });
        } finally {
          cleanup();
        }
      });

      test("handles channel type updates with tenant context", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const channelTypes = {
            email: true,
            chat: false,
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.setChannelTypes(channelTypes, {
            preferenceSet: "tenant_specific",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/tenant_specific/channel_types",
            data: channelTypes,
          });
        } finally {
          cleanup();
        }
      });
    });

    describe("Individual Channel Type Updates", () => {
      test("updates a single channel type preference", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.setChannelType("email", true, {
            preferenceSet: "default",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/default/channel_types/email",
            data: { subscribed: true },
          });
        } finally {
          cleanup();
        }
      });

      test("handles disabling channel types", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.setChannelType("sms", false, {
            preferenceSet: "marketing",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/marketing/channel_types/sms",
            data: { subscribed: false },
          });
        } finally {
          cleanup();
        }
      });
    });
  });

  describe("Workflow and Category Preferences", () => {
    describe("Workflow Management", () => {
      test("sets workflow preferences with channel type overrides", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const workflowSetting: WorkflowPreferenceSetting = {
            channel_types: {
              email: true,
              sms: false,
              push: true,
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.setWorkflow("welcome_series", workflowSetting, {
            preferenceSet: "default",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/default/workflows/welcome_series",
            data: workflowSetting,
          });
        } finally {
          cleanup();
        }
      });

      test("disables workflow completely", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.setWorkflow("marketing_emails", false, {
            preferenceSet: "default",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/default/workflows/marketing_emails",
            data: { subscribed: false },
          });
        } finally {
          cleanup();
        }
      });
    });

    describe("Category Management", () => {
      test("sets category preferences", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const categorySetting: WorkflowPreferenceSetting = {
            channel_types: {
              email: false,
              in_app_feed: true,
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.setCategory("marketing", categorySetting, {
            preferenceSet: "default",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/default/categories/marketing",
            data: categorySetting,
          });
        } finally {
          cleanup();
        }
      });

      test("handles category preference updates with tenant", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const categorySetting: WorkflowPreferenceSetting = {
            channel_types: {
              chat: true,
              email: false,
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new Preferences(knock);
          await client.setCategory("updates", categorySetting, {
            preferenceSet: "tenant_specific",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/tenant_specific/categories/updates",
            data: categorySetting,
          });
        } finally {
          cleanup();
        }
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    describe("Authentication Requirements", () => {
      test("requires authentication for all preference operations", async () => {
        const { knock, cleanup } = getTestSetup();

        try {
          const client = new Preferences(knock);

          // Test all methods require authentication
          await expect(client.getAll()).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );

          await expect(
            client.get({ preferenceSet: "default" }),
          ).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );

          await expect(
            client.set(
              {
                channel_types: { email: true },
                workflows: {},
                categories: {},
              },
              { preferenceSet: "default" },
            ),
          ).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );

          await expect(
            client.setChannelTypes(
              { email: true },
              { preferenceSet: "default" },
            ),
          ).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );

          await expect(
            client.setChannelType("email", true, { preferenceSet: "default" }),
          ).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );
        } finally {
          cleanup();
        }
      });
    });

    describe("Error Response Handling", () => {
      test("handles preference operation errors gracefully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          knock.authenticate("user_123", "test_token");

          const errorScenarios = [
            {
              error: new Error("Preference set not found"),
              expectedMessage: "Preference set not found",
            },
            {
              error: new Error("Invalid channel type"),
              expectedMessage: "Invalid channel type",
            },
            {
              error: new Error("Tenant access denied"),
              expectedMessage: "Tenant access denied",
            },
          ];

          const client = new Preferences(knock);

          for (const scenario of errorScenarios) {
            mockApiClient.makeRequest.mockResolvedValueOnce({
              statusCode: "error",
              error: scenario.error,
            });

            await expect(client.get({ preferenceSet: "test" })).rejects.toThrow(
              scenario.expectedMessage,
            );
          }
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });

      test("handles network errors during bulk operations", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          knock.authenticate("user_123", "test_token");

          const networkError = new Error("Network timeout");
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "error",
            error: networkError,
          });

          const client = new Preferences(knock);
          await expect(
            client.setChannelTypes(
              { email: true, sms: false },
              { preferenceSet: "default" },
            ),
          ).rejects.toThrow("Network timeout");
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });
    });
  });

  describe("Performance and Integration", () => {
    test("handles concurrent preference operations efficiently", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        knock.authenticate("user_123", "test_token");

        // Mock multiple successful responses
        mockApiClient.makeRequest.mockImplementation(() =>
          Promise.resolve({
            statusCode: "ok",
            body: mockPreferenceSet,
          }),
        );

        const client = new Preferences(knock);
        const startTime = Date.now();

        // Make multiple concurrent requests
        const requests = [
          client.get({ preferenceSet: "default" }),
          client.get({ preferenceSet: "marketing" }),
          client.get({ preferenceSet: "security" }),
          client.get({ preferenceSet: "notifications" }),
          client.get({ preferenceSet: "updates" }),
        ];

        const results = await Promise.all(requests);
        const endTime = Date.now();

        // All requests should succeed
        expect(results).toHaveLength(5);
        results.forEach((result) => {
          expect(result.id).toBe("default");
        });

        // Should handle concurrency efficiently
        expect(endTime - startTime).toBeLessThan(1000);
      } finally {
        cleanup();
      }
    });

    test("integrates properly with Knock client", () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const client = new Preferences(knock);

        // Verify proper integration
        expect(client).toBeInstanceOf(Preferences);

        // Verify that the client uses the same API client instance
        expect(knock.client()).toBe(mockApiClient);
      } finally {
        cleanup();
      }
    });
  });
});
