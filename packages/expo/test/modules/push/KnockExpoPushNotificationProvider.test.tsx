import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";

import { KnockExpoPushNotificationProvider } from "../../../src";

vi.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        eas: {
          projectId: "test-project-id",
        },
      },
    },
  },
}));

vi.mock("expo-device", () => ({
  isDevice: true,
}));

vi.mock("expo-notifications", () => ({
  setNotificationHandler: vi.fn(),
  getPermissionsAsync: vi.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: vi.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: vi.fn().mockResolvedValue({ data: "test-token" }),
  addNotificationReceivedListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
  addNotificationResponseReceivedListener: vi
    .fn()
    .mockReturnValue({ remove: vi.fn() }),
}));

// Mock the react-native providers
vi.mock("@knocklabs/react-native", () => ({
  KnockPushNotificationProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="mock-react-native-provider">{children}</div>,
  usePushNotifications: () => ({
    registerPushTokenToChannel: vi.fn(),
    unregisterPushTokenFromChannel: vi.fn(),
  }),
}));

vi.mock("@knocklabs/react-core", () => ({
  useKnockClient: () => ({
    log: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(true),
    messages: {
      updateStatus: vi.fn(),
    },
  }),
}));

describe("KnockExpoPushNotificationProvider", () => {
  test("renders as expected", () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    const { getByTestId } = render(
      <KnockExpoPushNotificationProvider knockExpoChannelId="test-channel-id">
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    expect(getByTestId("test-child")).toBeInTheDocument();

    expect(getByTestId("mock-react-native-provider")).toBeInTheDocument();
  });

  test("renders with custom notification handler", () => {
    const customHandler = vi.fn();
    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    const { getByTestId } = render(
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        customNotificationHandler={customHandler}
      >
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    expect(getByTestId("test-child")).toBeInTheDocument();
  });
});
