import { Message, MessageEngagementStatus } from "@knocklabs/client";
import { useKnockClient } from "@knocklabs/react-core";
import {
  type KnockPushNotificationContextType,
  KnockPushNotificationProvider,
  usePushNotifications,
} from "@knocklabs/react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface KnockExpoPushNotificationContextType
  extends KnockPushNotificationContextType {
  expoPushToken: string | null;
  registerForPushNotifications: () => Promise<string | null>;
  onNotificationReceived: (
    handler: (notification: Notifications.Notification) => void,
  ) => void;
  onNotificationTapped: (
    handler: (response: Notifications.NotificationResponse) => void,
  ) => void;
}

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

const defaultNotificationHandler = async (
  _notification: Notifications.Notification,
): Promise<Notifications.NotificationBehavior> => {
  return {
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  };
};

const KnockExpoPushNotificationContext = createContext<
  KnockExpoPushNotificationContextType | undefined
>(undefined);

export interface KnockExpoPushNotificationProviderProps {
  knockExpoChannelId: string;
  customNotificationHandler?: (
    notification: Notifications.Notification,
  ) => Promise<Notifications.NotificationBehavior>;
  children?: React.ReactElement;
  autoRegister?: boolean;
}

async function requestPushPermissionIfNeeded(): Promise<string> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }

  return existingStatus;
}

async function getExpoPushToken(): Promise<Notifications.ExpoPushToken | null> {
  try {
    if (
      !Constants.expoConfig ||
      !Constants.expoConfig.extra ||
      !Constants.expoConfig.extra.eas
    ) {
      console.error(
        "[Knock] Expo Project ID is not defined in the app configuration.",
      );
      return null;
    }
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    return token;
  } catch (error) {
    console.error("[Knock] Error getting Expo push token:", error);
    return null;
  }
}

async function setupAndroidNotificationChannel(): Promise<void> {
  if (Device.osName === "Android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

async function requestPermissionAndGetPushToken(): Promise<Notifications.ExpoPushToken | null> {
  // Check for device support
  if (!Device.isDevice) {
    console.warn("[Knock] Must use physical device for Push Notifications");
    return null;
  }

  // Setup Android notification channel before requesting permissions
  await setupAndroidNotificationChannel();

  const permissionStatus = await requestPushPermissionIfNeeded();

  if (permissionStatus !== "granted") {
    console.warn("[Knock] Push notification permission not granted");
    return null;
  }

  return getExpoPushToken();
}

const InternalKnockExpoPushNotificationProvider: React.FC<
  KnockExpoPushNotificationProviderProps
> = ({
  knockExpoChannelId,
  customNotificationHandler,
  children,
  autoRegister = true,
}) => {
  const { registerPushTokenToChannel, unregisterPushTokenFromChannel } =
    usePushNotifications();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const knockClient = useKnockClient();

  const [notificationReceivedHandler, setNotificationReceivedHandler] =
    useState<(notification: Notifications.Notification) => void>(
      () => () => {},
    );

  const [notificationTappedHandler, setNotificationTappedHandler] = useState<
    (response: Notifications.NotificationResponse) => void
  >(() => () => {});

  const handleNotificationReceived = useCallback(
    (handler: (notification: Notifications.Notification) => void) => {
      setNotificationReceivedHandler(() => handler);
    },
    [],
  );

  const handleNotificationTapped = useCallback(
    (handler: (response: Notifications.NotificationResponse) => void) => {
      setNotificationTappedHandler(() => handler);
    },
    [],
  );

  const registerForPushNotifications = useCallback(async (): Promise<
    string | null
  > => {
    try {
      knockClient.log(`[Knock] Registering for push notifications`);
      const token = await requestPermissionAndGetPushToken();
      knockClient.log(`[Knock] Token received: ${token?.data}`);
      if (token?.data) {
        knockClient.log(`[Knock] Setting push token: ${token.data}`);
        setExpoPushToken(token.data);
        return token.data;
      }
      return null;
    } catch (error) {
      console.error(`[Knock] Error registering for push notifications:`, error);
      return null;
    }
  }, [knockClient]);

  const updateKnockMessageStatusFromNotification = useCallback(
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

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification:
        customNotificationHandler ?? defaultNotificationHandler,
    });

    if (autoRegister) {
      registerForPushNotifications()
        .then((token) => {
          if (token) {
            registerPushTokenToChannel(token, knockExpoChannelId)
              .then((_result) => {
                knockClient.log("[Knock] setChannelData success");
              })
              .catch((_error) => {
                console.error(
                  "[Knock] Error in setting push token or channel data",
                  _error,
                );
              });
          }
        })
        .catch((_error) => {
          console.error(
            "[Knock] Error in setting push token or channel data",
            _error,
          );
        });
    }

    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        knockClient.log(
          "[Knock] Expo Push Notification received in foreground:",
        );
        updateKnockMessageStatusFromNotification(notification, "interacted");
        notificationReceivedHandler(notification);
      });

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        knockClient.log("[Knock] Expo Push Notification was interacted with");
        updateKnockMessageStatusFromNotification(
          response.notification,
          "interacted",
        );
        notificationTappedHandler(response);
      });

    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };

    // TODO: Remove when possible and ensure dependency array is correct
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    registerForPushNotifications,
    notificationReceivedHandler,
    notificationTappedHandler,
    customNotificationHandler,
    autoRegister,
    expoPushToken,
    knockExpoChannelId,
    knockClient,
  ]);

  return (
    <KnockExpoPushNotificationContext.Provider
      value={{
        expoPushToken,
        registerForPushNotifications,
        registerPushTokenToChannel,
        unregisterPushTokenFromChannel,
        onNotificationReceived: handleNotificationReceived,
        onNotificationTapped: handleNotificationTapped,
      }}
    >
      {children}
    </KnockExpoPushNotificationContext.Provider>
  );
};

export const KnockExpoPushNotificationProvider: React.FC<
  KnockExpoPushNotificationProviderProps
> = (props) => {
  return (
    <KnockPushNotificationProvider>
      <InternalKnockExpoPushNotificationProvider {...props} />
    </KnockPushNotificationProvider>
  );
};

export const useExpoPushNotifications =
  (): KnockExpoPushNotificationContextType => {
    const context = useContext(KnockExpoPushNotificationContext);
    if (context === undefined) {
      throw new Error(
        "[Knock] useExpoPushNotifications must be used within a KnockExpoPushNotificationProvider",
      );
    }
    return context;
  };
