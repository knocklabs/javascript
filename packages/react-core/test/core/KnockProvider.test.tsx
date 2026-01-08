import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { createMockKnock } from "../../../client/test/test-utils/mocks";
import {
  KnockFeedProvider,
  KnockProvider,
  useKnockClient,
  useTranslations,
} from "../../src";

const TEST_BRANCH_SLUG = "lorem-ipsum-dolor-branch";

// Create a mock Knock instance that we'll use across tests
const { knock, mockApiClient } = createMockKnock("test_api_key");

// Mock the Knock client constructor to return our mock instance
vi.mock("@knocklabs/client", () => ({
  default: vi.fn().mockImplementation(() => knock),
}));

// Mock API responses
mockApiClient.makeRequest.mockImplementation(async ({ method, url, data }) => {
  if (method === "PUT" && url.match(/\/v1\/users\/.+/)) {
    return {
      statusCode: "ok",
      body: { id: knock.userId, ...(data ?? {}) },
    };
  }
  return { statusCode: "ok", body: {} };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  // Reset the knock instance state to prevent test pollution
  knock.userId = undefined;
  knock.userToken = undefined;
});

describe("KnockProvider", () => {
  test("renders as expected", () => {
    const TestConsumer = () => {
      const knock = useKnockClient();
      return <div data-testid="consumer-msg">API Key: {knock.apiKey}</div>;
    };
    const { getByTestId } = render(
      <KnockProvider apiKey="test_api_key" userId="test_user_id">
        <TestConsumer />
      </KnockProvider>,
    );

    expect(getByTestId("consumer-msg")).toHaveTextContent(
      "API Key: test_api_key",
    );
  });

  test("renders as expected with branch", () => {
    const TestConsumer = () => {
      const knock = useKnockClient();
      return <div data-testid="consumer-msg">API Key: {knock.apiKey}</div>;
    };
    const { getByTestId } = render(
      <KnockProvider
        apiKey="test_api_key"
        user={{ id: "test_user_id" }}
        branch={TEST_BRANCH_SLUG}
      >
        <TestConsumer />
      </KnockProvider>,
    );

    expect(getByTestId("consumer-msg")).toHaveTextContent(
      "API Key: test_api_key",
    );
  });

  test("renders as expected with user object", () => {
    const TestConsumer = () => {
      const knock = useKnockClient();
      return <div data-testid="consumer-msg">API Key: {knock.apiKey}</div>;
    };
    const { getByTestId } = render(
      <KnockProvider apiKey="test_api_key" user={{ id: "test_user_id" }}>
        <TestConsumer />
      </KnockProvider>,
    );

    expect(getByTestId("consumer-msg")).toHaveTextContent(
      "API Key: test_api_key",
    );
  });

  test("updating user object results in identify call on new user", () => {
    const TestConsumer = () => {
      const knock = useKnockClient();
      return <div data-testid="consumer-msg">User Id: {knock.userId}</div>;
    };

    // Initial render
    const { rerender } = render(
      <KnockProvider
        apiKey="test_api_key"
        user={{ id: "test_user_id", name: "John" }}
      >
        <TestConsumer />
      </KnockProvider>,
    );

    // Verify initial authentication and identify
    expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "/v1/users/test_user_id",
        data: { name: "John" },
      }),
    );

    // Reset spy for rerender
    mockApiClient.makeRequest.mockClear();

    // Rerender with new user
    rerender(
      <KnockProvider
        apiKey="test_api_key"
        user={{ id: "test_user_id_2", name: "Jane" }}
      >
        <TestConsumer />
      </KnockProvider>,
    );

    // Verify identify is called with new user properties
    expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "/v1/users/test_user_id_2",
        data: { name: "Jane" },
      }),
    );
  });

  describe("Inline identification strategy", () => {
    test("defaults to inline identification when no strategy is specified", () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return <div data-testid="consumer-msg">User Id: {knock.userId}</div>;
      };

      render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "John Doe", email: "john@example.com" }}
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Verify identify is called with user properties
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          url: "/v1/users/test_user_id",
          data: { name: "John Doe", email: "john@example.com" },
        }),
      );
    });

    test("performs inline identification when strategy is explicitly set to 'inline'", () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return <div data-testid="consumer-msg">User Id: {knock.userId}</div>;
      };

      render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "John Doe", email: "john@example.com" }}
          identificationStrategy="inline"
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Verify identify is called with user properties
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          url: "/v1/users/test_user_id",
          data: { name: "John Doe", email: "john@example.com" },
        }),
      );
    });

    test("skips inline identification when strategy is set to 'skip'", () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return <div data-testid="consumer-msg">User Id: {knock.userId}</div>;
      };

      render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "John Doe", email: "john@example.com" }}
          identificationStrategy="skip"
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Verify identify is NOT called
      expect(mockApiClient.makeRequest).not.toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          url: "/v1/users/test_user_id",
        }),
      );
    });

    test("does not identify when using deprecated userId prop regardless of strategy", () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return <div data-testid="consumer-msg">User Id: {knock.userId}</div>;
      };

      render(
        <KnockProvider
          apiKey="test_api_key"
          userId="test_user_id"
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Verify identify is NOT called since we're using string userId
      expect(mockApiClient.makeRequest).not.toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          url: "/v1/users/test_user_id",
        }),
      );
    });

    test("changing identification strategy from inline to skip stops identification", () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return <div data-testid="consumer-msg">User Id: {knock.userId}</div>;
      };

      // Initial render with inline strategy
      const { rerender } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "John Doe" }}
          identificationStrategy="inline"
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Verify initial identify call
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          url: "/v1/users/test_user_id",
          data: { name: "John Doe" },
        }),
      );

      // Reset spy for rerender
      mockApiClient.makeRequest.mockClear();

      // Rerender with skip strategy and new user data
      rerender(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "Jane Doe", email: "jane@example.com" }}
          identificationStrategy="skip"
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Verify identify is NOT called even though user data changed
      expect(mockApiClient.makeRequest).not.toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          url: "/v1/users/test_user_id",
        }),
      );
    });

    test("changing identification strategy from skip to inline enables identification", async () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return <div data-testid="consumer-msg">User Id: {knock.userId}</div>;
      };

      // Initial render with skip strategy
      const { rerender } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "John Doe" }}
          identificationStrategy="skip"
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Verify no initial identify call
      expect(mockApiClient.makeRequest).not.toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          url: "/v1/users/test_user_id",
        }),
      );

      // Reset spy for rerender
      mockApiClient.makeRequest.mockClear();

      // Rerender with inline strategy and same user data
      rerender(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "John Doe", email: "john@example.com" }}
          identificationStrategy="inline"
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Wait for the effect to complete
      await waitFor(() => {
        expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            method: "PUT",
            url: "/v1/users/test_user_id",
            data: { name: "John Doe", email: "john@example.com" },
          }),
        );
      });
    });
  });

  describe("enabled prop", () => {
    test("renders children without authentication when enabled is false", () => {
      const TestChild = () => <div data-testid="child">Child content</div>;

      const { getByTestId } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id" }}
          enabled={false}
        >
          <TestChild />
        </KnockProvider>,
      );

      expect(getByTestId("child")).toHaveTextContent("Child content");
      // Verify no API calls were made (no authentication)
      expect(mockApiClient.makeRequest).not.toHaveBeenCalled();
    });

    test("authenticates normally when enabled is true (default)", () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return <div data-testid="consumer-msg">API Key: {knock.apiKey}</div>;
      };

      const { getByTestId } = render(
        <KnockProvider apiKey="test_api_key" user={{ id: "test_user_id" }}>
          <TestConsumer />
        </KnockProvider>,
      );

      expect(getByTestId("consumer-msg")).toHaveTextContent(
        "API Key: test_api_key",
      );
    });

    test("authenticates normally when enabled is explicitly true", () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return <div data-testid="consumer-msg">API Key: {knock.apiKey}</div>;
      };

      const { getByTestId } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id" }}
          enabled={true}
        >
          <TestConsumer />
        </KnockProvider>,
      );

      expect(getByTestId("consumer-msg")).toHaveTextContent(
        "API Key: test_api_key",
      );
    });

    test("useKnockClient returns unauthenticated client when enabled is false", () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return (
          <div data-testid="consumer-msg">
            API Key: {knock.apiKey}, Authenticated: {String(knock.isAuthenticated())}
          </div>
        );
      };

      const { getByTestId } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id" }}
          enabled={false}
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Client should exist but not be authenticated
      expect(getByTestId("consumer-msg")).toHaveTextContent("API Key: test_api_key");
      expect(getByTestId("consumer-msg")).toHaveTextContent("Authenticated: false");
    });

    test("toggling enabled from false to true initializes authentication", async () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return (
          <div data-testid="consumer-msg">
            Authenticated: {String(knock.isAuthenticated())}
          </div>
        );
      };

      const { getByTestId, rerender } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "John" }}
          enabled={false}
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Should not be authenticated initially
      expect(getByTestId("consumer-msg")).toHaveTextContent("Authenticated: false");
      expect(mockApiClient.makeRequest).not.toHaveBeenCalled();

      // Enable the provider
      rerender(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id", name: "John" }}
          enabled={true}
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Wait for the effect to complete
      await waitFor(() => {
        expect(getByTestId("consumer-msg")).toHaveTextContent("Authenticated: true");
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          url: "/v1/users/test_user_id",
          data: { name: "John" },
        }),
      );
    });

    test("toggling enabled from true to false calls resetAuthentication", async () => {
      const TestConsumer = () => {
        const knock = useKnockClient();
        return (
          <div data-testid="consumer-msg">
            API Key: {knock.apiKey}, Authenticated: {String(knock.isAuthenticated())}
          </div>
        );
      };

      const { getByTestId, rerender } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id" }}
          enabled={true}
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Initially authenticated
      expect(getByTestId("consumer-msg")).toHaveTextContent("Authenticated: true");

      // Spy on resetAuthentication and have it actually clear the auth state
      const resetAuthSpy = vi.spyOn(knock, "resetAuthentication").mockImplementation(() => {
        knock.userId = undefined;
        knock.userToken = undefined;
        knock.feeds.teardownInstances();
        knock.teardown();
      });

      // Disable the provider
      rerender(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id" }}
          enabled={false}
        >
          <TestConsumer />
        </KnockProvider>,
      );

      // Wait for the effect to complete
      await waitFor(() => {
        expect(resetAuthSpy).toHaveBeenCalled();
      });

      // Client still exists but not authenticated
      expect(getByTestId("consumer-msg")).toHaveTextContent("API Key: test_api_key");
      expect(getByTestId("consumer-msg")).toHaveTextContent("Authenticated: false");
    });

    test("i18n context is still available when enabled is false", () => {
      const TestChild = () => {
        const { t, locale } = useTranslations();
        return (
          <div data-testid="i18n-test">
            Locale: {locale}, Translation: {t("archiveNotification")}
          </div>
        );
      };

      const { getByTestId } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id" }}
          enabled={false}
        >
          <TestChild />
        </KnockProvider>,
      );

      // i18n should still work (with default locale and translations)
      expect(getByTestId("i18n-test")).toHaveTextContent("Locale: en");
      expect(getByTestId("i18n-test")).toHaveTextContent(
        "Translation: Archive this notification",
      );
    });

    test("child providers can render when enabled is false", () => {
      const TestChild = () => {
        const knock = useKnockClient();
        return (
          <div data-testid="feed-test">
            Authenticated: {String(knock.isAuthenticated())}
          </div>
        );
      };

      const { getByTestId } = render(
        <KnockProvider
          apiKey="test_api_key"
          user={{ id: "test_user_id" }}
          enabled={false}
        >
          <KnockFeedProvider feedId="test-feed-id">
            <TestChild />
          </KnockFeedProvider>
        </KnockProvider>,
      );

      // Child provider should render successfully
      expect(getByTestId("feed-test")).toHaveTextContent("Authenticated: false");
      // No API requests should be made
      expect(mockApiClient.makeRequest).not.toHaveBeenCalled();
    });
  });
});
