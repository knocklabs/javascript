import { fireEvent, render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { SlackAuthButton } from "../../src/modules/slack/components/SlackAuthButton/SlackAuthButton";

const openPopupSpy: ReturnType<typeof vi.fn> = vi.fn();
vi.mock("../../../core/utils", () => {
  return { __esModule: true, openPopupWindow: openPopupSpy };
});

let slackState: { [key: string]: unknown } = {};

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useTranslations: () => ({ t: (k: string) => k }),
    useKnockClient: () => ({ host: "https://api.knock.app" }),
    useSlackAuth: () => ({
      buildSlackAuthUrl: () => "https://slack-auth",
      disconnectFromSlack: vi.fn(),
    }),
    useKnockSlackClient: () => slackState,
  };
});

describe("SlackAuthButton", () => {
  test("disconnected state shows connect", () => {
    slackState = {
      connectionStatus: "disconnected",
      setConnectionStatus: vi.fn(),
      setActionLabel: vi.fn(),
      actionLabel: null,
      errorLabel: null,
      tenantId: "tenant_123",
      knockSlackChannelId: "channel_123",
      popupWindowRef: { current: null },
    };

    const { getByText } = render(<SlackAuthButton slackClientId="cid" />);

    const btn = getByText("slackConnect").closest("button") as HTMLElement;
    fireEvent.click(btn);
  });

  test("error state displays error label", () => {
    slackState = {
      connectionStatus: "error",
      setConnectionStatus: vi.fn(),
      setActionLabel: vi.fn(),
      actionLabel: null,
      errorLabel: "Slack Err",
      tenantId: "tenant_123",
      knockSlackChannelId: "channel_123",
      popupWindowRef: { current: null },
    };

    const { getByText } = render(<SlackAuthButton slackClientId="cid" />);

    expect(getByText("Slack Err")).toBeInTheDocument();
  });
});
