import { Message, MessageEngagementStatus } from "@knocklabs/client";
import { useKnockClient } from "@knocklabs/react-core";
import {
  KnockPushNotificationProvider,
  usePushNotifications,
} from "@knocklabs/react-native";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  KnockExpoPushNotificationContextType,
  KnockExpoPushNotificationProviderProps,
} from "./types";
import {
  DEFAULT_NOTIFICATION_BEHAVIOR,
  registerForPushNotifications as registerForPushNotificationsUtil,
  setupDefaultAndroidChannel,
} from "./utils";

// Re-export types for consumers
export type {
  KnockExpoPushNotificationContextType,
  KnockExpoPushNotificationProviderProps,
} from "./types";

const KnockExpoPushNotificationContext = createContext<
  KnockExpoPushNotificationContextType | undefined
>(undefined);

/**
 * Hook to access push notification functionality within a KnockExpoPushNotificationProvider.
 * @throws Error if used outside of a KnockExpoPushNotificationProvider
 */
export function useExpoPushNotifications(): KnockExpoPushNotificationContextType {
  const context = useContext(KnockExpoPushNotificationContext);

  if (context === undefined) {
    throw new Error(
      "[Knock] useExpoPushNotifications must be used within a KnockExpoPushNotificationProvider",
    );
  }

  return context;
}

/**
 * Internal provider component that handles all the Expo push notification logic.
 */
const InternalExpoPushNotificationProvider: React.FC<
  KnockExpoPushNotificationProviderProps
> = ({
  knockExpoChannelId,
  customNotificationHandler,
  setupAndroidNotificationChannel = setupDefaultAndroidChannel,
  children,
  autoRegister = true,
}) => {
  const knockClient = useKnockClient();
  const { registerPushTokenToChannel, unregisterPushTokenFromChannel } =
    usePushNotifications();

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Use refs for handlers to avoid re-running effects when handlers change
  const notificationReceivedHandlerRef = useRef<
    (notification: Notifications.Notification) => void
  >(() => {});

  const notificationTappedHandlerRef = useRef<
    (response: Notifications.NotificationResponse) => void
  >(() => {});

  /**
   * Register a handler to be called when a notification is received in the foreground.
   */
  const onNotificationReceived = useCallback(
    (handler: (notification: Notifications.Notification) => void) => {
      notificationReceivedHandlerRef.current = handler;
    },
    [],
  );

  /**
   * Register a handler to be called when a notification is tapped.
   */
  const onNotificationTapped = useCallback(
    (handler: (response: Notifications.NotificationResponse) => void) => {
      notificationTappedHandlerRef.current = handler;
    },
    [],
  );

  /**
   * Manually trigger push notification registration.
   * Returns the push token if successful, or null if registration failed.
   */
  const registerForPushNotifications = useCallback(async (): Promise<
    string | null
  > => {
    try {
      knockClient.log("[Knock] Registering for push notifications");

      const token = await registerForPushNotificationsUtil(
        setupAndroidNotificationChannel,
      );

      if (token) {
        knockClient.log(`[Knock] Push token received: ${token}`);
        setExpoPushToken(token);
        return token;
      }

      return null;
    } catch (error) {
      console.error("[Knock] Error registering for push notifications:", error);
      return null;
    }
  }, [knockClient, setupAndroidNotificationChannel]);

  /**
   * Update the Knock message status when a notification is received or interacted with.
   * Only updates status for notifications that originated from Knock (have a knock_message_id).
   */
  const updateMessageStatus = useCallback(
    async (
      notification: Notifications.Notification,
      status: MessageEngagementStatus,
    ): Promise<Message | void> => {
      const messageId = notification.request.content.data?.[
        "knock_message_id"
      ] as string | undefined;

      // Skip status update if this isn't a Knock notification
      // Fixes issue: https://github.com/knocklabs/javascript/issues/589
      if (!messageId) {
        knockClient.log(
          "[Knock] Skipping status update for non-Knock notification",
        );
        return;
      }

      return knockClient.messages.updateStatus(messageId, status);
    },
    [knockClient],
  );

  // Set up the notification handler for foreground notifications
  useEffect(() => {
    const handleNotification = customNotificationHandler
      ? customNotificationHandler
      : async () => DEFAULT_NOTIFICATION_BEHAVIOR;

    Notifications.setNotificationHandler({ handleNotification });
  }, [customNotificationHandler]);

  // Auto-register for push notifications on mount if enabled
  useEffect(() => {
    if (!autoRegister) {
      return;
    }

    let isMounted = true;

    const register = async () => {
      try {
        const token = await registerForPushNotifications();

        if (token && isMounted) {
          await registerPushTokenToChannel(token, knockExpoChannelId);
          knockClient.log("[Knock] Push token registered with Knock channel");
        }
      } catch (error) {
        console.error("[Knock] Error during auto-registration:", error);
      }
    };

    register();

    return () => {
      isMounted = false;
    };
  }, [
    autoRegister,
    knockExpoChannelId,
    registerForPushNotifications,
    registerPushTokenToChannel,
    knockClient,
  ]);

  // Set up notification listeners for received and tapped notifications
  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        knockClient.log("[Knock] Notification received in foreground");
        updateMessageStatus(notification, "interacted");
        notificationReceivedHandlerRef.current(notification);
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        knockClient.log("[Knock] Notification was tapped");
        updateMessageStatus(response.notification, "interacted");
        notificationTappedHandlerRef.current(response);
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [knockClient, updateMessageStatus]);

  const contextValue: KnockExpoPushNotificationContextType = {
    expoPushToken,
    registerForPushNotifications,
    registerPushTokenToChannel,
    unregisterPushTokenFromChannel,
    onNotificationReceived,
    onNotificationTapped,
  };

  return (
    <KnockExpoPushNotificationContext.Provider value={contextValue}>
      {children}
    </KnockExpoPushNotificationContext.Provider>
  );
};

/**
 * Provider component for Expo push notifications with Knock.
 *
 * Wraps the internal provider with the base KnockPushNotificationProvider
 * to provide full push notification functionality.
 *
 * @example
 * ```tsx
 * <KnockProvider apiKey="your-api-key" userId="user-id">
 *   <KnockExpoPushNotificationProvider knockExpoChannelId="your-channel-id">
 *     <App />
 *   </KnockExpoPushNotificationProvider>
 * </KnockProvider>
 * ```
 */
export const KnockExpoPushNotificationProvider: React.FC<
  KnockExpoPushNotificationProviderProps
> = (props) => {
  return (
    <KnockPushNotificationProvider>
      <InternalExpoPushNotificationProvider {...props} />
    </KnockPushNotificationProvider>
  );
};
