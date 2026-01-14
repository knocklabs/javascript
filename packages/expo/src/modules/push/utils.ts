import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExpoConstants = typeof Constants & Record<string, any>;

/**
 * Default notification behavior when a notification is received.
 */
export const DEFAULT_NOTIFICATION_BEHAVIOR: Notifications.NotificationBehavior =
  {
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  };

/**
 * Get the Expo project ID from various possible sources.
 * Different Expo SDK versions and configurations store this differently.
 */
export function getProjectId(): string | null {
  const constants = Constants as ExpoConstants;

  // Try Constants.expoConfig.extra.eas.projectId (common in EAS builds)
  if (constants.expoConfig?.extra?.eas?.projectId) {
    return constants.expoConfig.extra.eas.projectId;
  }

  // Try Constants.easConfig?.projectId (available in newer SDK versions)
  if (constants.easConfig?.projectId) {
    return constants.easConfig.projectId;
  }

  // Try Constants.manifest?.extra?.eas?.projectId (older SDK versions)
  if (constants.manifest?.extra?.eas?.projectId) {
    return constants.manifest.extra.eas.projectId;
  }

  // Try Constants.manifest2?.extra?.eas?.projectId (Expo SDK 46+)
  if (constants.manifest2?.extra?.eas?.projectId) {
    return constants.manifest2.extra.eas.projectId;
  }

  return null;
}

/**
 * Request push notification permissions if not already granted.
 * @returns The permission status string
 */
export async function requestPushPermission(): Promise<string> {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") {
    return existingStatus;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/**
 * Get the Expo push token for this device.
 * @returns The push token or null if unable to get one
 */
export async function getExpoPushToken(): Promise<string | null> {
  const projectId = getProjectId();

  if (!projectId) {
    console.error(
      "[Knock] Expo Project ID is not defined in the app configuration. " +
        "Make sure you have configured your project with EAS. " +
        "The projectId should be in app.json/app.config.js at extra.eas.projectId.",
    );
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token?.data ?? null;
}

/**
 * Set up the default Android notification channel.
 */
export async function setupDefaultAndroidChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

/**
 * Check if the current environment supports push notifications.
 * @returns true if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return Device.isDevice;
}

/**
 * Check if the current platform is Android.
 */
export function isAndroid(): boolean {
  return Platform.OS === "android";
}

/**
 * Request permissions and get a push token.
 * Handles Android-specific channel setup and provides appropriate error messaging.
 *
 * @param setupAndroidChannel - Function to set up the Android notification channel
 * @returns The push token string or null if registration failed
 */
export async function registerForPushNotifications(
  setupAndroidChannel: () => Promise<void> = setupDefaultAndroidChannel,
): Promise<string | null> {
  // Check for device support
  if (!isPushNotificationSupported()) {
    console.warn(
      "[Knock] Must use physical device for Push Notifications. " +
        "Push notifications are not supported on emulators/simulators.",
    );
    return null;
  }

  // Setup Android notification channel before requesting permissions
  // This is REQUIRED for Android 13+ to show the permission prompt
  if (isAndroid()) {
    await setupAndroidChannel();
  }

  const permissionStatus = await requestPushPermission();

  if (permissionStatus !== "granted") {
    console.warn(
      `[Knock] Push notification permission not granted. Status: ${permissionStatus}. ` +
        "User may have denied the permission or the system blocked it.",
    );
    return null;
  }

  try {
    return await getExpoPushToken();
  } catch (error) {
    console.error("[Knock] Error getting Expo push token:", error);

    if (isAndroid()) {
      console.error(
        "[Knock] Android push token registration failed. Common causes:\n" +
          "1. FCM is not configured (google-services.json missing)\n" +
          "2. Running on an emulator\n" +
          "3. Network connectivity issues\n" +
          "4. expo-notifications plugin not configured in app.json",
      );
    }

    return null;
  }
}
