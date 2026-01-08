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
  osName: "iOS",
}));

vi.mock("expo-notifications", () => ({
  setNotificationHandler: vi.fn(),
  getPermissionsAsync: vi.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: vi.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: vi.fn().mockResolvedValue({ data: "test-token" }),
  setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
  addNotificationReceivedListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
  addNotificationResponseReceivedListener: vi
    .fn()
    .mockReturnValue({ remove: vi.fn() }),
  AndroidImportance: {
    MAX: 5,
  },
}));

// Mock the react-native providers
vi.mock("@knocklabs/react-native", () => ({
  KnockPushNotificationProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="mock-react-native-provider">{children}</div>,
  usePushNotifications: () => ({
    registerPushTokenToChannel: vi.fn().mockResolvedValue(undefined),
    unregisterPushTokenFromChannel: vi.fn().mockResolvedValue(undefined),
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

  test("renders with custom Android notification channel setup", () => {
    const customSetup = vi.fn().mockResolvedValue(undefined);
    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    const { getByTestId } = render(
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        setupAndroidNotificationChannel={customSetup}
      >
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    expect(getByTestId("test-child")).toBeInTheDocument();
  });
});
