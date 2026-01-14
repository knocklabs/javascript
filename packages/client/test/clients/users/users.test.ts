import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type {
  PreferenceSet,
  SetPreferencesProperties,
} from "../../../src/clients/preferences/interfaces";
import UserClient from "../../../src/clients/users";
import type { ChannelData, User } from "../../../src/interfaces";
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

describe("User Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getTestSetup = () => createMockKnock();

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
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

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
      });

      test("requires authentication before fetching user", async () => {
        const { knock } = getTestSetup();

        const client = new UserClient(knock);

        await expect(client.get()).rejects.toThrow(
          "Not authenticated. Please call `authenticate` first.",
        );
      });

      test("handles user not found errors gracefully", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        // Suppress console.error for expected error scenarios
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const mockError = new Error("User not found");
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: mockError,
          body: undefined,
        });

        const client = new UserClient(knock);
        await expect(client.get()).rejects.toThrow("User not found");

        consoleSpy.mockRestore();
      });
    });

    describe("Updating User Data", () => {
      test("updates user properties successfully", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

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
          data: props,
        });
        expect(result).toEqual(updatedUser);
      });

      test("handles comprehensive user property updates", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

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
          data: comprehensiveProps,
        });
      });

      test("requires authentication before updating user", async () => {
        const { knock } = getTestSetup();

        const client = new UserClient(knock);

        await expect(client.identify({ name: "Test" })).rejects.toThrow(
          "Not authenticated. Please call `authenticate` first.",
        );
      });

      test("handles user update errors appropriately", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

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

          await expect(client.identify({ name: "Test User" })).rejects.toThrow(
            scenario.expectedMessage,
          );
        }

        consoleSpy.mockRestore();
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
      channels: {
        "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
        "ce475f4f-261c-43de-8016-143ecc900ea9": false,
      },
      workflows: {
        onboarding: {
          channel_types: {
            in_app_feed: true,
            email: false,
          },
          channels: {
            "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
            "ce475f4f-261c-43de-8016-143ecc900ea9": false,
          },
        },
      },
      categories: {
        marketing: {
          channel_types: {
            in_app_feed: true,
            email: false,
          },
          channels: {
            "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
            "ce475f4f-261c-43de-8016-143ecc900ea9": false,
          },
        },
      },
    };

    describe("Getting Preferences", () => {
      test("gets all preference sets successfully", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

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
      });

      test("gets specific preference set with tenant", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

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
      });

      test("handles empty preference sets gracefully", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [],
        });

        const client = new UserClient(knock);
        const result = await client.getAllPreferences();

        expect(result).toEqual([]);
      });
    });

    describe("Setting Preferences", () => {
      test("sets preferences successfully", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const preferences: SetPreferencesProperties = {
          channel_types: {
            in_app_feed: true,
            email: false,
          },
          channels: {
            "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
            "ce475f4f-261c-43de-8016-143ecc900ea9": false,
          },
          workflows: {
            onboarding: {
              channel_types: {
                in_app_feed: false,
                email: true,
              },
              channels: {
                "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
                "ce475f4f-261c-43de-8016-143ecc900ea9": false,
              },
            },
          },
          categories: {
            marketing: {
              channel_types: {
                in_app_feed: true,
                email: false,
              },
              channels: {
                "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
                "ce475f4f-261c-43de-8016-143ecc900ea9": false,
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
      });

      test("sets preferences with tenant context", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const preferences: SetPreferencesProperties = {
          channel_types: {
            email: false,
            sms: true,
          },
          channels: {
            "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
            "ce475f4f-261c-43de-8016-143ecc900ea9": false,
          },
          workflows: {
            welcome_series: {
              channel_types: { email: true, sms: false },
              channels: {
                "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
                "ce475f4f-261c-43de-8016-143ecc900ea9": false,
              },
            },
          },
          categories: {
            marketing: {
              channel_types: {
                email: false,
                sms: true,
              },
              channels: {
                "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
                "ce475f4f-261c-43de-8016-143ecc900ea9": false,
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
      });

      test("handles complex nested preference structures", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const complexPreferences: SetPreferencesProperties = {
          channel_types: {
            in_app_feed: true,
            email: true,
            sms: false,
            push: true,
          },
          channels: {
            "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
            "ce475f4f-261c-43de-8016-143ecc900ea9": true,
            "e645ca6e-d8b3-437f-a260-13d8f7425221": false,
            "064d651d-2715-4098-aa9b-e912f4d1ca9b": true,
          },
          workflows: {
            welcome_series: {
              channel_types: { email: true, sms: false },
              channels: {
                "ce475f4f-261c-43de-8016-143ecc900ea9": true,
                "e645ca6e-d8b3-437f-a260-13d8f7425221": false,
              },
            },
            weekly_digest: {
              channel_types: { email: false, in_app_feed: true },
              channels: {
                "ce475f4f-261c-43de-8016-143ecc900ea9": false,
                "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
              },
            },
            urgent_alerts: {
              channel_types: { sms: true, push: true },
              channels: {
                "e645ca6e-d8b3-437f-a260-13d8f7425221": true,
                "064d651d-2715-4098-aa9b-e912f4d1ca9b": true,
              },
            },
          },
          categories: {
            marketing: {
              channel_types: { email: false },
              channels: { "ce475f4f-261c-43de-8016-143ecc900ea9": false },
            },
            updates: {
              channel_types: { in_app_feed: true, email: true },
              channels: {
                "f46af07b-fb3b-4d8e-9139-7768725ba27f": true,
                "ce475f4f-261c-43de-8016-143ecc900ea9": true,
              },
            },
            security: {
              channel_types: { email: true, sms: true, push: true },
              channels: {
                "ce475f4f-261c-43de-8016-143ecc900ea9": true,
                "e645ca6e-d8b3-437f-a260-13d8f7425221": true,
                "064d651d-2715-4098-aa9b-e912f4d1ca9b": true,
              },
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
      });
    });

    describe("Preference Error Handling", () => {
      test("requires authentication for preference operations", async () => {
        const { knock } = getTestSetup();

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
          channels: {},
        };

        await expect(
          client.setPreferences(basicPreferences, {
            preferenceSet: "default",
          }),
        ).rejects.toThrow(
          "Not authenticated. Please call `authenticate` first.",
        );
      });

      test("handles preference operation errors gracefully", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

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

        consoleSpy.mockRestore();
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
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

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
      });

      test("sets channel data successfully", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

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
      });
    });

    describe("Channel Data Error Handling", () => {
      test("requires authentication for channel data operations", async () => {
        const { knock } = getTestSetup();

        const client = new UserClient(knock);

        await expect(
          client.getChannelData({ channelId: "test" }),
        ).rejects.toThrow("Not authenticated");

        await expect(
          client.setChannelData({ channelId: "test", channelData: {} }),
        ).rejects.toThrow("Not authenticated");
      });

      test("handles channel data operation errors", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const mockError = new Error("Channel not found");
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: mockError,
        });

        const client = new UserClient(knock);
        await expect(
          client.getChannelData({ channelId: "invalid_channel" }),
        ).rejects.toThrow("Channel not found");

        consoleSpy.mockRestore();
      });
    });
  });

  describe("Performance and Integration", () => {
    test("handles concurrent operations efficiently", async () => {
      const { knock, mockApiClient } = getTestSetup();
      authenticateKnock(knock);

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
    });

    test("integrates properly with Knock client", () => {
      const { knock, mockApiClient } = getTestSetup();
      authenticateKnock(knock);

      const client = new UserClient(knock);

      // Verify proper integration
      expect(client).toBeInstanceOf(UserClient);

      // Verify that the client uses the same API client instance
      expect(knock.client()).toBe(mockApiClient);
    });
  });

  describe("Guide Management", () => {
    describe("Getting Guides", () => {
      test("fetches guides successfully", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const mockGuides = {
          items: [
            {
              id: "guide_1",
              name: "Welcome Guide",
              status: "active",
            },
            {
              id: "guide_2",
              name: "Feature Tour",
              status: "completed",
            },
          ],
          page_info: {
            before: null,
            after: "cursor_123",
            page_size: 50,
          },
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockGuides,
        });

        const client = new UserClient(knock);
        const params = { page_size: 10, status: "active" };
        const result = await client.getGuides("channel_123", params);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "GET",
          url: "/v1/users/user_123/guides/channel_123",
          params,
        });
        expect(result).toEqual(mockGuides);
      });

      test("handles guides with different parameters", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const mockResponse = { items: [], page_info: { page_size: 25 } };
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockResponse,
        });

        const client = new UserClient(knock);
        const params = {
          status: "completed",
          category: "onboarding",
          limit: 25,
        };
        const result = await client.getGuides("onboarding_channel", params);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "GET",
          url: "/v1/users/user_123/guides/onboarding_channel",
          params,
        });
        expect(result).toEqual(mockResponse);
      });

      test("handles guides API errors", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: "Channel not found",
          body: undefined,
        });

        const client = new UserClient(knock);

        await expect(client.getGuides("invalid_channel", {})).rejects.toThrow(
          "Channel not found",
        );
      });
    });

    describe("Marking Guide Steps", () => {
      test("marks guide step as seen", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const mockResponse = {
          id: "message_123",
          status: "seen",
          seen_at: new Date().toISOString(),
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockResponse,
        });

        const client = new UserClient(knock);
        const params = {
          channel_id: "channel_123",
          guide_key: "welcome_guide",
          guide_id: "guide_123",
          guide_step_ref: "welcome_step_1",
        };
        const result = await client.markGuideStepAs("seen", params);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: "/v1/users/user_123/guides/messages/seen",
          data: params,
        });
        expect(result).toEqual(mockResponse);
      });

      test("marks guide step as interacted", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const mockResponse = {
          id: "message_456",
          status: "interacted",
          interacted_at: new Date().toISOString(),
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockResponse,
        });

        const client = new UserClient(knock);
        const params = {
          channel_id: "channel_456",
          guide_key: "tutorial_guide",
          guide_id: "guide_456",
          guide_step_ref: "tutorial_step_2",
          metadata: { action: "button_click", element: "next_button" },
        };
        const result = await client.markGuideStepAs("interacted", params);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: "/v1/users/user_123/guides/messages/interacted",
          data: params,
        });
        expect(result).toEqual(mockResponse);
      });

      test("marks guide step as archived", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const mockResponse = {
          id: "message_789",
          status: "archived",
          archived_at: new Date().toISOString(),
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockResponse,
        });

        const client = new UserClient(knock);
        const params = {
          channel_id: "channel_789",
          guide_key: "advanced_guide",
          guide_id: "guide_789",
          guide_step_ref: "advanced_feature",
        };
        const result = await client.markGuideStepAs("archived", params);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: "/v1/users/user_123/guides/messages/archived",
          data: params,
        });
        expect(result).toEqual(mockResponse);
      });

      test("handles guide step marking errors", async () => {
        const { knock, mockApiClient } = getTestSetup();
        authenticateKnock(knock);

        const errorScenarios = [
          {
            status: "seen" as const,
            error: "Message not found",
          },
          {
            status: "interacted" as const,
            error: "Invalid step reference",
          },
          {
            status: "archived" as const,
            error: "Permission denied",
          },
        ];

        const client = new UserClient(knock);

        for (const scenario of errorScenarios) {
          mockApiClient.makeRequest.mockResolvedValueOnce({
            statusCode: "error",
            error: scenario.error,
            body: undefined,
          });

          await expect(
            client.markGuideStepAs(scenario.status, {
              channel_id: "test_channel",
              guide_key: "test_guide",
              guide_id: "test_guide_id",
              guide_step_ref: "test_step",
            }),
          ).rejects.toThrow(scenario.error);
        }
      });
    });
  });

  describe("Error Handling", () => {
    test("throws error for server errors", async () => {
      const { knock, mockApiClient } = getTestSetup();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: "Server Error",
        body: "Internal Server Error",
      });

      await expect(knock.user.get()).rejects.toThrow("Server Error");
    });

    test("throws error body when error is null", async () => {
      const { knock, mockApiClient } = getTestSetup();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: null,
        body: "Service Unavailable",
      });

      await expect(knock.user.get()).rejects.toThrow("Service Unavailable");
    });

    test("throws error when both error and body are present", async () => {
      const { knock, mockApiClient } = getTestSetup();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: "Primary Error",
        body: "Secondary Error Info",
      });

      // Should throw the error, not the body
      await expect(knock.user.get()).rejects.toThrow("Primary Error");
    });

    test("throws error for identify operation", async () => {
      const { knock, mockApiClient } = getTestSetup();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: "Validation failed",
        body: "Invalid user data",
      });

      await expect(knock.user.identify({ name: "Test User" })).rejects.toThrow(
        "Validation failed",
      );
    });

    test("throws error for markGuideStepAs operation", async () => {
      const { knock, mockApiClient } = getTestSetup();

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: "Guide step not found",
        body: "Invalid guide step ID",
      });

      await expect(
        knock.user.markGuideStepAs("seen", {
          guide_key: "onboarding_guide",
          guide_id: "guide_456",
          guide_step_ref: "step_1",
          channel_id: "channel_456",
        }),
      ).rejects.toThrow("Guide step not found");
    });
  });
});
