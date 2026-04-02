import Constants, { ExecutionEnvironment } from "expo-constants";
import type * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * The type of the expo-notifications module when successfully loaded.
 */
export type NotificationsModule = typeof Notifications;

// Type aliases derived from the expo-notifications namespace so that consumers
// access all expo-notifications types through this module rather than importing
// from the package directly (which can trigger runtime side-effects).
export type Notification = Notifications.Notification;
export type NotificationResponse = Notifications.NotificationResponse;
export type NotificationBehavior = Notifications.NotificationBehavior;

/**
 * Lazily load the expo-notifications module.
 *
 * In Expo SDK 55+, `import * as Notifications from "expo-notifications"` triggers
 * a top-level side-effect (DevicePushTokenAutoRegistration.fx.ts) that calls
 * `addPushTokenListener()`, which throws on Android Expo Go where push notification
 * functionality has been removed (since SDK 53).
 *
 * We detect Android Expo Go before attempting the require() and skip it entirely,
 * since the throw from expo-notifications bypasses JavaScript try/catch via
 * React Native's global error handler.
 *
 * On all other environments (iOS Expo Go, development builds, production),
 * expo-notifications loads normally.
 */

// Cache the module after the first load to avoid repeated require() calls and
// environment detection checks on every access. The three states are:
//   undefined = not yet loaded (initial)
//   null      = unavailable (Android Expo Go or load failure)
//   module    = successfully loaded
let cachedModule: NotificationsModule | null | undefined = undefined;

function isAndroidExpoGo(): boolean {
  return (
    Platform.OS === "android" &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

// Abstracted for testability — Vitest cannot intercept require() calls
// inside dynamically imported modules after vi.resetModules().
/* v8 ignore next 3 -- default require is replaced in tests via _resetForTesting */
let requireNotifications: () => NotificationsModule = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("expo-notifications") as NotificationsModule;

export function getNotificationsModule(): NotificationsModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  if (isAndroidExpoGo()) {
    console.warn(
      "[Knock] Push notifications (remote notifications) are not available in Expo Go " +
        "on Android. This is an Expo platform limitation — push notification support was " +
        "removed from Expo Go on Android in SDK 53. Push features (token registration, " +
        "notification listeners) will be disabled, but all other Knock features will " +
        "continue to work.\n\n" +
        "To use push notifications on Android, use a development build instead of Expo Go: " +
        "https://docs.expo.dev/develop/development-builds/introduction/",
    );
    cachedModule = null;
    return cachedModule;
  }

  try {
    cachedModule = requireNotifications();
  } catch {
    console.warn(
      "[Knock] expo-notifications could not be loaded. " +
        "Push notification features will be disabled.",
    );
    cachedModule = null;
  }

  return cachedModule;
}

/**
 * @internal Test-only — reset the cached module and optionally override
 * the require function used to load expo-notifications.
 */
export function _resetForTesting(
  overrideRequire?: () => NotificationsModule,
): void {
  cachedModule = undefined;
  if (overrideRequire) {
    requireNotifications = overrideRequire;
  }
}
