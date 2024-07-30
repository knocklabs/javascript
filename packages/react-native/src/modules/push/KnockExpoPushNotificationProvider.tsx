import {
  ChannelData,
  Message,
  MessageEngagementStatus,
} from "@knocklabs/client";
import { useKnockClient } from "@knocklabs/react-core";
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

export interface KnockExpoPushNotificationContextType {
  expoPushToken: string | null;
  registerForPushNotifications: () => Promise<void>;
  registerPushTokenToChannel(token: string, channelId: string): Promise<void>;
  unregisterPushTokenFromChannel(
    token: string,
    channelId: string,
  ): Promise<void>;
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

async function requestPermissionAndGetPushToken(): Promise<Notifications.ExpoPushToken | null> {
  // Check for device support
  if (!Device.isDevice) {
    console.warn("[Knock] Must use physical device for Push Notifications");
    return null;
  }

  const permissionStatus = await requestPushPermissionIfNeeded();

  if (permissionStatus !== "granted") {
    console.warn("[Knock] Push notification permission not granted");
    return null;
  }

  return getExpoPushToken();
}

export const KnockExpoPushNotificationProvider: React.FC<
  KnockExpoPushNotificationProviderProps
> = ({ knockExpoChannelId, customNotificationHandler, children }) => {
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

  const registerForPushNotifications = useCallback(async (): Promise<void> => {
    try {
      knockClient.log(`[Knock] Registering for push notifications`);
      const token = await requestPermissionAndGetPushToken();
      knockClient.log(`[Knock] Token received: ${token?.data}`);
      if (token?.data) {
        knockClient.log(`[Knock] Setting push token: ${token.data}`);
        setExpoPushToken(token.data);
      }
    } catch (error) {
      console.error(`[Knock] Error registering for push notifications:`, error);
    }
  }, []);

  const updateKnockMessageStatusFromNotification = useCallback(
    async (
      notification: Notifications.Notification,
      status: MessageEngagementStatus,
    ): Promise<Message> => {
      const messageId = notification.request.content.data["knock_message_id"];
      return knockClient.messages.updateStatus(messageId, status);
    },
    [knockClient],
  );

  const registerNewTokenDataOnServer = useCallback(
    async (tokens: string[], channelId: string): Promise<ChannelData> => {
      return knockClient.user.setChannelData({
        channelId: channelId,
        channelData: { tokens: tokens },
      });
    },
    [knockClient],
  );

  const registerPushTokenToChannel = useCallback(
    async (token: string, channelId: string): Promise<void> => {
      knockClient.user
        .getChannelData({ channelId: channelId })
        .then((result: ChannelData) => {
          const tokens: string[] = result.data["tokens"];
          if (!tokens.includes(token)) {
            tokens.push(token);
            return registerNewTokenDataOnServer(tokens, channelId);
          }
          knockClient.log("[Knock] registerPushTokenToChannel success");
        })
        .catch((_) => {
          // No data registered on that channel for that user, we'll create a new record
          return registerNewTokenDataOnServer([token], channelId);
        });
    },
    [knockClient, registerNewTokenDataOnServer],
  );

  const unregisterPushTokenFromChannel = useCallback(
    async (token: string, channelId: string): Promise<void> => {
      knockClient.user
        .getChannelData({ channelId: channelId })
        .then((result: ChannelData) => {
          const tokens: string[] = result.data["tokens"];
          const updatedTokens = tokens.filter(
            (channelToken) => channelToken !== token,
          );
          knockClient.log("unregisterPushTokenFromChannel success");
          return registerNewTokenDataOnServer(updatedTokens, channelId);
        })
        .catch((error) => {
          console.error(
            `[Knock] Error unregistering push token from channel:`,
            error,
          );
        });
    },
    [knockClient, registerNewTokenDataOnServer],
  );

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification:
        customNotificationHandler ?? defaultNotificationHandler,
    });

    registerForPushNotifications()
      .then(() => {
        if (expoPushToken) {
          registerPushTokenToChannel(expoPushToken, knockExpoChannelId)
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
      Notifications.removeNotificationSubscription(
        notificationReceivedSubscription,
      );
      Notifications.removeNotificationSubscription(
        notificationResponseSubscription,
      );
    };

    // TODO: Remove when possible and ensure dependency array is correct
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    registerForPushNotifications,
    notificationReceivedHandler,
    notificationTappedHandler,
    customNotificationHandler,
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

export const useExpoPushNotifications =
  (): KnockExpoPushNotificationContextType => {
    const context = useContext(KnockExpoPushNotificationContext);
    if (context === undefined) {
      throw new Error(
        "[Knock] useExpoPushNotifications must be used within a PushNotificationProvider",
      );
    }
    return context;
  };
