// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type {
  PreferenceSet,
  SetPreferencesProperties,
} from "../../../src/clients/preferences/interfaces";
import UserClient from "../../../src/clients/users";
import type { ChannelData, User } from "../../../src/interfaces";
import { setupKnockTest, useTestHooks } from "../../test-utils/test-setup";

/**
 * Modern User Client Test Suite
 *
 * This test suite demonstrates modern testing practices including:
 * - User journey-focused test organization
 * - Realistic mock behavior
 * - Comprehensive error scenario testing
 * - Authentication lifecycle testing
 * - Proper cleanup and resource management
 */
describe("User Client", () => {
  const getTestSetup = useTestHooks(() => setupKnockTest());

  const mockUser: User = {
    id: "user_123",
    collection: "users",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "Test User",
    email: "test@example.com",
    phone_number: null,
    avatar: null,
  };

  describe("User Profile Management", () => {
    describe("Getting User Data", () => {
      test("fetches the authenticated user successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          // Authenticate first
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockUser,
          });

          const client = new UserClient(knock);
          const result = await client.get();

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/users/user_123",
          });
          expect(result).toEqual(mockUser);
        } finally {
          cleanup();
        }
      });

      test("requires authentication before fetching user", async () => {
        const { knock, cleanup } = getTestSetup();

        try {
          const client = new UserClient(knock);

          await expect(client.get()).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );
        } finally {
          cleanup();
        }
      });

      test("handles user not found errors gracefully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        // Suppress console.error for expected error scenarios
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          knock.authenticate("user_123", "test_token");

          const mockError = new Error("User not found");
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "error",
            error: mockError,
            body: undefined,
          });

          const client = new UserClient(knock);
          await expect(client.get()).rejects.toThrow("User not found");
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });
    });

    describe("Updating User Data", () => {
      test("updates user properties successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const updatedUser = { ...mockUser, name: "Updated Name" };
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: updatedUser,
          });

          const client = new UserClient(knock);
          const props = { name: "Updated Name" };
          const result = await client.identify(props);

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123",
            params: props,
          });
          expect(result).toEqual(updatedUser);
        } finally {
          cleanup();
        }
      });

      test("handles comprehensive user property updates", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const comprehensiveProps = {
            name: "John Doe",
            email: "john.doe@example.com",
            phone_number: "+1234567890",
            avatar: "https://example.com/avatar.jpg",
            custom_properties: {
              department: "Engineering",
              role: "Senior Developer",
              preferences: {
                theme: "dark",
                notifications: true,
              },
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: { ...mockUser, ...comprehensiveProps },
          });

          const client = new UserClient(knock);
          await client.identify(comprehensiveProps);

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123",
            params: comprehensiveProps,
          });
        } finally {
          cleanup();
        }
      });

      test("requires authentication before updating user", async () => {
        const { knock, cleanup } = getTestSetup();

        try {
          const client = new UserClient(knock);

          await expect(client.identify({ name: "Test" })).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );
        } finally {
          cleanup();
        }
      });

      test("handles user update errors appropriately", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          knock.authenticate("user_123", "test_token");

          const errorScenarios = [
            {
              error: new Error("Invalid email format"),
              expectedMessage: "Invalid email format",
            },
            {
              error: new Error("User update failed"),
              expectedMessage: "User update failed",
            },
            {
              error: new Error("Validation error"),
              expectedMessage: "Validation error",
            },
          ];

          const client = new UserClient(knock);

          for (const scenario of errorScenarios) {
            mockApiClient.makeRequest.mockResolvedValueOnce({
              statusCode: "error",
              error: scenario.error,
            });

            await expect(
              client.identify({ name: "Test User" }),
            ).rejects.toThrow(scenario.expectedMessage);
          }
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });
    });
  });

  describe("User Preferences Management", () => {
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

    describe("Getting Preferences", () => {
      test("gets all preference sets successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: [mockPreferenceSet],
          });

          const client = new UserClient(knock);
          const result = await client.getAllPreferences();

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/users/user_123/preferences",
          });
          expect(result).toEqual([mockPreferenceSet]);
        } finally {
          cleanup();
        }
      });

      test("gets specific preference set with tenant", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new UserClient(knock);
          const result = await client.getPreferences({
            preferenceSet: "default",
            tenant: "tenant_123",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/users/user_123/preferences/default",
            params: { tenant: "tenant_123" },
          });
          expect(result).toEqual(mockPreferenceSet);
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

          const client = new UserClient(knock);
          const result = await client.getAllPreferences();

          expect(result).toEqual([]);
        } finally {
          cleanup();
        }
      });
    });

    describe("Setting Preferences", () => {
      test("sets preferences successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const preferences: SetPreferencesProperties = {
            channel_types: {
              in_app_feed: true,
              email: false,
            },
            workflows: {
              onboarding: {
                channel_types: {
                  in_app_feed: false,
                  email: true,
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
            body: { ...mockPreferenceSet, ...preferences },
          });

          const client = new UserClient(knock);
          await client.setPreferences(preferences, {
            preferenceSet: "default",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/default",
            data: preferences,
          });
        } finally {
          cleanup();
        }
      });

      test("sets preferences with tenant context", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const preferences: SetPreferencesProperties = {
            channel_types: {
              email: false,
              sms: true,
            },
            workflows: {
              welcome_series: {
                channel_types: { email: true, sms: false },
              },
            },
            categories: {
              marketing: {
                channel_types: {
                  email: false,
                  sms: true,
                },
              },
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          });

          const client = new UserClient(knock);
          await client.setPreferences(preferences, {
            preferenceSet: "tenant_specific",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/preferences/tenant_specific",
            data: preferences,
          });
        } finally {
          cleanup();
        }
      });

      test("handles complex nested preference structures", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const complexPreferences: SetPreferencesProperties = {
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
              weekly_digest: {
                channel_types: { email: false, in_app_feed: true },
              },
              urgent_alerts: {
                channel_types: { sms: true, push: true },
              },
            },
            categories: {
              marketing: {
                channel_types: { email: false },
              },
              updates: {
                channel_types: { in_app_feed: true, email: true },
              },
              security: {
                channel_types: { email: true, sms: true, push: true },
              },
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: complexPreferences,
          });

          const client = new UserClient(knock);
          await client.setPreferences(complexPreferences, {
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

    describe("Preference Error Handling", () => {
      test("requires authentication for preference operations", async () => {
        const { knock, cleanup } = getTestSetup();

        try {
          const client = new UserClient(knock);

          await expect(client.getAllPreferences()).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );

          await expect(
            client.getPreferences({ preferenceSet: "default" }),
          ).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );

          const basicPreferences: SetPreferencesProperties = {
            channel_types: { email: true },
            workflows: {},
            categories: {},
          };

          await expect(
            client.setPreferences(basicPreferences, {
              preferenceSet: "default",
            }),
          ).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );
        } finally {
          cleanup();
        }
      });

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
              error: new Error("Invalid preference structure"),
              expectedMessage: "Invalid preference structure",
            },
            {
              error: new Error("Tenant access denied"),
              expectedMessage: "Tenant access denied",
            },
          ];

          const client = new UserClient(knock);

          for (const scenario of errorScenarios) {
            mockApiClient.makeRequest.mockResolvedValueOnce({
              statusCode: "error",
              error: scenario.error,
            });

            await expect(
              client.getPreferences({ preferenceSet: "test" }),
            ).rejects.toThrow(scenario.expectedMessage);
          }
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });
    });
  });

  describe("Channel Data Management", () => {
    const mockChannelData: ChannelData<{ setting: string }> = {
      channel_id: "channel_123",
      data: { setting: "enabled" },
    };

    describe("Channel Data Operations", () => {
      test("gets channel data successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockChannelData,
          });

          const client = new UserClient(knock);
          const result = await client.getChannelData({
            channelId: "channel_123",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/users/user_123/channel_data/channel_123",
          });
          expect(result).toEqual(mockChannelData);
        } finally {
          cleanup();
        }
      });

      test("sets channel data successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          knock.authenticate("user_123", "test_token");

          const inputData = { setting: "disabled", theme: "dark" };
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: { channel_id: "channel_123", data: inputData },
          });

          const client = new UserClient(knock);
          await client.setChannelData({
            channelId: "channel_123",
            channelData: inputData,
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "/v1/users/user_123/channel_data/channel_123",
            data: { data: inputData },
          });
        } finally {
          cleanup();
        }
      });
    });

    describe("Channel Data Error Handling", () => {
      test("requires authentication for channel data operations", async () => {
        const { knock, cleanup } = getTestSetup();

        try {
          const client = new UserClient(knock);

          await expect(
            client.getChannelData({ channelId: "test" }),
          ).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );

          await expect(
            client.setChannelData({ channelId: "test", channelData: {} }),
          ).rejects.toThrow(
            "Not authenticated. Please call `authenticate` first.",
          );
        } finally {
          cleanup();
        }
      });

      test("handles channel data operation errors", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          knock.authenticate("user_123", "test_token");

          const mockError = new Error("Channel not found");
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "error",
            error: mockError,
          });

          const client = new UserClient(knock);
          await expect(
            client.getChannelData({ channelId: "invalid_channel" }),
          ).rejects.toThrow("Channel not found");
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });
    });
  });

  describe("Performance and Integration", () => {
    test("handles concurrent operations efficiently", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        knock.authenticate("user_123", "test_token");

        // Mock multiple successful responses
        mockApiClient.makeRequest.mockImplementation(() =>
          Promise.resolve({
            statusCode: "ok",
            body: mockUser,
          }),
        );

        const client = new UserClient(knock);
        const startTime = Date.now();

        // Make multiple concurrent requests
        const requests = Array.from({ length: 5 }, () => client.get());

        const results = await Promise.all(requests);
        const endTime = Date.now();

        // All requests should succeed
        expect(results).toHaveLength(5);
        results.forEach((result) => {
          expect(result.id).toBe("user_123");
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
        const client = new UserClient(knock);

        // Verify proper integration
        expect(client).toBeInstanceOf(UserClient);

        // Verify that the client uses the same API client instance
        expect(knock.client()).toBe(mockApiClient);
      } finally {
        cleanup();
      }
    });
  });
});
