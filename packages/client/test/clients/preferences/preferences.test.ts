// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import PreferencesClient from "../../../src/clients/preferences";
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

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

  describe("Getting All Preferences", () => {
    test("fetches all user preferences successfully", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const mockAllPreferences = {
        default: {
          categories: { marketing: true, security: false },
          channel_types: { email: true, in_app_feed: true },
          workflows: {},
        },
        custom: {
          categories: { marketing: false },
          channel_types: { email: false },
          workflows: {},
        },
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: mockAllPreferences,
      });

      const client = new PreferencesClient(knock);
      const result = await client.getAll();

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/users/user_123/preferences",
      });
      expect(result).toEqual(mockAllPreferences);
    });

    test("requires authentication for getAll", async () => {
      const { knock } = createMockKnock();
      const client = new PreferencesClient(knock);

      await expect(client.getAll()).rejects.toThrow(
        "Not authenticated. Please call `authenticate` first.",
      );
    });
  });

  describe("Custom Preference Sets", () => {
    test("gets preferences for custom preference set", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const mockPreferences = {
        categories: { marketing: false },
        channel_types: { email: false },
        workflows: {},
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: mockPreferences,
      });

      const client = new PreferencesClient(knock);
      const result = await client.get({ preferenceSet: "custom" });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/users/user_123/preferences/custom",
      });
      expect(result).toEqual(mockPreferences);
    });

    test("sets preferences for custom preference set", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const preferences = {
        channel_types: { email: false },
        workflows: {},
        categories: {},
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: preferences,
      });

      const client = new PreferencesClient(knock);
      const result = await client.set(preferences, { preferenceSet: "custom" });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/custom",
        data: preferences,
      });
      expect(result).toEqual(preferences);
    });
  });

  describe("Channel Type Preferences", () => {
    test("sets all channel type preferences", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const channelTypes = {
        email: true,
        in_app_feed: false,
        sms: true,
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { channel_types: channelTypes },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setChannelTypes(channelTypes);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default/channel_types",
        data: channelTypes,
      });
      expect(result).toEqual({ channel_types: channelTypes });
    });

    test("sets channel type preferences for custom preference set", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const channelTypes = { email: false };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { channel_types: channelTypes },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setChannelTypes(channelTypes, {
        preferenceSet: "custom",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/custom/channel_types",
        data: channelTypes,
      });
      expect(result).toEqual({ channel_types: channelTypes });
    });

    test("sets individual channel type preference", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { channel_types: { email: false } },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setChannelType("email", false);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default/channel_types/email",
        data: { subscribed: false },
      });
      expect(result).toEqual({ channel_types: { email: false } });
    });

    test("sets individual channel type for custom preference set", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { channel_types: { sms: true } },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setChannelType("sms", true, {
        preferenceSet: "custom",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/custom/channel_types/sms",
        data: { subscribed: true },
      });
      expect(result).toEqual({ channel_types: { sms: true } });
    });

    test("requires authentication for setChannelTypes", async () => {
      const { knock } = createMockKnock();
      const client = new PreferencesClient(knock);

      await expect(client.setChannelTypes({})).rejects.toThrow(
        "Not authenticated. Please call `authenticate` first.",
      );
    });

    test("requires authentication for setChannelType", async () => {
      const { knock } = createMockKnock();
      const client = new PreferencesClient(knock);

      await expect(client.setChannelType("email", true)).rejects.toThrow(
        "Not authenticated. Please call `authenticate` first.",
      );
    });
  });

  describe("Workflow Preferences", () => {
    test("sets all workflow preferences", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const workflows = {
        "new-comment": true,
        "user-welcome": false,
        digest: {
          channel_types: { email: false },
        },
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { workflows },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setWorkflows(workflows);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default/workflows",
        data: workflows,
      });
      expect(result).toEqual({ workflows });
    });

    test("sets workflow preferences for custom preference set", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const workflows = { "user-welcome": false };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { workflows },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setWorkflows(workflows, {
        preferenceSet: "custom",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/custom/workflows",
        data: workflows,
      });
      expect(result).toEqual({ workflows });
    });

    test("sets individual workflow preference with boolean", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { workflows: { "new-comment": { subscribed: true } } },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setWorkflow("new-comment", true);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default/workflows/new-comment",
        data: { subscribed: true },
      });
      expect(result).toEqual({
        workflows: { "new-comment": { subscribed: true } },
      });
    });

    test("sets individual workflow preference with object", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const workflowSetting = {
        subscribed: true,
        channel_types: { email: false },
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { workflows: { digest: workflowSetting } },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setWorkflow("digest", workflowSetting);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default/workflows/digest",
        data: workflowSetting,
      });
      expect(result).toEqual({ workflows: { digest: workflowSetting } });
    });

    test("sets individual workflow for custom preference set", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { workflows: { welcome: { subscribed: false } } },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setWorkflow("welcome", false, {
        preferenceSet: "custom",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/custom/workflows/welcome",
        data: { subscribed: false },
      });
      expect(result).toEqual({ workflows: { welcome: { subscribed: false } } });
    });

    test("requires authentication for setWorkflows", async () => {
      const { knock } = createMockKnock();
      const client = new PreferencesClient(knock);

      await expect(client.setWorkflows({})).rejects.toThrow(
        "Not authenticated. Please call `authenticate` first.",
      );
    });

    test("requires authentication for setWorkflow", async () => {
      const { knock } = createMockKnock();
      const client = new PreferencesClient(knock);

      await expect(client.setWorkflow("test", true)).rejects.toThrow(
        "Not authenticated. Please call `authenticate` first.",
      );
    });
  });

  describe("Category Preferences", () => {
    test("sets all category preferences", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const categories = {
        marketing: true,
        security: false,
        updates: {
          channel_types: { email: false },
        },
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { categories },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setCategories(categories);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default/categories",
        data: categories,
      });
      expect(result).toEqual({ categories });
    });

    test("sets category preferences for custom preference set", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const categories = { marketing: false };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { categories },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setCategories(categories, {
        preferenceSet: "custom",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/custom/categories",
        data: categories,
      });
      expect(result).toEqual({ categories });
    });

    test("sets individual category preference with boolean", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { categories: { marketing: { subscribed: false } } },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setCategory("marketing", false);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default/categories/marketing",
        data: { subscribed: false },
      });
      expect(result).toEqual({
        categories: { marketing: { subscribed: false } },
      });
    });

    test("sets individual category preference with object", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const categorySetting = {
        subscribed: true,
        channel_types: { email: true, sms: false },
      };

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { categories: { security: categorySetting } },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setCategory("security", categorySetting);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/default/categories/security",
        data: categorySetting,
      });
      expect(result).toEqual({ categories: { security: categorySetting } });
    });

    test("sets individual category for custom preference set", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "ok",
        body: { categories: { updates: { subscribed: true } } },
      });

      const client = new PreferencesClient(knock);
      const result = await client.setCategory("updates", true, {
        preferenceSet: "custom",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/users/user_123/preferences/custom/categories/updates",
        data: { subscribed: true },
      });
      expect(result).toEqual({ categories: { updates: { subscribed: true } } });
    });

    test("requires authentication for setCategories", async () => {
      const { knock } = createMockKnock();
      const client = new PreferencesClient(knock);

      await expect(client.setCategories({})).rejects.toThrow(
        "Not authenticated. Please call `authenticate` first.",
      );
    });

    test("requires authentication for setCategory", async () => {
      const { knock } = createMockKnock();
      const client = new PreferencesClient(knock);

      await expect(client.setCategory("test", true)).rejects.toThrow(
        "Not authenticated. Please call `authenticate` first.",
      );
    });
  });

  describe("Error Handling", () => {
    test("handles error responses with error property", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: "Unauthorized access",
        body: undefined,
      });

      const client = new PreferencesClient(knock);

      await expect(client.get()).rejects.toThrow("Unauthorized access");
    });

    test("handles error responses with body property", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: undefined,
        body: "Invalid request format",
      });

      const client = new PreferencesClient(knock);

      await expect(client.get()).rejects.toThrow("Invalid request format");
    });

    test("handles various error scenarios for different methods", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const errorResponse = {
        statusCode: "error" as const,
        error: "Server error",
        body: undefined,
      };

      const client = new PreferencesClient(knock);

      // Test all methods throw on error
      mockApiClient.makeRequest.mockResolvedValue(errorResponse);
      await expect(client.getAll()).rejects.toThrow("Server error");

      mockApiClient.makeRequest.mockResolvedValue(errorResponse);
      await expect(client.setChannelTypes({})).rejects.toThrow("Server error");

      mockApiClient.makeRequest.mockResolvedValue(errorResponse);
      await expect(client.setChannelType("email", true)).rejects.toThrow(
        "Server error",
      );

      mockApiClient.makeRequest.mockResolvedValue(errorResponse);
      await expect(client.setWorkflows({})).rejects.toThrow("Server error");

      mockApiClient.makeRequest.mockResolvedValue(errorResponse);
      await expect(client.setWorkflow("test", true)).rejects.toThrow(
        "Server error",
      );

      mockApiClient.makeRequest.mockResolvedValue(errorResponse);
      await expect(client.setCategories({})).rejects.toThrow("Server error");

      mockApiClient.makeRequest.mockResolvedValue(errorResponse);
      await expect(client.setCategory("test", true)).rejects.toThrow(
        "Server error",
      );
    });
  });
});
