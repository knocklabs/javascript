import { render, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";

import {
  KnockExpoPushNotificationProvider,
  useExpoPushNotifications,
} from "../../../src";

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

  test("renders with custom Android notification channel setup", async () => {
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

    // Wait for the custom setup to be called during registration
    await waitFor(() => {
      expect(customSetup).toHaveBeenCalled();
    });
  });


  test("does not register when autoRegister is false", () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    const { getByTestId } = render(
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    expect(getByTestId("test-child")).toBeInTheDocument();
  });

  test("useExpoPushNotifications provides context values", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider knockExpoChannelId="test-channel-id">
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), { wrapper });

    expect(result.current).toHaveProperty("expoPushToken");
    expect(result.current).toHaveProperty("registerForPushNotifications");
    expect(result.current).toHaveProperty("registerPushTokenToChannel");
    expect(result.current).toHaveProperty("unregisterPushTokenFromChannel");
    expect(result.current).toHaveProperty("onNotificationReceived");
    expect(result.current).toHaveProperty("onNotificationTapped");
  });

  test("useExpoPushNotifications throws error when used outside provider", () => {
    expect(() => {
      renderHook(() => useExpoPushNotifications());
    }).toThrow(
      "[Knock] useExpoPushNotifications must be used within a KnockExpoPushNotificationProvider",
    );
  });

  test("registerForPushNotifications can be called manually", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), { wrapper });

    const token = await result.current.registerForPushNotifications();

    expect(token).toBe("test-token");
    
    // Wait for state to update
    await waitFor(() => {
      expect(result.current.expoPushToken).toBe("test-token");
    });
  });

  test("onNotificationReceived sets handler", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider knockExpoChannelId="test-channel-id">
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), { wrapper });
    const mockHandler = vi.fn();

    result.current.onNotificationReceived(mockHandler);

    // Handler is set (no error thrown)
    expect(result.current.onNotificationReceived).toBeDefined();
  });

  test("onNotificationTapped sets handler", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider knockExpoChannelId="test-channel-id">
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), { wrapper });
    const mockHandler = vi.fn();

    result.current.onNotificationTapped(mockHandler);

    // Handler is set (no error thrown)
    expect(result.current.onNotificationTapped).toBeDefined();
  });

  test("calls setNotificationChannelAsync on Android devices", async () => {
    // Temporarily mock as Android
    const DeviceMock = await import("expo-device");
    const originalOsName = DeviceMock.osName;
    vi.mocked(DeviceMock).osName = "Android";

    const NotificationsMock = await import("expo-notifications");
    const setChannelSpy = vi.mocked(
      NotificationsMock.setNotificationChannelAsync,
    );
    setChannelSpy.mockClear();

    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    render(
      <KnockExpoPushNotificationProvider knockExpoChannelId="test-channel-id">
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    // Wait for Android channel setup to be called
    await waitFor(() => {
      expect(setChannelSpy).toHaveBeenCalledWith("default", {
        name: "Default",
        importance: NotificationsMock.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    });

    // Restore original osName
    vi.mocked(DeviceMock).osName = originalOsName;
  });

  test("does not call setNotificationChannelAsync on non-Android devices", async () => {
    // Ensure it's set as iOS
    const DeviceMock = await import("expo-device");
    vi.mocked(DeviceMock).osName = "iOS";

    const NotificationsMock = await import("expo-notifications");
    const setChannelSpy = vi.mocked(
      NotificationsMock.setNotificationChannelAsync,
    );
    setChannelSpy.mockClear();

    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    render(
      <KnockExpoPushNotificationProvider knockExpoChannelId="test-channel-id">
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not be called on iOS
    expect(setChannelSpy).not.toHaveBeenCalled();
  });

  test("handles errors during push token registration", async () => {
    const NotificationsMock = await import("expo-notifications");
    const getTokenSpy = vi.mocked(NotificationsMock.getExpoPushTokenAsync);
    
    // Mock a failure
    getTokenSpy.mockRejectedValueOnce(new Error("Token fetch failed"));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), { wrapper });

    const token = await result.current.registerForPushNotifications();

    expect(token).toBeNull();

    // Restore mock
    getTokenSpy.mockResolvedValue({ data: "test-token" });
  });

  test("handles missing Expo config gracefully", async () => {
    const ConstantsMock = await import("expo-constants");
    const originalConfig = ConstantsMock.default.expoConfig;
    
    // Mock missing config
    vi.mocked(ConstantsMock.default).expoConfig = undefined;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), { wrapper });

    const token = await result.current.registerForPushNotifications();

    expect(token).toBeNull();

    // Restore original config
    vi.mocked(ConstantsMock.default).expoConfig = originalConfig;
  });

});
