import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { KnockProvider, KnockSlackProvider, useKnockSlackClient } from "../../src";

// Mock the connection-status hook to isolate the provider (and avoid a real
// authCheck request). The provider imports it via the slack barrel, so mock the
// leaf module it ultimately resolves to.
vi.mock("../../src/modules/slack/hooks/useSlackConnectionStatus", () => ({
  default: () => ({
    connectionStatus: "connected",
    setConnectionStatus: vi.fn(),
    errorLabel: null,
    setErrorLabel: vi.fn(),
    actionLabel: null,
    setActionLabel: vi.fn(),
  }),
}));

describe("KnockSlackProvider", () => {
  test("renders consumer with correct context", () => {
    const TestConsumer = () => {
      const { knockSlackChannelId, tenantId, connectionStatus } =
        useKnockSlackClient();

      return (
        <div data-testid="consumer-msg">
          {knockSlackChannelId}-{tenantId}-{connectionStatus}
        </div>
      );
    };

    const { getByTestId } = render(
      <KnockProvider apiKey="test_api_key" userId="user_1">
        <KnockSlackProvider
          knockSlackChannelId="channel_123"
          tenantId="tenant_987"
        >
          <TestConsumer />
        </KnockSlackProvider>
      </KnockProvider>,
    );

    expect(getByTestId("consumer-msg")).toHaveTextContent(
      "channel_123-tenant_987-connected",
    );
  });
});
