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

// Mock react-native Platform
vi.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
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

// Create stable mock functions for usePushNotifications
const mockRegisterPushTokenToChannel = vi.fn().mockResolvedValue(undefined);
const mockUnregisterPushTokenFromChannel = vi.fn().mockResolvedValue(undefined);

// Mock the react-native providers
vi.mock("@knocklabs/react-native", () => ({
  KnockPushNotificationProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="mock-react-native-provider">{children}</div>,
  usePushNotifications: () => ({
    registerPushTokenToChannel: mockRegisterPushTokenToChannel,
    unregisterPushTokenFromChannel: mockUnregisterPushTokenFromChannel,
  }),
}));

// Create a stable mock for knockClient
const mockKnockClient = {
  log: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(true),
  messages: {
    updateStatus: vi.fn(),
  },
};

vi.mock("@knocklabs/react-core", () => ({
  useKnockClient: () => mockKnockClient,
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
    // Set platform to Android so the custom setup function gets called
    const ReactNativeMock = await import("react-native");
    const originalOS = ReactNativeMock.Platform.OS;
    vi.mocked(ReactNativeMock.Platform).OS = "android";

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

    // Restore original Platform.OS
    vi.mocked(ReactNativeMock.Platform).OS = originalOS;
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

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });
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

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });
    const mockHandler = vi.fn();

    result.current.onNotificationTapped(mockHandler);

    // Handler is set (no error thrown)
    expect(result.current.onNotificationTapped).toBeDefined();
  });

  test("calls setNotificationChannelAsync on Android devices", async () => {
    // Temporarily mock as Android using Platform.OS
    const ReactNativeMock = await import("react-native");
    const originalOS = ReactNativeMock.Platform.OS;
    vi.mocked(ReactNativeMock.Platform).OS = "android";

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

    // Restore original Platform.OS
    vi.mocked(ReactNativeMock.Platform).OS = originalOS;
  });

  test("does not call setNotificationChannelAsync on non-Android devices", async () => {
    // Ensure it's set as iOS using Platform.OS
    const ReactNativeMock = await import("react-native");
    vi.mocked(ReactNativeMock.Platform).OS = "ios";

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

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });

    const token = await result.current.registerForPushNotifications();

    expect(token).toBeNull();

    // Restore original config
    vi.mocked(ConstantsMock.default).expoConfig = originalConfig;
  });

  test("returns null when running on simulator/non-device", async () => {
    const DeviceMock = await import("expo-device");
    const originalIsDevice = DeviceMock.isDevice;

    // Mock as non-device (simulator)
    vi.mocked(DeviceMock).isDevice = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });

    const token = await result.current.registerForPushNotifications();

    expect(token).toBeNull();

    // Restore original value
    vi.mocked(DeviceMock).isDevice = originalIsDevice;
  });

  test("sets up notification listeners on mount", async () => {
    const NotificationsMock = await import("expo-notifications");
    const addReceivedListenerSpy = vi.mocked(
      NotificationsMock.addNotificationReceivedListener,
    );
    const addResponseListenerSpy = vi.mocked(
      NotificationsMock.addNotificationResponseReceivedListener,
    );

    addReceivedListenerSpy.mockClear();
    addResponseListenerSpy.mockClear();

    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    render(
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    // Verify listeners were set up
    expect(addReceivedListenerSpy).toHaveBeenCalledTimes(1);
    expect(addResponseListenerSpy).toHaveBeenCalledTimes(1);
  });

  test("cleans up notification listeners on unmount", async () => {
    const removeReceivedListener = vi.fn();
    const removeResponseListener = vi.fn();

    const NotificationsMock = await import("expo-notifications");
    vi.mocked(
      NotificationsMock.addNotificationReceivedListener,
    ).mockReturnValue({
      remove: removeReceivedListener,
    });
    vi.mocked(
      NotificationsMock.addNotificationResponseReceivedListener,
    ).mockReturnValue({
      remove: removeResponseListener,
    });

    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    const { unmount } = render(
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    // Unmount the component
    unmount();

    // Verify listeners were cleaned up
    expect(removeReceivedListener).toHaveBeenCalled();
    expect(removeResponseListener).toHaveBeenCalled();
  });

  test("notification received listener calls user handler via ref", async () => {
    const NotificationsMock = await import("expo-notifications");
    let capturedReceivedCallback: ((notification: unknown) => void) | null =
      null;

    vi.mocked(
      NotificationsMock.addNotificationReceivedListener,
    ).mockImplementation((callback) => {
      capturedReceivedCallback = callback;
      return { remove: vi.fn() };
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });

    // Set up a handler
    const mockHandler = vi.fn();
    result.current.onNotificationReceived(mockHandler);

    // Simulate a notification being received
    const mockNotification = {
      request: { content: { data: {} } },
    };

    if (capturedReceivedCallback) {
      capturedReceivedCallback(mockNotification);
    }

    // Verify the user's handler was called
    expect(mockHandler).toHaveBeenCalledWith(mockNotification);
  });

  test("notification tapped listener calls user handler via ref", async () => {
    const NotificationsMock = await import("expo-notifications");
    let capturedResponseCallback: ((response: unknown) => void) | null = null;

    vi.mocked(
      NotificationsMock.addNotificationResponseReceivedListener,
    ).mockImplementation((callback) => {
      capturedResponseCallback = callback;
      return { remove: vi.fn() };
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={false}
      >
        {children}
      </KnockExpoPushNotificationProvider>
    );

    const { result } = renderHook(() => useExpoPushNotifications(), {
      wrapper,
    });

    // Set up a handler
    const mockHandler = vi.fn();
    result.current.onNotificationTapped(mockHandler);

    // Simulate a notification being tapped
    const mockResponse = {
      notification: { request: { content: { data: {} } } },
    };

    if (capturedResponseCallback) {
      capturedResponseCallback(mockResponse);
    }

    // Verify the user's handler was called
    expect(mockHandler).toHaveBeenCalledWith(mockResponse);
  });

  test("setNotificationHandler is called with custom handler", async () => {
    const NotificationsMock = await import("expo-notifications");
    const setHandlerSpy = vi.mocked(NotificationsMock.setNotificationHandler);
    setHandlerSpy.mockClear();

    const customHandler = vi.fn().mockResolvedValue({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });

    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    render(
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        customNotificationHandler={customHandler}
        autoRegister={false}
      >
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    // Verify setNotificationHandler was called with the custom handler
    expect(setHandlerSpy).toHaveBeenCalledWith({
      handleNotification: customHandler,
    });
  });

  test("auto-registration only runs once on mount", async () => {
    const NotificationsMock = await import("expo-notifications");
    const getTokenSpy = vi.mocked(NotificationsMock.getExpoPushTokenAsync);
    getTokenSpy.mockClear();
    getTokenSpy.mockResolvedValue({ data: "test-token" });

    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    const { rerender } = render(
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={true}
      >
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    // Wait for initial registration
    await waitFor(() => {
      expect(getTokenSpy).toHaveBeenCalledTimes(1);
    });

    // Re-render the component (simulating a parent re-render)
    rerender(
      <KnockExpoPushNotificationProvider
        knockExpoChannelId="test-channel-id"
        autoRegister={true}
      >
        <TestChild />
      </KnockExpoPushNotificationProvider>,
    );

    // Wait a bit to ensure no additional calls
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should still only be called once
    expect(getTokenSpy).toHaveBeenCalledTimes(1);
  });
});
