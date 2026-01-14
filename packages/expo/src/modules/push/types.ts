import type { KnockPushNotificationContextType } from "@knocklabs/react-native";
import type * as Notifications from "expo-notifications";
import type React from "react";

/**
 * Context type for the Expo push notification provider.
 * Extends the base push notification context with Expo-specific functionality.
 */
export interface KnockExpoPushNotificationContextType
  extends KnockPushNotificationContextType {
  /** The Expo push token, or null if not yet registered */
  expoPushToken: string | null;

  /** Manually trigger push notification registration */
  registerForPushNotifications: () => Promise<string | null>;

  /** Register a handler for when a notification is received in the foreground */
  onNotificationReceived: (
    handler: (notification: Notifications.Notification) => void,
  ) => void;

  /** Register a handler for when a notification is tapped */
  onNotificationTapped: (
    handler: (response: Notifications.NotificationResponse) => void,
  ) => void;
}

/**
 * Props for the KnockExpoPushNotificationProvider component.
 */
export interface KnockExpoPushNotificationProviderProps {
  /** The Knock channel ID for Expo push notifications */
  knockExpoChannelId: string;

  /**
   * Custom handler for determining how notifications should be displayed.
   * If not provided, notifications will show alerts, play sounds, and set badges.
   */
  customNotificationHandler?: (
    notification: Notifications.Notification,
  ) => Promise<Notifications.NotificationBehavior>;

  /**
   * Custom function to set up the Android notification channel.
   * If not provided, a default channel will be created.
   */
  setupAndroidNotificationChannel?: () => Promise<void>;

  /** Children to render within the provider */
  children?: React.ReactElement;

  /**
   * Whether to automatically register for push notifications on mount.
   * @default true
   */
  autoRegister?: boolean;
}
