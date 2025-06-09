// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../../../src/api";
import Preferences from "../../../src/clients/preferences";
import type {
  PreferenceSet,
  WorkflowPreferenceSetting,
} from "../../../src/clients/preferences/interfaces";
import Knock from "../../../src/knock";

describe("Preferences", () => {
  const userId = "user_123";
  const mockKnock = {
    client: vi.fn(() => ({
      makeRequest: vi.fn(),
    })),
    userId,
    failIfNotAuthenticated: vi.fn(),
  } as unknown as Knock;

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    test("fetches all preference sets", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: [mockPreferenceSet],
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new Preferences(mockKnock);
      const result = await client.getAll();

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${userId}/preferences`,
      });
      expect(result).toEqual([mockPreferenceSet]);
    });
  });

  describe("get", () => {
    test("fetches a specific preference set", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockPreferenceSet,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new Preferences(mockKnock);
      const result = await client.get({ preferenceSet: "default" });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${userId}/preferences/default`,
      });
      expect(result).toEqual(mockPreferenceSet);
    });
  });

  describe("set", () => {
    test("updates a preference set", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockPreferenceSet,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new Preferences(mockKnock);
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
      await client.set(preferences, { preferenceSet: "default" });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}/preferences/default`,
        data: preferences,
      });
    });
  });

  describe("setChannelTypes", () => {
    test("updates channel type preferences", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockPreferenceSet,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new Preferences(mockKnock);
      const channelTypes = {
        in_app_feed: true,
        email: false,
      };
      await client.setChannelTypes(channelTypes, { preferenceSet: "default" });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}/preferences/default/channel_types`,
        data: channelTypes,
      });
    });
  });

  describe("setChannelType", () => {
    test("updates a single channel type preference", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockPreferenceSet,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new Preferences(mockKnock);
      await client.setChannelType("email", true, { preferenceSet: "default" });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}/preferences/default/channel_types/email`,
        data: { subscribed: true },
      });
    });
  });

  describe("setWorkflows", () => {
    test("updates workflow preferences", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockPreferenceSet,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new Preferences(mockKnock);
      const workflows = {
        onboarding: {
          channel_types: {
            in_app_feed: true,
            email: false,
          },
        },
      };
      await client.setWorkflows(workflows, { preferenceSet: "default" });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}/preferences/default/workflows`,
        data: workflows,
      });
    });
  });

  describe("setWorkflow", () => {
    const testCases: Array<[string, WorkflowPreferenceSetting]> = [
      ["simple boolean", true],
      ["channel types object", { channel_types: { email: true } }],
    ];

    test.each(testCases)(
      "updates a single workflow preference - %s",
      async (_, setting) => {
        const mockApiClient = {
          makeRequest: vi.fn().mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          }),
        };

        vi.mocked(mockKnock.client).mockReturnValue(
          mockApiClient as unknown as ApiClient,
        );

        const client = new Preferences(mockKnock);
        await client.setWorkflow("onboarding", setting, {
          preferenceSet: "default",
        });

        expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: `/v1/users/${userId}/preferences/default/workflows/onboarding`,
          data:
            typeof setting === "boolean" ? { subscribed: setting } : setting,
        });
      },
    );
  });

  describe("setCategories", () => {
    test("updates category preferences", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockPreferenceSet,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new Preferences(mockKnock);
      const categories = {
        marketing: {
          channel_types: {
            in_app_feed: true,
            email: false,
          },
        },
      };
      await client.setCategories(categories, { preferenceSet: "default" });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}/preferences/default/categories`,
        data: categories,
      });
    });
  });

  describe("setCategory", () => {
    const testCases: Array<[string, WorkflowPreferenceSetting]> = [
      ["simple boolean", true],
      ["channel types object", { channel_types: { email: true } }],
    ];

    test.each(testCases)(
      "updates a single category preference - %s",
      async (_, setting) => {
        const mockApiClient = {
          makeRequest: vi.fn().mockResolvedValue({
            statusCode: "ok",
            body: mockPreferenceSet,
          }),
        };

        vi.mocked(mockKnock.client).mockReturnValue(
          mockApiClient as unknown as ApiClient,
        );

        const client = new Preferences(mockKnock);
        await client.setCategory("marketing", setting, {
          preferenceSet: "default",
        });

        expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: `/v1/users/${userId}/preferences/default/categories/marketing`,
          data:
            typeof setting === "boolean" ? { subscribed: setting } : setting,
        });
      },
    );
  });
});
