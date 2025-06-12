import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";

import { KnockMsTeamsProvider, useKnockMsTeamsClient } from "../../src";
import { KnockProvider } from "../../src";

// Mock useMsTeamsConnectionStatus to isolate the provider behaviour
vi.mock("../../src/modules/ms-teams/hooks", () => ({
  useMsTeamsConnectionStatus: () => ({
    connectionStatus: "connected",
    setConnectionStatus: vi.fn(),
    errorLabel: null,
    setErrorLabel: vi.fn(),
    actionLabel: null,
    setActionLabel: vi.fn(),
  }),
}));

describe("KnockMsTeamsProvider", () => {
  test("renders consumer with correct context", () => {
    const TestConsumer = () => {
      const { knockMsTeamsChannelId, tenantId, connectionStatus } =
        useKnockMsTeamsClient();

      return (
        <div data-testid="consumer-msg">
          {knockMsTeamsChannelId}-{tenantId}-{connectionStatus}
        </div>
      );
    };

    const { getByTestId } = render(
      <KnockProvider apiKey="test_api_key" userId="user_1">
        <KnockMsTeamsProvider
          knockMsTeamsChannelId="channel_123"
          tenantId="tenant_987"
        >
          <TestConsumer />
        </KnockMsTeamsProvider>
      </KnockProvider>,
    );

    expect(getByTestId("consumer-msg")).toHaveTextContent(
      "channel_123-tenant_987-connected",
    );
  });
});
