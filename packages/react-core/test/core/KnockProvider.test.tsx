import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { createMockKnock } from "../../../client/test/test-utils/mocks";
import { KnockProvider, useKnockClient } from "../../src";

// Create a mock Knock instance that we'll use across tests
const { knock, mockApiClient } = createMockKnock("test_api_key");

// Mock the Knock client constructor to return our mock instance
vi.mock("@knocklabs/client", () => ({
  default: vi.fn().mockImplementation(() => knock),
}));

// Mock API responses
mockApiClient.makeRequest.mockImplementation(
  async ({ method, url, params }) => {
    if (method === "PUT" && url.match(/\/v1\/users\/.+/)) {
      return {
        statusCode: "ok",
        body: { id: knock.userId, ...params },
      };
    }
    return { statusCode: "ok", body: {} };
  },
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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
        params: { name: "John" },
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
        params: { name: "Jane" },
      }),
    );
  });
});
